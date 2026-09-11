from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Mapping, Protocol

from .fabric_router import RouteKind
from .models import ModelSpec
from .work_execution import WorkStepRunResult
from .work_routing import WorkRouteStep


@dataclass(frozen=True)
class ModelWorkInput:
    """Transient model input envelope with an explicit token estimate."""

    payload: Any = field(repr=False)
    estimated_input_tokens: int = 0

    def __post_init__(self) -> None:
        if (
            isinstance(self.estimated_input_tokens, bool)
            or not isinstance(self.estimated_input_tokens, int)
            or self.estimated_input_tokens < 0
        ):
            raise ValueError("estimated_input_tokens must be a non-negative integer")


@dataclass(frozen=True)
class ModelAdapterResult:
    """Normalized provider-adapter result.

    ``output`` is transient and hidden from repr. Provider exception strings,
    HTTP bodies, prompts, credentials, and raw diagnostics do not belong here.
    """

    succeeded: bool
    output: Any | None = field(default=None, repr=False)
    input_tokens: int = 0
    output_tokens: int = 0
    failure_category: str | None = None
    retryable: bool = False

    def __post_init__(self) -> None:
        for name, value in (
            ("input_tokens", self.input_tokens),
            ("output_tokens", self.output_tokens),
        ):
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise ValueError(f"{name} must be a non-negative integer")
        if self.succeeded:
            if self.failure_category is not None:
                raise ValueError("successful model result cannot carry a failure category")
            if self.retryable:
                raise ValueError("successful model result cannot be retryable")
        else:
            if not isinstance(self.failure_category, str) or not self.failure_category.strip():
                raise ValueError("failed model result requires a normalized failure category")
            if self.output is not None:
                raise ValueError("failed model result cannot carry output")

    @classmethod
    def success(
        cls,
        output: Any,
        *,
        input_tokens: int,
        output_tokens: int,
    ) -> "ModelAdapterResult":
        return cls(
            succeeded=True,
            output=output,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )

    @classmethod
    def failure(
        cls,
        failure_category: str,
        *,
        retryable: bool = False,
    ) -> "ModelAdapterResult":
        return cls(
            succeeded=False,
            failure_category=failure_category,
            retryable=bool(retryable),
        )


class ModelWorkAdapter(Protocol):
    def invoke(
        self,
        model: ModelSpec,
        work_input: ModelWorkInput,
        *,
        timeout_ms: int,
        max_output_tokens: int,
    ) -> ModelAdapterResult:
        ...


@dataclass(frozen=True)
class ModelWorkStepBinding:
    """Runtime binding for one pre-routed cognition step."""

    model: ModelSpec
    adapter: ModelWorkAdapter = field(repr=False, compare=False)
    input_factory: Callable[[Mapping[str, Any]], ModelWorkInput] = field(
        repr=False,
        compare=False,
    )
    timeout_ms: int = 30_000
    max_output_tokens: int = 2_048

    HARD_MAX_OUTPUT_TOKENS = 65_536

    def __post_init__(self) -> None:
        if not isinstance(self.model, ModelSpec):
            raise TypeError("model must be ModelSpec")
        if not hasattr(self.adapter, "invoke") or not callable(self.adapter.invoke):
            raise TypeError("adapter must provide invoke()")
        if not callable(self.input_factory):
            raise TypeError("input_factory must be callable")
        if isinstance(self.timeout_ms, bool) or not isinstance(self.timeout_ms, int) or self.timeout_ms <= 0:
            raise ValueError("timeout_ms must be a positive integer")
        if (
            isinstance(self.max_output_tokens, bool)
            or not isinstance(self.max_output_tokens, int)
            or not 1 <= self.max_output_tokens <= self.HARD_MAX_OUTPUT_TOKENS
        ):
            raise ValueError(
                f"max_output_tokens must be between 1 and {self.HARD_MAX_OUTPUT_TOKENS}"
            )
        if self.max_output_tokens > self.model.context_size:
            raise ValueError("max_output_tokens cannot exceed model context size")


