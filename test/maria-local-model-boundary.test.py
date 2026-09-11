from __future__ import annotations

from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

import maria_runtime
from maria_runtime.fabric_router import CapabilityRequest, RouteDecision, RouteKind
from maria_runtime.local_model_transport import LocalModelRequest, LocalModelResponse, LoopbackModelHTTPTransport
from maria_runtime.model_work_runner import ModelAdapterResult, ModelWorkInput, ModelWorkStepBinding, ModelWorkStepRunner
from maria_runtime.models import ModelSpec
from maria_runtime.work_routing import WorkRouteStep


class LocalModelBoundaryTests(unittest.TestCase):
    def test_public_exports_include_concrete_adapters_and_transport_contract(self):
        for name in ("OllamaModelWorkAdapter", "LMStudioModelWorkAdapter", "LocalModelLimits",
                     "LocalModelRequest", "LocalModelResponse", "LocalModelTransport", "LoopbackModelHTTPTransport"):
            with self.subTest(name=name):
                self.assertIn(name, maria_runtime.__all__)
                self.assertTrue(hasattr(maria_runtime, name))

    def test_ill_typed_response_metadata_cannot_leak_through_repr(self):
        # Type annotations do not validate data returned by an injected transport.
        for changes in ({"status_code": "PRIVATE_STATUS_FIXTURE"},
                        {"redirected": "PRIVATE_REDIRECT_FIXTURE"}):
            fields = dict(status_code=200, content_type="application/json", body=b"{}")
            fields.update(changes)
            self.assertNotIn("PRIVATE_", repr(LocalModelResponse(**fields)))

    def test_transport_rejects_request_subclasses_before_any_io(self):
        class AlteredRequest(LocalModelRequest):
            @property
            def path(self):
                return "/not-an-inference-endpoint"

        request = AlteredRequest(provider_id="ollama", port=11434, body=b"{}",
                                 timeout_ms=1000, max_response_bytes=1024)
        with patch("maria_runtime.local_model_transport.http.client.HTTPConnection") as connection:
            with self.assertRaises(TypeError):
                LoopbackModelHTTPTransport()(request)
            connection.assert_not_called()

    def test_runner_retains_known_diagnostics_without_widening_retry_authority(self):
        selected = ModelSpec(name="fixture-model", provider="ollama", local=True,
                             capabilities=("chat",), context_size=8192, reliability=1,
                             latency_ms=1, input_cost_per_million=0, output_cost_per_million=0)
        step = WorkRouteStep(step_id="chat", depends_on=(),
            request=CapabilityRequest(capability="chat", execution_required=False, estimated_context_tokens=1),
            route=RouteDecision(capability="chat", kind=RouteKind.MODEL, target_name=selected.name))

        class FailureAdapter:
            def __init__(self, category):
                self.category = category

            def invoke(self, *_args, **_kwargs):
                return ModelAdapterResult.failure(self.category, retryable=True)

        known = ("authentication-required", "invalid-model-input", "invalid-response", "model-mismatch",
                 "request-too-large", "response-too-large", "output-budget-exceeded", "context-budget-exceeded",
                 "incomplete-output", "unsupported-output", "policy-rejected")
        for category in (*known, "PRIVATE_UNKNOWN_PROVIDER_FIXTURE", "timeout"):
            with self.subTest(category=category):
                runner = ModelWorkStepRunner(bindings={"chat": ModelWorkStepBinding(
                    model=selected, adapter=FailureAdapter(category),
                    input_factory=lambda _deps: ModelWorkInput("x", estimated_input_tokens=1),
                    max_output_tokens=64,
                )})
                result = runner.run(step, dependency_results={}, attempt=1, idempotency_key=None)
                expected = "provider-failure" if category.startswith("PRIVATE_") else category
                self.assertEqual(result.failure_category, expected)
                self.assertEqual(result.retryable, category == "timeout")
                self.assertNotIn("PRIVATE_", repr(result))


if __name__ == "__main__":
    unittest.main()
