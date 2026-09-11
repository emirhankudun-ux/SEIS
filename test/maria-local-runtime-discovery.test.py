from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.local_discovery import (
    LMStudioV1DiscoverySource,
    LocalModelCandidate,
    OllamaShowDiscoverySource,
    OllamaTagsDiscoverySource,
)
from maria_runtime.local_probe import (
    LocalProbeError,
    LocalProbeResponse,
    LocalRuntimeProbe,
)


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

        self.assertEqual(len(facts), 2)
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

        embedding = facts[1]
        self.assertEqual(embedding.provider_id, "lm-studio")
        self.assertEqual(embedding.name, "text-embedding-model")
        self.assertEqual(embedding.context_size, 2048)
        self.assertEqual(embedding.capabilities, ("embedding",))
        self.assertTrue(embedding.local)
        self.assertTrue(embedding.verified)
        self.assertTrue(embedding.reachable)

    def test_ollama_tags_are_candidates_not_routable_model_facts(self):
        payload = {
            "models": [
                {
                    "name": "qwen3:14b",
                    "model": "qwen3:14b",
                    "modified_at": "2026-09-10T20:00:00Z",
                    "size": 8_200_000_000,
                    "digest": "sha256:qwen",
                },
                {
                    "name": "gemma4:12b",
                    "model": "gemma4:12b",
                    "modified_at": "2026-09-09T20:00:00Z",
                    "size": 7_100_000_000,
                    "digest": "sha256:gemma",
                },
            ]
        }

        candidates = OllamaTagsDiscoverySource().parse_models(payload)

        self.assertEqual(
            candidates,
            (
                LocalModelCandidate(
                    provider_id="ollama",
                    name="gemma4:12b",
                    digest="sha256:gemma",
                    size_bytes=7_100_000_000,
                    modified_at="2026-09-09T20:00:00Z",
                ),
                LocalModelCandidate(
                    provider_id="ollama",
                    name="qwen3:14b",
                    digest="sha256:qwen",
                    size_bytes=8_200_000_000,
                    modified_at="2026-09-10T20:00:00Z",
                ),
            ),
        )
        self.assertFalse(hasattr(candidates[0], "capabilities"))
        self.assertFalse(hasattr(candidates[0], "context_size"))

    def test_ollama_tags_fail_closed_on_duplicate_or_incomplete_candidates(self):
        malformed_payloads = [
            {"models": "not-a-list"},
            {"models": [{"name": "qwen3:14b"}]},
            {
                "models": [
                    {
                        "name": "qwen3:14b",
                        "model": "qwen3:14b",
                        "modified_at": "2026-09-10T20:00:00Z",
                        "size": 1,
                        "digest": "sha256:a",
                    },
                    {
                        "name": "qwen3:14b",
                        "model": "qwen3:14b",
                        "modified_at": "2026-09-10T21:00:00Z",
                        "size": 2,
                        "digest": "sha256:b",
                    },
                ]
            },
        ]

        for payload in malformed_payloads:
            with self.subTest(payload=payload):
                with self.assertRaises(ValueError):
                    OllamaTagsDiscoverySource().parse_models(payload)

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