class ModelWorkStepRunner:
    """Execute one pre-routed model step through a bounded adapter contract.

    This class performs no provider discovery, network setup, credential lookup,
    model download, or process launch. A caller supplies an adapter explicitly.
    The runner verifies that the routed model is still the bound model, is marked
    available, still advertises the required capability, and has sufficient
    context/output budget before invoking that adapter.
    """

    _RETAINABLE_FAILURES = frozenset(
        ("temporarily-unavailable", "transport-failure", "rate-limited", "timeout")
    )
    _RETRYABLE_FAILURES = _RETAINABLE_FAILURES

    def __init__(self, *, bindings: Mapping[str, ModelWorkStepBinding]) -> None:
        if any(not isinstance(step_id, str) or not step_id.strip() for step_id in bindings):
            raise ValueError("model work binding step ids must be non-empty")
        if any(not isinstance(binding, ModelWorkStepBinding) for binding in bindings.values()):
            raise TypeError("all model work bindings must be ModelWorkStepBinding")
        self._bindings = dict(bindings)

    def run(
        self,
        step: WorkRouteStep,
        *,
        dependency_results: Mapping[str, Any],
        attempt: int,
        idempotency_key: str | None,
    ) -> WorkStepRunResult:
        if not isinstance(step, WorkRouteStep):
            raise TypeError("step must be WorkRouteStep")
        if step.route.kind is not RouteKind.MODEL or step.request.execution_required:
            raise PermissionError("model work runner accepts cognition steps only")
        if isinstance(attempt, bool) or not isinstance(attempt, int) or attempt <= 0:
            raise ValueError("attempt must be a positive integer")
        if not isinstance(dependency_results, Mapping):
            raise TypeError("dependency_results must be a mapping")
        if idempotency_key is not None:
            raise ValueError("model work steps do not accept tool idempotency keys")

        binding = self._bindings.get(step.step_id)
        if binding is None:
            raise LookupError(f"no model work binding for step: {step.step_id}")
        self._validate_binding(step, binding)
        self._validate_declared_budget(step, binding)

        try:
            work_input = binding.input_factory(dict(dependency_results))
        except Exception:
            return WorkStepRunResult.failure("input-factory-failure", retryable=False)
        if not isinstance(work_input, ModelWorkInput):
            return WorkStepRunResult.failure("invalid-model-input", retryable=False)

        effective_input_estimate = max(
            step.request.estimated_context_tokens,
            work_input.estimated_input_tokens,
        )
        if effective_input_estimate + binding.max_output_tokens > binding.model.context_size:
            raise ValueError("model work input/output budget exceeds context size")

        try:
            adapter_result = binding.adapter.invoke(
                binding.model,
                work_input,
                timeout_ms=binding.timeout_ms,
                max_output_tokens=binding.max_output_tokens,
            )
        except Exception:
            # Provider exceptions can include prompts, URLs, credentials, response
            # bodies, or local paths. Never retain the raw exception text.
            return WorkStepRunResult.failure("adapter-failure", retryable=False)

        if not isinstance(adapter_result, ModelAdapterResult):
            return WorkStepRunResult.failure("invalid-adapter-result", retryable=False)

        if adapter_result.succeeded:
            if adapter_result.output_tokens > binding.max_output_tokens:
                return WorkStepRunResult.failure("output-budget-exceeded", retryable=False)
            if (
                adapter_result.input_tokens + adapter_result.output_tokens
                > binding.model.context_size
            ):
                return WorkStepRunResult.failure("context-budget-exceeded", retryable=False)
            return WorkStepRunResult.success(adapter_result.output)

        raw_failure = adapter_result.failure_category
        failure = (
            raw_failure
            if raw_failure in self._RETAINABLE_FAILURES
            else "provider-failure"
        )
        retryable = bool(
            adapter_result.retryable
            and raw_failure in self._RETRYABLE_FAILURES
        )
        return WorkStepRunResult.failure(failure, retryable=retryable)

    @staticmethod
    def _validate_binding(step: WorkRouteStep, binding: ModelWorkStepBinding) -> None:
        model = binding.model
        if step.route.target_name != model.name:
            raise PermissionError("model work binding identity does not match routed target")
        if step.route.capability != step.request.capability:
            raise PermissionError("model work route capability does not match request")
        if not model.available:
            raise RuntimeError("routed model is no longer available")
        if step.route.capability not in model.capabilities:
            raise PermissionError("routed model no longer advertises required capability")

    @staticmethod
    def _validate_declared_budget(step: WorkRouteStep, binding: ModelWorkStepBinding) -> None:
        if (
            step.request.estimated_context_tokens + binding.max_output_tokens
            > binding.model.context_size
        ):
            raise ValueError("declared model context/output budget exceeds context size")
