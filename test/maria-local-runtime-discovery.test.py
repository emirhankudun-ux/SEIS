from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import LMStudioV1DiscoverySource, OllamaShowDiscoverySource


class LocalRuntimeDiscoveryTests(unittest.TestCase):
    def test_lm_studio_v1_models_become_redacted_local_discovery_facts(self):
        payload = {
            "models": [
                {
                    "type": "llm",
                    "publisher": "google",
                    "key": "google/gemma-4-26b-a4b",
                    "display_name": "Gemma 4 26B A4B",
                    "max_context_length": 262144,
                    "format": "gguf",
                    "capabilities": {
                        "vision": True,
                        "trained_for_tool_use": True,
                        "reasoning": {"allowed_options": ["off", "on"], "default": "on"},
                    },
                },
                {
                    "type": "embedding",
                    "key": "text-embedding-model",
                    "max_context_length": 2048,
                    "format": "gguf",
                },
            ]
        }

        facts = LMStudioV1DiscoverySource().parse_models(
            payload,
            latency_ms=45,
            reliability=0.91,
        )

        self.assertEqual(len(facts), 1)
        fact = facts[0]
        self.assertEqual(fact.provider_id, "lm-studio")
        self.assertEqual(fact.name, "google/gemma-4-26b-a4b")
        self.assertEqual(fact.context_size, 262144)
        self.assertTrue(fact.local)
        self.assertTrue(fact.verified)
        self.assertTrue(fact.reachable)
        self.assertIn("chat", fact.capabilities)
        self.assertIn("vision", fact.capabilities)
        self.assertIn("reasoning", fact.capabilities)
        self.assertIn("tool-use", fact.capabilities)

    def test_ollama_show_uses_reported_context_and_capabilities_without_guessing(self):
        payload = {
            "capabilities": ["completion", "vision", "tools"],
            "model_info": {
                "gemma4.context_length": 131072,
                "gemma4.block_count": 48,
            },
            "details": {
                "family": "gemma4",
                "parameter_size": "12B",
                "quantization_level": "Q4_K_M",
            },
        }

        fact = OllamaShowDiscoverySource().parse_model(
            "gemma4:12b",
            payload,
            latency_ms=30,
            reliability=0.88,
        )

        self.assertEqual(fact.provider_id, "ollama")
        self.assertEqual(fact.name, "gemma4:12b")
        self.assertEqual(fact.context_size, 131072)
        self.assertEqual(fact.capabilities, ("completion", "tools", "vision"))
        self.assertTrue(fact.local)
        self.assertTrue(fact.verified)
        self.assertTrue(fact.reachable)

    def test_local_sources_fail_closed_on_missing_context_metadata(self):
        with self.assertRaises(ValueError):
            LMStudioV1DiscoverySource().parse_models(
                {"models": [{"type": "llm", "key": "broken"}]},
                latency_ms=1,
                reliability=0.8,
            )

        with self.assertRaises(ValueError):
            OllamaShowDiscoverySource().parse_model(
                "broken",
                {"capabilities": ["completion"], "model_info": {}},
                latency_ms=1,
                reliability=0.8,
            )


if __name__ == "__main__":
    unittest.main()
