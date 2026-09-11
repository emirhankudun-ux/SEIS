from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import OllamaShowDiscoverySource
from maria_runtime.provider_discovery import ProviderDiscoveryAdapter
from maria_runtime.providers import default_provider_registry


class LocalCapabilityNormalizationTests(unittest.TestCase):
    def test_ollama_native_capabilities_map_to_canonical_routes_without_name_heuristics(self):
        fact = OllamaShowDiscoverySource().parse_model(
            "definitely-a-coder-by-name:latest",
            {
                "capabilities": [
                    "completion",
                    "tools",
                    "thinking",
                    "vision",
                    "embedding",
                ],
                "model_info": {"fixture.context_length": 65536},
            },
            latency_ms=12,
            reliability=0.95,
        )

        self.assertEqual(
            fact.capabilities,
            ("completion", "embedding", "thinking", "tools", "vision"),
        )
        self.assertEqual(
            fact.routing_capabilities,
            ("chat", "embedding", "reasoning", "tool-use", "vision"),
        )

        discovery = ProviderDiscoveryAdapter(default_provider_registry()).discover((fact,))
        model = discovery.models.get("definitely-a-coder-by-name:latest")
        self.assertIsNotNone(model)
        self.assertEqual(
            model.capabilities,
            ("chat", "embedding", "reasoning", "tool-use", "vision"),
        )
        self.assertNotIn("coding", model.capabilities)
        self.assertNotIn("completion", model.capabilities)
        self.assertNotIn("tools", model.capabilities)
        self.assertNotIn("thinking", model.capabilities)

    def test_unknown_native_capability_is_retained_as_evidence_but_not_made_routable(self):
        fact = OllamaShowDiscoverySource().parse_model(
            "future-model:latest",
            {
                "capabilities": ["completion", "future-native-capability"],
                "model_info": {"fixture.context_length": 32768},
            },
            latency_ms=8,
            reliability=1.0,
        )

        self.assertEqual(
            fact.capabilities,
            ("completion", "future-native-capability"),
        )
        self.assertEqual(fact.routing_capabilities, ("chat",))

        discovery = ProviderDiscoveryAdapter(default_provider_registry()).discover((fact,))
        model = discovery.models.get("future-model:latest")
        self.assertIsNotNone(model)
        self.assertEqual(model.capabilities, ("chat",))


if __name__ == "__main__":
    unittest.main()
