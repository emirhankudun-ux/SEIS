from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Mapping, Protocol

from .fabric_router import RouteKind
from .work_routing import WorkRoutePlan, WorkRouteStep


class WorkStepState(str, Enum):
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass(frozen=True)
class WorkStepExecutionPolicy:
    """Bounded retry contract for one routed work step.

    Tool retries are never enabled by ``max_attempts`` alone. A caller must also
    declare the operation idempotent and supply a stable idempotency key. This
    keeps a transport-level failure from silently becoming a duplicated external
    mutation.
    """

    max_attempts: int = 1
    idempotent: bool = False
    idempotency_key: str | None = None

    MAX_ATTEMPTS = 3

    def __post_init__(self) -> None:
        if isinstance(self.max_attempts, bool) or not isinstance(self.max_attempts, int):
            raise TypeError("max_attempts must be an integer")
        if not 1 <= self.max_attempts <= self.MAX_ATTEMPTS:
            raise ValueError(
                f"max_attempts must be between 1 and {self.MAX_ATTEMPTS}"
            )
        if self.idempotency_key is not None:
            if not isinstance(self.idempotency_key, str) or not self.idempotency_key.strip():
                raise ValueError("idempotency_key must be non-empty when present")
            if not self.idempotent:
                raise ValueError("idempotency_key requires idempotent=True")


@dataclass(frozen=True)
class WorkStepRunResult:
    """Transient runner result; payloads are not copied into retained evidence."""

    succeeded: bool
    result: Any | None = field(default=None, repr=False)
    failure_category: str | None = None
    retryable: bool = False

    def __post_init__(self) -> None:
        if self.succeeded:
            if self.failure_category is not None:
                raise ValueError("successful step result cannot carry failure evidence")
            if self.retryable:
                raise ValueError("successful step result cannot be retryable")
        else:
            if (
                not isinstance(self.failure_category, str)
                or not self.failure_category.strip()
            ):
                raise ValueError("failed step result requires a normalized failure category")

    @classmethod
    def success(cls, result: Any | None = None) -> "WorkStepRunResult":
        return cls(succeeded=True, result=result)

    @classmethod
    def failure(
        cls,
        failure: str,
        *,
        retryable: bool = False,
    ) -> "WorkStepRunResult":
        return cls(
            succeeded=False,
            result=None,
            failure_category=failure,
            retryable=bool(retryable),
        )


class WorkStepRunner(Protocol):
    """One-attempt execution boundary used by ``WorkPlanExecutor``.

    Tool runner implementations are responsible for obtaining fresh per-attempt
    authorization before touching an external system. The orchestrator never
    accepts or caches a pre-authorized capability token.
    """

    def run(
        self,
        step: WorkRouteStep,
        *,
        dependency_results: Mapping[str, Any],
        attempt: int,
        idempotency_key: str | None,
    ) -> WorkStepRunResult:
        ...


@dataclass(frozen=True)
class WorkStepExecutionEvidence:
    """Redacted, retainable evidence for one work step.

    Results, prompts, parameters, permission targets, exceptions and raw tool
    output deliberately have no field here.
    """

    step_id: str
    route_kind: RouteKind
    target_name: str
    state: WorkStepState
    attempts: int
    depends_on: tuple[str, ...]
    failure: str | None = None


@dataclass(frozen=True)
class WorkStepExecutionResult:
    evidence: WorkStepExecutionEvidence
    result: Any | None = field(default=None, repr=False)


@dataclass(frozen=True)
class WorkPlanExecutionResult:
    steps: tuple[WorkStepExecutionResult, ...]
    succeeded: bool

    def get(self, step_id: str) -> WorkStepExecutionResult | None:
        for step in self.steps:
            if step.evidence.step_id == step_id:
                return step
        return None


