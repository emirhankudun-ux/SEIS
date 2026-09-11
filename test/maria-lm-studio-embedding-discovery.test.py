from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import LMStudioV1DiscoverySource
from maria_runtime.provider_discovery import ProviderDiscoveryAdapter
from maria_runtime.providers import ProviderStatus, default_provider_registry
from maria_runtime.routing import ModelRouter


class LMStudioEmbeddingDiscoveryTests(unittest.TestCase):
    def test_verified_embedding_model_becomes_embedding_only_local_route(self):
        payload = {
            "models": [
                {
                    "type": "embedding",
                    "publisher": "gaianet",
                    "key": "vision-coder-chat-by-name-embedding",
                    "display_name": "Nomic Embed Text v1.5",
                    "max_context_length": 2048,
                    "format": "gguf",
                }
            ]
        }

        facts = LMStudioV1DiscoverySource().parse_models(
            payload,
            latency_ms=7,
            reliability=0.99,
        )

        self.assertEqual(len(facts), 1)
        fact = facts[0]
        self.assertEqual(fact.provider_id, "lm-studio")
        self.assertEqual(fact.name, "vision-coder-chat-by-name-embedding")
        self.assertEqual(fact.capabilities, ("embedding",))
        self.assertEqual(fact.context_size, 2048)
        self.assertTrue(fact.local)
        self.assertTrue(fact.verified)
        self.assertTrue(fact.reachable)
        self.assertNotIn("chat", fact.capabilities)
        self.assertNotIn("coding", fact.capabilities)
        self.assertNotIn("vision", fact.capabilities)

        discovery = ProviderDiscoveryAdapter(default_provider_registry()).discover(facts)
        self.assertEqual(discovery.provider_status["lm-studio"], ProviderStatus.AVAILABLE)

        model = discovery.models.get("vision-coder-chat-by-name-embedding")
        self.assertIsNotNone(model)
        self.assertEqual(model.capabilities, ("embedding",))
        self.assertTrue(model.local)
        self.assertEqual(model.privacy_level, "local")

        decision = ModelRouter(discovery.models).explain_select(
            required_capabilities={"embedding"},
            sensitive=True,
            estimated_context_tokens=1024,
        )
        self.assertEqual(decision.model, model)
        self.assertTrue(decision.local_privacy_bias_applied)
        self.assertEqual(decision.required_capabilities, ("embedding",))

    def test_unknown_lm_studio_model_type_is_not_promoted_to_a_route(self):
        facts = LMStudioV1DiscoverySource().parse_models(
            {
                "models": [
                    {
                        "type": "future-unsupported-type",
                        "key": "looks-like-a-coder",
                        "max_context_length": 4096,
                    }
                ]
            },
            latency_ms=1,
            reliability=1.0,
        )

        self.assertEqual(facts, ())


if __name__ == "__main__":
    unittest.main()