class LocalRuntimeProbeTests(unittest.TestCase):
    def test_lm_studio_probe_is_fixed_to_loopback_and_records_bounded_evidence(self):
        requests = []
        ticks = iter([10.000, 10.042])

        def transport(request):
            requests.append(request)
            return LocalProbeResponse(
                status_code=200,
                content_type="application/json; charset=utf-8",
                body=b'{"models":[]}',
            )

        probe = LocalRuntimeProbe(
            transport=transport,
            clock=lambda: next(ticks),
            timeout_seconds=0.75,
            max_response_bytes=256,
        )

        result = probe.probe_lm_studio_models()

        self.assertEqual(len(requests), 1)
        request = requests[0]
        self.assertEqual(request.provider_id, "lm-studio")
        self.assertEqual(request.url, "http://127.0.0.1:1234/api/v1/models")
        self.assertEqual(request.method, "GET")
        self.assertIsNone(request.body)
        self.assertEqual(dict(request.headers), {"Accept": "application/json"})
        self.assertEqual(request.timeout_seconds, 0.75)
        self.assertEqual(request.max_response_bytes, 256)
        self.assertEqual(result.provider_id, "lm-studio")
        self.assertEqual(result.payload, {"models": []})
        self.assertEqual(result.latency_ms, 42)
        self.assertEqual(result.response_bytes, len(b'{"models":[]}'))

    def test_ollama_tags_probe_is_fixed_to_loopback_and_body_free(self):
        requests = []
        ticks = iter([15.0, 15.003])

        def transport(request):
            requests.append(request)
            return LocalProbeResponse(
                status_code=200,
                content_type="application/json",
                body=b'{"models":[]}',
            )

        probe = LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks))
        result = probe.probe_ollama_tags()

        request = requests[0]
        self.assertEqual(request.provider_id, "ollama")
        self.assertEqual(request.url, "http://127.0.0.1:11434/api/tags")
        self.assertEqual(request.method, "GET")
        self.assertIsNone(request.body)
        self.assertEqual(dict(request.headers), {"Accept": "application/json"})
        self.assertEqual(result.payload, {"models": []})
        self.assertEqual(result.latency_ms, 3)

    def test_ollama_show_probe_uses_fixed_loopback_endpoint_and_minimal_body(self):
        requests = []
        ticks = iter([20.0, 20.005])

        def transport(request):
            requests.append(request)
            return LocalProbeResponse(
                status_code=200,
                content_type="application/json",
                body=b'{"model_info":{"qwen.context_length":32768},"capabilities":["completion"]}',
            )

        probe = LocalRuntimeProbe(transport=transport, clock=lambda: next(ticks))
        result = probe.probe_ollama_show("qwen:14b")

        request = requests[0]
        self.assertEqual(request.provider_id, "ollama")
        self.assertEqual(request.url, "http://127.0.0.1:11434/api/show")
        self.assertEqual(request.method, "POST")
        self.assertEqual(
            dict(request.headers),
            {"Accept": "application/json", "Content-Type": "application/json"},
        )
        self.assertEqual(request.body, b'{"model":"qwen:14b"}')
        self.assertNotIn(b"token", request.body.lower())
        self.assertEqual(result.provider_id, "ollama")
        self.assertEqual(result.latency_ms, 5)

    def test_probe_fails_closed_on_redirect_non_json_oversize_bad_status_or_bad_payload(self):
        cases = [
            LocalProbeResponse(302, "application/json", b"{}", redirected=True),
            LocalProbeResponse(200, "text/html", b"{}"),
            LocalProbeResponse(200, "application/json", b"x" * 17),
            LocalProbeResponse(503, "application/json", b"{}"),
            LocalProbeResponse(200, "application/json", b"[]"),
        ]

        for response in cases:
            with self.subTest(response=response):
                ticks = iter([1.0, 1.001])
                probe = LocalRuntimeProbe(
                    transport=lambda _request, response=response: response,
                    clock=lambda: next(ticks),
                    max_response_bytes=16,
                )
                with self.assertRaises(LocalProbeError):
                    probe.probe_lm_studio_models()

    def test_probe_validates_limits_ports_and_model_name_before_transport(self):
        calls = []

        def transport(request):
            calls.append(request)
            return LocalProbeResponse(200, "application/json", b"{}")

        for kwargs in [
            {"timeout_seconds": 0},
            {"max_response_bytes": 0},
            {"lm_studio_port": 0},
            {"ollama_port": 70000},
        ]:
            with self.subTest(kwargs=kwargs):
                with self.assertRaises(ValueError):
                    LocalRuntimeProbe(transport=transport, **kwargs)

        probe = LocalRuntimeProbe(transport=transport)
        for model_name in ["", "   ", "x" * 513]:
            with self.subTest(model_name=model_name):
                with self.assertRaises(ValueError):
                    probe.probe_ollama_show(model_name)

        self.assertEqual(calls, [])


if __name__ == "__main__":
    unittest.main()
