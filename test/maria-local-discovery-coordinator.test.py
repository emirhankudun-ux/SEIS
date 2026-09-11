from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_coordinator import LocalDiscoveryCoordinator
from maria_runtime.local_health import LocalHealthEvidenceLedger, ProbeOutcome
from maria_runtime.local_probe import (
    LocalProbeFailureKind,
    LocalProbeResponse,
    LocalRuntimeProbe,
)


class LocalDiscoveryCoordinatorTests(unittest.TestCase):
    def test_ollama_show_is_bound_to_current_verified_inventory(self):
        requests = []
        ticks = iter([1.0, 1.002, 2.0, 2.004])

        def transport(request):
            requests.append(request)
            if request.url.endswith("/api/tags"):
                return LocalProbeResponse(
                    status_code=200,
                    content_type="application/json",
                    body=(
                        b'{"models":[{"name":"qwen3:14b","model":"qwen3:14b",'
                        b'"modified_at":"2026-09-11T00:00:00Z","size":8200000000,'
                        b'"digest":"sha256:qwen"}]}'
                    ),
                )
            return LocalProbeResponse(
                status_code=200,
                content_type="application/json",
                body=(
                    b'{"capabilities":["completion","tools"],'
                    b'"model_info":{"qwen3.context_length":65536}}'
                ),
            )

        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=1)
        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=ledger,
        )

        inventory = coordinator.refresh_ollama_inventory()
        self.assertEqual([item.name for item in inventory], ["qwen3:14b"])

        fact = coordinator.discover_ollama_model("qwen3:14b")
        self.assertEqual(fact.name, "qwen3:14b")
        self.assertEqual(fact.reliability, 1.0)
        self.assertEqual(fact.context_size, 65536)
        self.assertEqual(fact.capabilities, ("completion", "tools"))

        self.assertEqual(len(requests), 2)
        self.assertTrue(requests[0].url.endswith("/api/tags"))
        self.assertTrue(requests[1].url.endswith("/api/show"))

    def test_unknown_ollama_model_fails_before_transport_without_explicit_selection(self):
        requests = []
        ticks = iter([1.0, 1.001])

        def transport(request):
            requests.append(request)
            return LocalProbeResponse(200, "application/json", b'{"models":[]}')

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=LocalHealthEvidenceLedger(minimum_reliability_samples=1),
        )
        coordinator.refresh_ollama_inventory()

        with self.assertRaises(PermissionError):
            coordinator.discover_ollama_model("not-in-inventory:latest")

        self.assertEqual(len(requests), 1)

    def test_explicit_user_selection_can_request_show_without_inventory_membership(self):
        requests = []
        ticks = iter([1.0, 1.003])

        def transport(request):
            requests.append(request)
            return LocalProbeResponse(
                200,
                "application/json",
                b'{"capabilities":["completion"],"model_info":{"custom.context_length":32768}}',
            )

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=LocalHealthEvidenceLedger(minimum_reliability_samples=1),
        )

        fact = coordinator.discover_ollama_model(
            "custom:latest",
            explicit_user_selection=True,
        )

        self.assertEqual(fact.name, "custom:latest")
        self.assertEqual(fact.reliability, 1.0)
        self.assertEqual(len(requests), 1)
        self.assertTrue(requests[0].url.endswith("/api/show"))

    def test_default_health_threshold_keeps_model_non_routable_until_enough_evidence(self):
        ticks = iter([1.0, 1.001, 2.0, 2.001, 3.0, 3.001])

        def transport(_request):
            return LocalProbeResponse(
                200,
                "application/json",
                b'{"capabilities":["completion"],"model_info":{"custom.context_length":32768}}',
            )

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=LocalHealthEvidenceLedger(),
        )

        for _ in range(2):
            with self.assertRaises(LookupError):
                coordinator.discover_ollama_model(
                    "custom:latest",
                    explicit_user_selection=True,
                )

        fact = coordinator.discover_ollama_model(
            "custom:latest",
            explicit_user_selection=True,
        )
        self.assertEqual(fact.reliability, 1.0)

    def test_failed_inventory_refresh_revokes_previous_inventory(self):
        calls = 0
        ticks = iter([1.0, 1.001, 2.0, 2.001])

        def transport(_request):
            nonlocal calls
            calls += 1
            if calls == 1:
                return LocalProbeResponse(
                    200,
                    "application/json",
                    (
                        b'{"models":[{"name":"qwen3:14b","model":"qwen3:14b",'
                        b'"modified_at":"2026-09-11T00:00:00Z","size":1,'
                        b'"digest":"sha256:qwen"}]}'
                    ),
                )
            return LocalProbeResponse(503, "application/json", b"{}")

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=LocalHealthEvidenceLedger(minimum_reliability_samples=1),
        )

        coordinator.refresh_ollama_inventory()
        self.assertEqual(len(coordinator.current_ollama_inventory()), 1)

        with self.assertRaises(RuntimeError):
            coordinator.refresh_ollama_inventory()
        self.assertEqual(coordinator.current_ollama_inventory(), ())

        with self.assertRaises(PermissionError):
            coordinator.discover_ollama_model("qwen3:14b")
        self.assertEqual(calls, 2)

    def test_probe_failure_kind_is_recorded_without_raw_error_payload(self):
        def transport(_request):
            return LocalProbeResponse(503, "application/json", b'{"error":"secret-ish detail"}')

        ledger = LocalHealthEvidenceLedger(minimum_reliability_samples=1)
        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport),
            health=ledger,
        )

        with self.assertRaises(RuntimeError):
            coordinator.refresh_ollama_inventory()

        observation = ledger.recent("ollama", "tags")[-1]
        self.assertEqual(observation.outcome, ProbeOutcome.HTTP_ERROR)
        self.assertFalse(hasattr(observation, "message"))
        self.assertFalse(hasattr(observation, "body"))
        self.assertFalse(hasattr(observation, "headers"))

    def test_probe_error_exposes_typed_failure_kind_only(self):
        probe = LocalRuntimeProbe(
            transport=lambda _request: LocalProbeResponse(302, "application/json", b"{}", redirected=True)
        )

        with self.assertRaises(Exception) as caught:
            probe.probe_ollama_tags()

        self.assertEqual(caught.exception.kind, LocalProbeFailureKind.POLICY_REJECTED)


if __name__ == "__main__":
    unittest.main()
