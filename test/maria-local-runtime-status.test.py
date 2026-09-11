from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import LocalModelCandidate
from maria_runtime.local_health import LocalHealthEvidenceLedger, ProbeObservation, ProbeOutcome
from maria_runtime.local_status import LocalRuntimeSnapshotBuilder, RuntimeProbeState


class LocalRuntimeStatusSnapshotTests(unittest.TestCase):
    def test_snapshot_is_immutable_sorted_and_redacted(self):
        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=2)
        ledger.record(ProbeObservation.success("ollama", "tags", latency_ms=8, response_bytes=120))
        ledger.record(ProbeObservation.success("ollama", "tags", latency_ms=10, response_bytes=125))
        ledger.record(ProbeObservation.failure("ollama", "show", ProbeOutcome.TIMEOUT))

        inventory = (
            LocalModelCandidate("ollama", "qwen3:14b", "sha256:b", 8_000_000_000, "2026-09-11T02:00:00Z"),
            LocalModelCandidate("ollama", "gemma3:12b", "sha256:a", 7_000_000_000, "2026-09-11T01:00:00Z"),
        )

        snapshot = LocalRuntimeSnapshotBuilder(ledger).build(ollama_inventory=inventory)

        self.assertEqual([item.name for item in snapshot.ollama_inventory], ["gemma3:12b", "qwen3:14b"])
        self.assertEqual([(item.provider_id, item.probe_name) for item in snapshot.probes], [
            ("lm-studio", "models"),
            ("ollama", "show"),
            ("ollama", "tags"),
        ])

        tags = next(item for item in snapshot.probes if item.provider_id == "ollama" and item.probe_name == "tags")
        show = next(item for item in snapshot.probes if item.provider_id == "ollama" and item.probe_name == "show")
        lm_models = next(item for item in snapshot.probes if item.provider_id == "lm-studio")

        self.assertEqual(tags.state, RuntimeProbeState.READY)
        self.assertEqual(tags.reliability, 1.0)
        self.assertEqual(tags.sample_count, 2)
        self.assertEqual(tags.latest_outcome, ProbeOutcome.SUCCESS)
        self.assertEqual(show.state, RuntimeProbeState.DEGRADED)
        self.assertEqual(show.latest_outcome, ProbeOutcome.TIMEOUT)
        self.assertEqual(lm_models.state, RuntimeProbeState.UNKNOWN)

        self.assertFalse(hasattr(snapshot, "raw_body"))
        self.assertFalse(hasattr(tags, "response_bytes"))
        self.assertFalse(hasattr(tags, "headers"))

        with self.assertRaises(Exception):
            snapshot.probes = ()

    def test_success_before_reliability_threshold_is_warming_not_ready(self):
        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=3)
        ledger.record(ProbeObservation.success("lm-studio", "models", latency_ms=6, response_bytes=64))

        snapshot = LocalRuntimeSnapshotBuilder(ledger).build()
        status = next(item for item in snapshot.probes if item.provider_id == "lm-studio")

        self.assertEqual(status.state, RuntimeProbeState.WARMING)
        self.assertIsNone(status.reliability)
        self.assertEqual(status.sample_count, 1)

    def test_failed_latest_observation_downgrades_even_with_prior_reliability(self):
        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=2)
        ledger.record(ProbeObservation.success("ollama", "show", latency_ms=4, response_bytes=90))
        ledger.record(ProbeObservation.success("ollama", "show", latency_ms=5, response_bytes=92))
        ledger.record(ProbeObservation.failure("ollama", "show", ProbeOutcome.HTTP_ERROR))

        snapshot = LocalRuntimeSnapshotBuilder(ledger).build()
        status = next(item for item in snapshot.probes if item.provider_id == "ollama" and item.probe_name == "show")

        self.assertEqual(status.state, RuntimeProbeState.DEGRADED)
        self.assertAlmostEqual(status.reliability or 0.0, 2 / 3)
        self.assertEqual(status.latest_outcome, ProbeOutcome.HTTP_ERROR)

    def test_inventory_rejects_non_ollama_candidates_and_duplicate_names(self):
        builder = LocalRuntimeSnapshotBuilder(LocalHealthEvidenceLedger())

        with self.assertRaises(ValueError):
            builder.build(ollama_inventory=(
                LocalModelCandidate("lm-studio", "bad", "sha256:x", 1, "now"),
            ))

        duplicate = LocalModelCandidate("ollama", "qwen3:14b", "sha256:x", 1, "now")
        with self.assertRaises(ValueError):
            builder.build(ollama_inventory=(duplicate, duplicate))


if __name__ == "__main__":
    unittest.main()
