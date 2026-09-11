from __future__ import annotations

from dataclasses import dataclass, field
import secrets
from typing import Any, Callable, Mapping, Protocol

from .fabric_router import RouteKind
from .mcp_gateway import MCPGatewayEvaluation
from .mcp_invocation import MCPInvocationGuard
from .work_execution import WorkStepRunResult
from .work_routing import WorkRouteStep


class MCPWorkInvocationExecutor(Protocol):
    def execute(
        self,
        plan: Any,
        *,
        params: Mapping[str, Any],
        request_id: str | int,
        timeout_ms: int,
        max_response_bytes: int,
    ) -> Any:
        ...


@dataclass(frozen=True)
class MCPWorkStepBinding:
    """Ephemeral runtime binding from a routed work step to an approved MCP.

    The binding stores policy metadata and a parameter factory, not invocation
    parameters themselves. Permission targets and parameter-factory internals
    are excluded from ``repr`` to avoid turning diagnostics into an accidental
    data store.
    """

    evaluation: MCPGatewayEvaluation
    target: str = field(repr=False)
    params_factory: Callable[[Mapping[str, Any]], Mapping[str, Any]] = field(
        repr=False,
        compare=False,
    )
    approved: bool = False
    reversible: bool | None = None
    timeout_ms: int = 5_000
    max_response_bytes: int = 64 * 1024
    idempotency_parameter: str | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.evaluation, MCPGatewayEvaluation):
            raise TypeError("evaluation must be MCPGatewayEvaluation")
        if not isinstance(self.target, str) or not self.target.strip():
            raise ValueError("MCP work target must be non-empty")
        if not callable(self.params_factory):
            raise TypeError("params_factory must be callable")
        if isinstance(self.timeout_ms, bool) or not isinstance(self.timeout_ms, int) or self.timeout_ms <= 0:
            raise ValueError("timeout_ms must be a positive integer")
        if (
            isinstance(self.max_response_bytes, bool)
            or not isinstance(self.max_response_bytes, int)
            or self.max_response_bytes <= 0
        ):
            raise ValueError("max_response_bytes must be a positive integer")
        if self.idempotency_parameter is not None:
            if (
                not isinstance(self.idempotency_parameter, str)
                or not self.idempotency_parameter.strip()
            ):
                raise ValueError("idempotency_parameter must be non-empty when present")


