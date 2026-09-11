from __future__ import annotations

from dataclasses import replace
import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_health import ProbeOutcome
from maria_runtime.local_status import LocalRuntimeStatusSnapshot, RuntimeProbeState, RuntimeProbeStatus
from maria_runtime.models import ModelSpec

READINESS_SPEC = importlib.util.find_spec("maria_runtime.local_model_readiness")
if READINESS_SPEC is not None:
    from maria_runtime.local_model_readiness import (
        LocalModelReadinessBuilder,
        LocalModelReadinessState,
    )


def model(provider="ollama", **changes):
    evidence = "local-health:ollama/show" if provider == "ollama" else "local-health:lm-studio/models"
    result = ModelSpec(
        name="fixture-model",
        provider=provider,
        local=True,
        capabilities=("chat", "reasoning"),
        context_size=8192,
        reliability=1.0,
        latency_ms=10,
        input_cost_per_million=0.0,
        output_cost_per_million=0.0,
        available=True,
        privacy_level="local",
        evidence_sample_count=3,
        evidence_source=evidence,
    )
    return replace(result, **changes)


def probe(provider, state, *, samples=3, outcome=ProbeOutcome.SUCCESS):
    name = "show" if provider == "ollama" else "models"
    success_count = samples if outcome is ProbeOutcome.SUCCESS else max(0, samples - 1)
    failure_count = samples - success_count
    return RuntimeProbeStatus(
        provider_id=provider,
        probe_name=name,
        state=state,
        sample_count=samples,
        success_count=success_count,
        failure_count=failure_count,
        reliability=(success_count / samples) if samples else None,
        median_success_latency_ms=12 if success_count else None,
        latest_outcome=outcome,
    )


class LocalModelReadinessTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(READINESS_SPEC, "local inference readiness model is missing")

    def test_ready_requires_available_local_chat_model_with_matching_health_evidence(self):
        snapshot = LocalRuntimeStatusSnapshot(
            ollama_inventory=(),
            probes=(probe("ollama", RuntimeProbeState.READY),),
        )
        records = LocalModelReadinessBuilder().build((model(),), runtime_snapshot=snapshot)
        self.assertEqual(len(records), 1)
        record = records[0]
        self.assertEqual(record.state, LocalModelReadinessState.READY)
        self.assertTrue(record.invokable)
        self.assertEqual(record.provider_id, "ollama")
        self.assertEqual(record.model_name, "fixture-model")
        self.assertEqual(record.context_size, 8192)
        self.assertEqual(record.evidence_sample_count, 3)

    def test_runtime_warming_and_degraded_states_block_invocation(self):
        cases = (
            (RuntimeProbeState.UNKNOWN, LocalModelReadinessState.WARMING),
            (RuntimeProbeState.WARMING, LocalModelReadinessState.WARMING),
            (RuntimeProbeState.DEGRADED, LocalModelReadinessState.DEGRADED),
        )
        for runtime_state, expected in cases:
            with self.subTest(runtime_state=runtime_state):
                status = probe("ollama", runtime_state)
                snapshot = LocalRuntimeStatusSnapshot(ollama_inventory=(), probes=(status,))
                record = LocalModelReadinessBuilder().build((model(),), runtime_snapshot=snapshot)[0]
                self.assertEqual(record.state, expected)
                self.assertFalse(record.invokable)

    def test_model_availability_and_verified_provenance_fail_closed(self):
        snapshot = LocalRuntimeStatusSnapshot(
            ollama_inventory=(), probes=(probe("ollama", RuntimeProbeState.READY),)
        )
        cases = (
            (model(available=False), LocalModelReadinessState.UNAVAILABLE),
            (model(evidence_sample_count=None, evidence_source=None), LocalModelReadinessState.EVIDENCE_REQUIRED),
            (model(evidence_sample_count=3, evidence_source="other-source"), LocalModelReadinessState.EVIDENCE_REQUIRED),
            (model(local=False, privacy_level="standard"), LocalModelReadinessState.UNSUPPORTED),
            (model(capabilities=("embedding",)), LocalModelReadinessState.UNSUPPORTED),
        )
        for selected, expected in cases:
            with self.subTest(expected=expected):
                record = LocalModelReadinessBuilder().build((selected,), runtime_snapshot=snapshot)[0]
                self.assertEqual(record.state, expected)
                self.assertFalse(record.invokable)

    def test_lm_studio_uses_models_probe_and_exact_evidence_source(self):
        snapshot = LocalRuntimeStatusSnapshot(
            ollama_inventory=(), probes=(probe("lm-studio", RuntimeProbeState.READY),)
        )
        record = LocalModelReadinessBuilder().build((model("lm-studio"),), runtime_snapshot=snapshot)[0]
        self.assertEqual(record.state, LocalModelReadinessState.READY)
        self.assertTrue(record.invokable)

    def test_missing_provider_probe_is_warming_not_ready(self):
        record = LocalModelReadinessBuilder().build(
            (model(),), runtime_snapshot=LocalRuntimeStatusSnapshot(ollama_inventory=(), probes=())
        )[0]
        self.assertEqual(record.state, LocalModelReadinessState.WARMING)
        self.assertFalse(record.invokable)

    def test_output_is_deterministic_redacted_and_rejects_duplicate_model_identity(self):
        snapshot = LocalRuntimeStatusSnapshot(
            ollama_inventory=(),
            probes=(probe("ollama", RuntimeProbeState.READY), probe("lm-studio", RuntimeProbeState.READY)),
        )
        records = LocalModelReadinessBuilder().build(
            (model("ollama", name="zeta"), model("lm-studio", name="alpha")),
            runtime_snapshot=snapshot,
        )
        self.assertEqual([(item.provider_id, item.model_name) for item in records],
                         [("lm-studio", "alpha"), ("ollama", "zeta")])
        self.assertNotIn("payload", repr(records))
        with self.assertRaises(ValueError):
            LocalModelReadinessBuilder().build((model(), model()), runtime_snapshot=snapshot)

    def test_builder_rejects_invalid_inputs_without_io_or_guessing(self):
        builder = LocalModelReadinessBuilder()
        with self.assertRaises(TypeError):
            builder.build((object(),), runtime_snapshot=LocalRuntimeStatusSnapshot((), ()))
        with self.assertRaises(TypeError):
            builder.build((model(),), runtime_snapshot=object())


if __name__ == "__main__":
    unittest.main()
