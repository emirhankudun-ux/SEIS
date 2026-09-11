from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_health import (
    LocalHealthEvidenceLedger,
    ProbeObservation,
    ProbeOutcome,
)


class LocalRuntimeHealthEvidenceTests(unittest.TestCase):
    def test_reliability_is_unavailable_until_minimum_evidence_exists(self):
        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=3)
        ledger.record(ProbeObservation.success("ollama", "tags", latency_ms=20, response_bytes=120))
        ledger.record(ProbeObservation.success("ollama", "tags", latency_ms=40, response_bytes=130))

        early = ledger.summary("ollama", "tags")
        self.assertEqual(early.sample_count, 2)
        self.assertIsNone(early.reliability)
        self.assertEqual(early.median_success_latency_ms, 30)

        ledger.record(ProbeObservation.failure("ollama", "tags", ProbeOutcome.TIMEOUT))
        mature = ledger.summary("ollama", "tags")

        self.assertEqual(mature.sample_count, 3)
        self.assertEqual(mature.success_count, 2)
        self.assertEqual(mature.failure_count, 1)
        self.assertAlmostEqual(mature.reliability, 2 / 3)
        self.assertEqual(mature.median_success_latency_ms, 30)

    def test_ledger_is_bounded_per_probe_and_keeps_latest_evidence(self):
        ledger = LocalHealthEvidenceLedger(
            max_samples_per_probe=3,
            minimum_reliability_samples=1,
        )
        ledger.record(ProbeObservation.failure("lm-studio", "models", ProbeOutcome.TIMEOUT))
        ledger.record(ProbeObservation.success("lm-studio", "models", latency_ms=10, response_bytes=10))
        ledger.record(ProbeObservation.success("lm-studio", "models", latency_ms=20, response_bytes=20))
        ledger.record(ProbeObservation.success("lm-studio", "models", latency_ms=30, response_bytes=30))

        summary = ledger.summary("lm-studio", "models")
        self.assertEqual(summary.sample_count, 3)
        self.assertEqual(summary.success_count, 3)
        self.assertEqual(summary.failure_count, 0)
        self.assertEqual(summary.reliability, 1.0)
        self.assertEqual(summary.median_success_latency_ms, 20)
        self.assertEqual(
            tuple(observation.latency_ms for observation in ledger.recent("lm-studio", "models")),
            (10, 20, 30),
        )

    def test_observation_schema_is_redacted_and_fail_closed(self):
        success = ProbeObservation.success(
            "ollama",
            "show",
            latency_ms=5,
            response_bytes=100,
        )
        self.assertEqual(success.outcome, ProbeOutcome.SUCCESS)
        self.assertFalse(hasattr(success, "message"))
        self.assertFalse(hasattr(success, "headers"))
        self.assertFalse(hasattr(success, "body"))

        invalid_factories = [
            lambda: ProbeObservation.success("unknown", "tags", latency_ms=1, response_bytes=1),
            lambda: ProbeObservation.success("ollama", "models", latency_ms=1, response_bytes=1),
            lambda: ProbeObservation.success("ollama", "tags", latency_ms=-1, response_bytes=1),
            lambda: ProbeObservation.failure("ollama", "tags", ProbeOutcome.SUCCESS),
            lambda: ProbeObservation.failure("ollama", "tags", ProbeOutcome.TIMEOUT, latency_ms=-1),
        ]
        for factory in invalid_factories:
            with self.subTest(factory=factory):
                with self.assertRaises(ValueError):
                    factory()

    def test_unknown_probe_summary_does_not_invent_health(self):
        ledger = LocalHealthEvidenceLedger()
        summary = ledger.summary("ollama", "show")
        self.assertEqual(summary.sample_count, 0)
        self.assertEqual(summary.success_count, 0)
        self.assertEqual(summary.failure_count, 0)
        self.assertIsNone(summary.reliability)
        self.assertIsNone(summary.median_success_latency_ms)


if __name__ == "__main__":
    unittest.main()
