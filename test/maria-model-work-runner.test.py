from __future__ import annotations

from dataclasses import dataclass
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import CapabilityRequest, RouteDecision, RouteKind
from maria_runtime.model_work_runner import (
    ModelAdapterResult,
    ModelWorkInput,
    ModelWorkStepBinding,
    ModelWorkStepRunner,
)
from maria_runtime.models import ModelSpec
from maria_runtime.work_routing import WorkRouteStep


class _SequenceAdapter:
    def __init__(self, results):
        self._results = list(results)
        self.calls = []

    def invoke(self, model, work_input, *, timeout_ms, max_output_tokens):
        self.calls.append({
            "model": model,
            "work_input": work_input,
            "timeout_ms": timeout_ms,
            "max_output_tokens": max_output_tokens,
        })
        if not self._results:
            raise AssertionError("adapter called more times than expected")
        return self._results.pop(0)


class ModelWorkStepRunnerTests(unittest.TestCase):
    @staticmethod
    def _model(*, available=True, capabilities=("reasoning",), context_size=8192):
        return ModelSpec(
            name="local-reasoner",
            provider="ollama",
            local=True,
            capabilities=tuple(capabilities),
            context_size=context_size,
            reliability=0.98,
            latency_ms=12,
            input_cost_per_million=0.0,
            output_cost_per_million=0.0,
            available=available,
            privacy_level="local",
            evidence_sample_count=3,
            evidence_source="test:local-health",
        )

    @staticmethod
    def _step(*, target_name="local-reasoner", capability="reasoning", context_tokens=2048):
        request = CapabilityRequest(
            capability=capability,
            execution_required=False,
            sensitive=True,
            estimated_context_tokens=context_tokens,
            project="SEIS",
        )
        return WorkRouteStep(
            step_id="reason",
            request=request,
            route=RouteDecision(
                capability=capability,
                kind=RouteKind.MODEL,
                target_name=target_name,
                project="SEIS",
            ),
            depends_on=(),
        )

    def test_success_returns_transient_output_with_bounded_usage(self):
        adapter = _SequenceAdapter((
            ModelAdapterResult.success(
                {"answer": "private-model-output"},
                input_tokens=2100,
                output_tokens=320,
            ),
        ))
        runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(),
                adapter=adapter,
                input_factory=lambda _dependencies: ModelWorkInput(
                    payload={"prompt": "sensitive-input"},
                    estimated_input_tokens=2048,
                ),
                timeout_ms=1500,
                max_output_tokens=1024,
            )
        })

        result = runner.run(
            self._step(),
            dependency_results={},
            attempt=1,
            idempotency_key=None,
        )

        self.assertTrue(result.succeeded)
        self.assertEqual(result.result, {"answer": "private-model-output"})
        self.assertEqual(len(adapter.calls), 1)
        self.assertEqual(adapter.calls[0]["max_output_tokens"], 1024)
        self.assertNotIn("sensitive-input", repr(adapter.calls[0]["work_input"]))

    def test_route_identity_capability_and_availability_fail_closed(self):
        adapter = _SequenceAdapter(())
        binding = ModelWorkStepBinding(
            model=self._model(),
            adapter=adapter,
            input_factory=lambda _dependencies: ModelWorkInput("x", estimated_input_tokens=1),
        )
        runner = ModelWorkStepRunner(bindings={"reason": binding})

        with self.assertRaises(PermissionError):
            runner.run(
                self._step(target_name="other-model"),
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )

        unavailable_runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(available=False),
                adapter=adapter,
                input_factory=lambda _dependencies: ModelWorkInput("x", estimated_input_tokens=1),
            )
        })
        with self.assertRaises(RuntimeError):
            unavailable_runner.run(
                self._step(),
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )

        missing_cap_runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(capabilities=("chat",)),
                adapter=adapter,
                input_factory=lambda _dependencies: ModelWorkInput("x", estimated_input_tokens=1),
            )
        })
        with self.assertRaises(PermissionError):
            missing_cap_runner.run(
                self._step(),
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )
        self.assertEqual(adapter.calls, [])

    def test_context_and_output_budgets_are_enforced_before_and_after_adapter(self):
        adapter = _SequenceAdapter(())
        runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(context_size=4096),
                adapter=adapter,
                input_factory=lambda _dependencies: ModelWorkInput(
                    "oversized",
                    estimated_input_tokens=3500,
                ),
                max_output_tokens=1024,
            )
        })
        with self.assertRaises(ValueError):
            runner.run(
                self._step(context_tokens=3500),
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )
        self.assertEqual(adapter.calls, [])

        oversized_adapter = _SequenceAdapter((
            ModelAdapterResult.success(
                "too-large",
                input_tokens=2000,
                output_tokens=1200,
            ),
        ))
        runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(),
                adapter=oversized_adapter,
                input_factory=lambda _dependencies: ModelWorkInput(
                    "bounded",
                    estimated_input_tokens=2000,
                ),
                max_output_tokens=1024,
            )
        })
        result = runner.run(
            self._step(context_tokens=2000),
            dependency_results={},
            attempt=1,
            idempotency_key=None,
        )
        self.assertFalse(result.succeeded)
        self.assertFalse(result.retryable)
        self.assertEqual(result.failure_category, "output-budget-exceeded")

    def test_only_normalized_transient_provider_failures_can_request_retry(self):
        adapter = _SequenceAdapter((
            ModelAdapterResult.failure("temporarily-unavailable", retryable=True),
            ModelAdapterResult.failure("provider-policy-denied", retryable=True),
        ))
        runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(),
                adapter=adapter,
                input_factory=lambda _dependencies: ModelWorkInput("x", estimated_input_tokens=1),
            )
        })

        transient = runner.run(
            self._step(context_tokens=1),
            dependency_results={},
            attempt=1,
            idempotency_key=None,
        )
        denied = runner.run(
            self._step(context_tokens=1),
            dependency_results={},
            attempt=2,
            idempotency_key=None,
        )

        self.assertFalse(transient.succeeded)
        self.assertTrue(transient.retryable)
        self.assertEqual(transient.failure_category, "temporarily-unavailable")
        self.assertFalse(denied.succeeded)
        self.assertFalse(denied.retryable)
        self.assertEqual(denied.failure_category, "provider-failure")

    def test_adapter_exception_is_redacted_and_not_retryable(self):
        class _ExplodingAdapter:
            def invoke(self, *args, **kwargs):
                raise RuntimeError("SECRET_PROVIDER_DETAIL")

        runner = ModelWorkStepRunner(bindings={
            "reason": ModelWorkStepBinding(
                model=self._model(),
                adapter=_ExplodingAdapter(),
                input_factory=lambda _dependencies: ModelWorkInput("x", estimated_input_tokens=1),
            )
        })
        result = runner.run(
            self._step(context_tokens=1),
            dependency_results={},
            attempt=1,
            idempotency_key=None,
        )

        self.assertFalse(result.succeeded)
        self.assertFalse(result.retryable)
        self.assertEqual(result.failure_category, "adapter-failure")
        self.assertNotIn("SECRET_PROVIDER_DETAIL", repr(result))


if __name__ == "__main__":
    unittest.main()
