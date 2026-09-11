from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_coordinator import LocalDiscoveryCoordinator
from maria_runtime.local_health import LocalHealthEvidenceLedger
from maria_runtime.local_probe import LocalProbeResponse, LocalRuntimeProbe
from maria_runtime.provider_discovery import ProviderDiscoveryAdapter
from maria_runtime.providers import ProviderStatus, default_provider_registry
from maria_runtime.routing import ModelRouter


class LocalRoutingIntegrationTests(unittest.TestCase):
    def test_verified_local_evidence_flows_into_sensitive_local_first_routing(self):
        ticks = iter([1.0, 1.002, 2.0, 2.004])

        def transport(request):
            if request.url.endswith("/api/tags"):
                return LocalProbeResponse(
                    200,
                    "application/json",
                    (
                        b'{"models":[{"name":"qwen3:14b","model":"qwen3:14b",'
                        b'"modified_at":"2026-09-11T00:00:00Z","size":8200000000,'
                        b'"digest":"sha256:qwen"}]}'
                    ),
                )
            return LocalProbeResponse(
                200,
                "application/json",
                (
                    b'{"capabilities":["completion","tools"],'
                    b'"model_info":{"qwen3.context_length":65536}}'
                ),
            )

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks)),
            health=LocalHealthEvidenceLedger(minimum_reliability_samples=1),
        )
        coordinator.refresh_ollama_inventory()
        fact = coordinator.discover_ollama_model("qwen3:14b")

        discovery = ProviderDiscoveryAdapter(default_provider_registry()).discover((fact,))
        self.assertEqual(discovery.provider_status["ollama"], ProviderStatus.AVAILABLE)

        model = discovery.models.get("qwen3:14b")
        self.assertIsNotNone(model)
        self.assertTrue(model.available)
        self.assertTrue(model.local)
        self.assertEqual(model.privacy_level, "local")
        self.assertEqual(model.reliability, 1.0)
        self.assertEqual(model.evidence_sample_count, 1)
        self.assertEqual(model.evidence_source, "local-health:ollama/show")

        router = ModelRouter(discovery.models)
        decision = router.explain_select(
            required_capabilities={"tool-use"},
            sensitive=True,
            estimated_context_tokens=16_384,
        )
        selected = decision.model
        self.assertEqual(selected.name, "qwen3:14b")
        self.assertEqual(selected.provider, "ollama")
        self.assertTrue(selected.local)
        self.assertTrue(decision.local_privacy_bias_applied)
        self.assertEqual(decision.evidence_sample_count, 1)
        self.assertEqual(decision.evidence_source, "local-health:ollama/show")
        self.assertEqual(decision.required_capabilities, ("tool-use",))
        self.assertEqual(decision.candidate_names, ("qwen3:14b",))
        self.assertGreater(decision.score, 0.0)

        selected_legacy = router.select(
            required_capabilities={"tool-use"},
            sensitive=True,
            estimated_context_tokens=16_384,
        )
        self.assertEqual(selected_legacy, selected)

    def test_tags_inventory_alone_never_creates_a_routable_model(self):
        ticks = iter([1.0, 1.001])

        coordinator = LocalDiscoveryCoordinator(
            probe=LocalRuntimeProbe(
                transport=lambda _request: LocalProbeResponse(
                    200,
                    "application/json",
                    (
                        b'{"models":[{"name":"qwen3:14b","model":"qwen3:14b",'
                        b'"modified_at":"2026-09-11T00:00:00Z","size":8200000000,'
                        b'"digest":"sha256:qwen"}]}'
                    ),
                ),
                clock=lambda: next(ticks),
            ),
            health=LocalHealthEvidenceLedger(minimum_reliability_samples=1),
        )

        inventory = coordinator.refresh_ollama_inventory()
        self.assertEqual(len(inventory), 1)
        self.assertFalse(hasattr(inventory[0], "capabilities"))
        self.assertFalse(hasattr(inventory[0], "context_size"))

        discovery = ProviderDiscoveryAdapter(default_provider_registry()).discover(())
        self.assertEqual(discovery.models.available(), [])
        self.assertEqual(discovery.provider_status["ollama"], ProviderStatus.DISCOVERY_REQUIRED)


if __name__ == "__main__":
    unittest.main()