class MCPWorkStepRunner:
    """Execute one routed MCP work attempt with fresh authorization.

    Each ``run`` call invokes ``MCPInvocationGuard.plan`` again. The runner does
    not accept a pre-built ``MCPInvocationPlan`` and therefore cannot replay an
    authorization across work attempts. The downstream executor still performs
    its own single-use lifecycle and live transport-health checks.

    A transport-level failure is marked retryable only when the caller supplied
    an idempotency key *and* this binding explicitly injects that key into the
    MCP method parameters. Merely claiming an operation is idempotent upstream
    is not enough.
    """

    _RETAINABLE_FAILURES = frozenset(("transport-failure", "jsonrpc-error"))

    def __init__(
        self,
        *,
        guard: MCPInvocationGuard,
        executor: MCPWorkInvocationExecutor,
        bindings: Mapping[str, MCPWorkStepBinding],
        request_id_factory: Callable[[], str | int] | None = None,
    ) -> None:
        if not isinstance(guard, MCPInvocationGuard):
            raise TypeError("guard must be MCPInvocationGuard")
        if not hasattr(executor, "execute") or not callable(executor.execute):
            raise TypeError("executor must provide execute()")
        if any(not isinstance(step_id, str) or not step_id.strip() for step_id in bindings):
            raise ValueError("MCP work binding step ids must be non-empty")
        if any(not isinstance(binding, MCPWorkStepBinding) for binding in bindings.values()):
            raise TypeError("all MCP work bindings must be MCPWorkStepBinding")
        if request_id_factory is not None and not callable(request_id_factory):
            raise TypeError("request_id_factory must be callable")

        self._guard = guard
        self._executor = executor
        self._bindings = dict(bindings)
        self._request_id_factory = request_id_factory or (lambda: secrets.token_hex(16))

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
        if step.route.kind is not RouteKind.TOOL or not step.request.execution_required:
            raise PermissionError("MCP work runner accepts tool execution steps only")
        if isinstance(attempt, bool) or not isinstance(attempt, int) or attempt <= 0:
            raise ValueError("attempt must be a positive integer")
        if not isinstance(dependency_results, Mapping):
            raise TypeError("dependency_results must be a mapping")

        binding = self._bindings.get(step.step_id)
        if binding is None:
            raise LookupError(f"no MCP work binding for step: {step.step_id}")
        self._validate_binding_identity(step, binding)

        params = self._build_params(
            binding,
            dependency_results=dependency_results,
            idempotency_key=idempotency_key,
        )

        # Fresh permission evaluation and fresh short-lived plan on every attempt.
        plan = self._guard.plan(
            binding.evaluation,
            capability=step.route.capability,
            target=binding.target,
            approved=binding.approved,
            reversible=binding.reversible,
        )
        if not plan.ready or not plan.permission.allowed:
            return WorkStepRunResult.failure("permission-denied", retryable=False)

        request_id = self._request_id_factory()
        self._validate_request_id(request_id)

        try:
            invocation = self._executor.execute(
                plan,
                params=params,
                request_id=request_id,
                timeout_ms=binding.timeout_ms,
                max_response_bytes=binding.max_response_bytes,
            )
        except Exception:
            # Executor exceptions may include provider/tool details. Normalize and
            # never retain the exception string here.
            return WorkStepRunResult.failure("executor-failure", retryable=False)

        if not isinstance(getattr(invocation, "success", None), bool):
            return WorkStepRunResult.failure("invalid-executor-result", retryable=False)
        if invocation.success:
            return WorkStepRunResult.success(getattr(invocation, "result", None))

        evidence = getattr(invocation, "evidence", None)
        raw_failure = getattr(evidence, "failure", None)
        failure = (
            raw_failure
            if isinstance(raw_failure, str) and raw_failure in self._RETAINABLE_FAILURES
            else "mcp-invocation-failed"
        )
        retryable = (
            failure == "transport-failure"
            and idempotency_key is not None
            and binding.idempotency_parameter is not None
        )
        return WorkStepRunResult.failure(failure, retryable=retryable)

    @staticmethod
    def _validate_binding_identity(
        step: WorkRouteStep,
        binding: MCPWorkStepBinding,
    ) -> None:
        evaluation = binding.evaluation
        if step.route.target_name != evaluation.tool.name:
            raise PermissionError("MCP work binding tool identity does not match routed target")
        if step.route.capability != step.request.capability:
            raise PermissionError("MCP work route capability does not match request")
        if step.route.capability not in evaluation.permission_map:
            raise PermissionError("MCP work capability is absent from approved discovery schema")

    @staticmethod
    def _build_params(
        binding: MCPWorkStepBinding,
        *,
        dependency_results: Mapping[str, Any],
        idempotency_key: str | None,
    ) -> dict[str, Any]:
        try:
            produced = binding.params_factory(dict(dependency_results))
        except Exception:
            raise RuntimeError("MCP work parameter factory failed") from None
        if not isinstance(produced, Mapping):
            raise TypeError("MCP work params_factory must return a mapping")
        params = dict(produced)

        if idempotency_key is None:
            return params
        if not isinstance(idempotency_key, str) or not idempotency_key.strip():
            raise ValueError("idempotency_key must be non-empty when present")
        parameter = binding.idempotency_parameter
        if parameter is None:
            raise ValueError(
                "MCP retry idempotency key has no explicit tool parameter binding"
            )
        if parameter in params:
            raise ValueError("MCP idempotency parameter is already populated")
        params[parameter] = idempotency_key
        return params

    @staticmethod
    def _validate_request_id(request_id: str | int) -> None:
        if isinstance(request_id, bool) or not isinstance(request_id, (str, int)):
            raise TypeError("MCP work request id must be a string or integer")
        if isinstance(request_id, str) and not request_id.strip():
            raise ValueError("MCP work request id must be non-empty")
