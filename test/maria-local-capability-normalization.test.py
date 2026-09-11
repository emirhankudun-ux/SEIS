from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import OllamaShowDiscoverySource


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
            ("chat", "embedding", "reasoning", "tool-use", "vision"),
        )
        self.assertEqual(
            fact.native_capabilities,
            ("completion", "embedding", "thinking", "tools", "vision"),
        )
        self.assertNotIn("coding", fact.capabilities)
        self.assertNotIn("completion", fact.capabilities)
        self.assertNotIn("tools", fact.capabilities)
        self.assertNotIn("thinking", fact.capabilities)

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

        self.assertEqual(fact.capabilities, ("chat",))
        self.assertEqual(
            fact.native_capabilities,
            ("completion", "future-native-capability"),
        )


if __name__ == "__main__":
    unittest.main()
