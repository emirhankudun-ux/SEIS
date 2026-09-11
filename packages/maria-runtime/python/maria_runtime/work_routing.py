from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .fabric_router import CapabilityRequest, RouteDecision, UnifiedCapabilityRouter


@dataclass(frozen=True)
class WorkStepRequest:
    """One dependency-aware routing request in a bounded work plan."""

    step_id: str
    request: CapabilityRequest
    depends_on: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not self.step_id.strip():
            raise ValueError("step_id must be non-empty")
        if not isinstance(self.request, CapabilityRequest):
            raise TypeError("request must be CapabilityRequest")
        if any(not dependency.strip() for dependency in self.depends_on):
            raise ValueError("dependency ids must be non-empty")
        if len(set(self.depends_on)) != len(self.depends_on):
            raise ValueError("depends_on cannot contain duplicate ids")
        if self.step_id in self.depends_on:
            raise ValueError("a work step cannot depend on itself")


@dataclass(frozen=True)
class WorkRouteStep:
    step_id: str
    request: CapabilityRequest
    route: RouteDecision
    depends_on: tuple[str, ...]


@dataclass(frozen=True)
class WorkRoutePlan:
    """Pure route plan; it carries no model/tool execution authority."""

    steps: tuple[WorkRouteStep, ...]
    requires_execution: bool


class MultiStepWorkRouter:
    """Compose cognition and execution routes without crossing trust domains.

    This planner is deliberately side-effect free. It topologically orders a
    bounded dependency graph, asks ``UnifiedCapabilityRouter`` to resolve each
    step, and returns route metadata only. Tool routes are not invoked and model
    routes are not prompted here.

    Because ``UnifiedCapabilityRouter`` keeps model and tool registries separate,
    an execution step cannot silently fall back to a language model when no
    verified tool exists.
    """

    def __init__(
        self,
        router: UnifiedCapabilityRouter,
        *,
        max_steps: int = 32,
    ) -> None:
        if not isinstance(router, UnifiedCapabilityRouter):
            raise TypeError("router must be UnifiedCapabilityRouter")
        if max_steps <= 0:
            raise ValueError("max_steps must be positive")
        self.router = router
        self.max_steps = int(max_steps)

    def plan(self, steps: Iterable[WorkStepRequest]) -> WorkRoutePlan:
        requested = tuple(steps)
        if not requested:
            raise ValueError("work plan must contain at least one step")
        if len(requested) > self.max_steps:
            raise ValueError("work plan exceeds configured step limit")
        if any(not isinstance(step, WorkStepRequest) for step in requested):
            raise TypeError("all work plan entries must be WorkStepRequest")

        by_id: dict[str, WorkStepRequest] = {}
        for step in requested:
            if step.step_id in by_id:
                raise ValueError(f"duplicate work step id: {step.step_id}")
            by_id[step.step_id] = step

        known_ids = set(by_id)
        for step in requested:
            missing = [dependency for dependency in step.depends_on if dependency not in known_ids]
            if missing:
                raise LookupError(
                    f"work step {step.step_id!r} depends on unknown step: {missing[0]!r}"
                )

        ordered = self._topological_order(requested)
        routed: list[WorkRouteStep] = []
        for step in ordered:
            decision = self.router.route(step.request)
            routed.append(
                WorkRouteStep(
                    step_id=step.step_id,
                    request=step.request,
                    route=decision,
                    depends_on=step.depends_on,
                )
            )

        return WorkRoutePlan(
            steps=tuple(routed),
            requires_execution=any(step.request.execution_required for step in ordered),
        )

    @staticmethod
    def _topological_order(
        requested: tuple[WorkStepRequest, ...],
    ) -> tuple[WorkStepRequest, ...]:
        resolved: set[str] = set()
        remaining = list(requested)
        ordered: list[WorkStepRequest] = []

        while remaining:
            progressed = False
            next_remaining: list[WorkStepRequest] = []
            for step in remaining:
                if all(dependency in resolved for dependency in step.depends_on):
                    ordered.append(step)
                    resolved.add(step.step_id)
                    progressed = True
                else:
                    next_remaining.append(step)
            if not progressed:
                raise ValueError("work plan contains a dependency cycle")
            remaining = next_remaining

        return tuple(ordered)