class WorkPlanExecutor:
    """Execute a pre-routed bounded plan without weakening trust boundaries.

    ``MultiStepWorkRouter`` decides *where* a step may go. This class only
    orchestrates the already-routed plan: dependency gating, bounded attempts,
    normalized evidence, and explicit idempotency policy for retries.

    External authorization remains per-attempt and belongs inside the supplied
    tool runner. No permission decision, MCP invocation plan, secret, or raw
    output is cached by this orchestrator.
    """

    def __init__(
        self,
        *,
        model_runner: WorkStepRunner,
        tool_runner: WorkStepRunner,
        max_total_attempts: int = 96,
    ) -> None:
        if not hasattr(model_runner, "run") or not callable(model_runner.run):
            raise TypeError("model_runner must provide run()")
        if not hasattr(tool_runner, "run") or not callable(tool_runner.run):
            raise TypeError("tool_runner must provide run()")
        if (
            isinstance(max_total_attempts, bool)
            or not isinstance(max_total_attempts, int)
            or max_total_attempts <= 0
        ):
            raise ValueError("max_total_attempts must be a positive integer")
        self._model_runner = model_runner
        self._tool_runner = tool_runner
        self._max_total_attempts = max_total_attempts

    def execute(
        self,
        plan: WorkRoutePlan,
        *,
        policies: Mapping[str, WorkStepExecutionPolicy] | None = None,
    ) -> WorkPlanExecutionResult:
        if not isinstance(plan, WorkRoutePlan):
            raise TypeError("plan must be WorkRoutePlan")

        normalized_policies = dict(policies or {})
        self._preflight(plan, normalized_policies)

        results_by_id: dict[str, WorkStepExecutionResult] = {}
        ordered_results: list[WorkStepExecutionResult] = []

        for step in plan.steps:
            failed_dependency = any(
                results_by_id[dependency].evidence.state is not WorkStepState.SUCCEEDED
                for dependency in step.depends_on
            )
            if failed_dependency:
                result = WorkStepExecutionResult(
                    evidence=WorkStepExecutionEvidence(
                        step_id=step.step_id,
                        route_kind=step.route.kind,
                        target_name=step.route.target_name,
                        state=WorkStepState.BLOCKED,
                        attempts=0,
                        depends_on=step.depends_on,
                        failure="dependency-failed",
                    ),
                )
                results_by_id[step.step_id] = result
                ordered_results.append(result)
                continue

            policy = normalized_policies.get(step.step_id, WorkStepExecutionPolicy())
            dependency_results = {
                dependency: results_by_id[dependency].result
                for dependency in step.depends_on
            }
            runner = (
                self._tool_runner
                if step.route.kind is RouteKind.TOOL
                else self._model_runner
            )
            result = self._run_step(
                step,
                runner=runner,
                dependency_results=dependency_results,
                policy=policy,
            )
            results_by_id[step.step_id] = result
            ordered_results.append(result)

        return WorkPlanExecutionResult(
            steps=tuple(ordered_results),
            succeeded=all(
                item.evidence.state is WorkStepState.SUCCEEDED
                for item in ordered_results
            ),
        )

    def _preflight(
        self,
        plan: WorkRoutePlan,
        policies: Mapping[str, WorkStepExecutionPolicy],
    ) -> None:
        if not plan.steps:
            raise ValueError("work execution plan must contain at least one step")

        step_ids = tuple(step.step_id for step in plan.steps)
        if len(set(step_ids)) != len(step_ids):
            raise ValueError("work execution plan contains duplicate step ids")
        known_ids = set(step_ids)

        unknown_policies = set(policies) - known_ids
        if unknown_policies:
            raise LookupError(
                f"execution policy references unknown step: {sorted(unknown_policies)[0]!r}"
            )
        if any(not isinstance(policy, WorkStepExecutionPolicy) for policy in policies.values()):
            raise TypeError("all execution policies must be WorkStepExecutionPolicy")

        seen: set[str] = set()
        planned_attempts = 0
        has_tool_step = False
        for step in plan.steps:
            if not isinstance(step, WorkRouteStep):
                raise TypeError("all execution plan entries must be WorkRouteStep")
            if any(dependency not in known_ids for dependency in step.depends_on):
                raise LookupError("work execution plan contains unknown dependency")
            if any(dependency not in seen for dependency in step.depends_on):
                raise ValueError("work execution plan is not topologically ordered")
            if step.route.capability != step.request.capability:
                raise ValueError("work route capability does not match request")
            if step.request.execution_required != (step.route.kind is RouteKind.TOOL):
                raise PermissionError("work route kind does not match execution authority")

            policy = policies.get(step.step_id, WorkStepExecutionPolicy())
            self._validate_retry_policy(step, policy)
            planned_attempts += policy.max_attempts
            if step.route.kind is RouteKind.TOOL:
                has_tool_step = True
            seen.add(step.step_id)

        if planned_attempts > self._max_total_attempts:
            raise ValueError("work execution attempt budget exceeds configured limit")
        if bool(plan.requires_execution) != has_tool_step:
            raise ValueError("work plan execution flag does not match routed tool steps")

    @staticmethod
    def _validate_retry_policy(
        step: WorkRouteStep,
        policy: WorkStepExecutionPolicy,
    ) -> None:
        if step.route.kind is RouteKind.TOOL and policy.max_attempts > 1:
            if not policy.idempotent or policy.idempotency_key is None:
                raise ValueError(
                    "tool retries require idempotent=True and an explicit idempotency_key"
                )

    @staticmethod
    def _run_step(
        step: WorkRouteStep,
        *,
        runner: WorkStepRunner,
        dependency_results: Mapping[str, Any],
        policy: WorkStepExecutionPolicy,
    ) -> WorkStepExecutionResult:
        final: WorkStepRunResult | None = None
        attempts = 0

        for attempt in range(1, policy.max_attempts + 1):
            attempts = attempt
            try:
                candidate = runner.run(
                    step,
                    dependency_results=dependency_results,
                    attempt=attempt,
                    idempotency_key=policy.idempotency_key,
                )
            except Exception:
                # Runner exceptions may contain prompts, paths, provider output or
                # credentials. Normalize without retaining exception text.
                candidate = WorkStepRunResult.failure(
                    "runner-failure",
                    retryable=False,
                )

            if not isinstance(candidate, WorkStepRunResult):
                candidate = WorkStepRunResult.failure(
                    "invalid-runner-result",
                    retryable=False,
                )
            final = candidate

            if candidate.succeeded:
                return WorkStepExecutionResult(
                    evidence=WorkStepExecutionEvidence(
                        step_id=step.step_id,
                        route_kind=step.route.kind,
                        target_name=step.route.target_name,
                        state=WorkStepState.SUCCEEDED,
                        attempts=attempts,
                        depends_on=step.depends_on,
                    ),
                    result=candidate.result,
                )
            if not candidate.retryable:
                break

        assert final is not None
        return WorkStepExecutionResult(
            evidence=WorkStepExecutionEvidence(
                step_id=step.step_id,
                route_kind=step.route.kind,
                target_name=step.route.target_name,
                state=WorkStepState.FAILED,
                attempts=attempts,
                depends_on=step.depends_on,
                failure=final.failure_category,
            ),
        )
