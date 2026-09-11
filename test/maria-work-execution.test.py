from __future__ import annotations

import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import CapabilityRequest, RouteDecision, RouteKind
from maria_runtime.work_execution import (
    WorkPlanExecutor,
    WorkStepExecutionPolicy,
    WorkStepRunResult,
    WorkStepState,
)
from maria_runtime.work_routing import WorkRoutePlan, WorkRouteStep


class _SequenceRunner:
    def __init__(self, results):
        self._results = list(results)
        self.calls = []

    def run(self, step, *, dependency_results, attempt, idempotency_key):
        self.calls.append({
            "step_id": step.step_id,
            "dependency_results": dict(dependency_results),
            "attempt": attempt,
            "idempotency_key": idempotency_key,
        })
        if not self._results:
            raise AssertionError("runner called more times than expected")
        return self._results.pop(0)


class WorkPlanExecutionTests(unittest.TestCase):
    @staticmethod
    def _model_step(step_id="reason", *, depends_on=()):
        request = CapabilityRequest(capability="reasoning")
        return WorkRouteStep(
            step_id=step_id,
            request=request,
            route=RouteDecision(
                capability="reasoning",
                kind=RouteKind.MODEL,
                target_name="local-reasoner",
            ),
            depends_on=tuple(depends_on),
        )

    @staticmethod
    def _tool_step(step_id="inspect", *, depends_on=()):
        request = CapabilityRequest(
            capability="repo.inspect",
            execution_required=True,
            project="SEIS",
        )
        return WorkRouteStep(
            step_id=step_id,
            request=request,
            route=RouteDecision(
                capability="repo.inspect",
                kind=RouteKind.TOOL,
                target_name="mcp:github",
                project="SEIS",
            ),
            depends_on=tuple(depends_on),
        )

    def test_dependency_failure_blocks_downstream_without_invoking_its_runner(self):
        model_runner = _SequenceRunner((
            WorkStepRunResult.failure("model-failure", retryable=False),
        ))
        tool_runner = _SequenceRunner(())
        executor = WorkPlanExecutor(
            model_runner=model_runner,
            tool_runner=tool_runner,
        )
        plan = WorkRoutePlan(
            steps=(
                self._model_step("reason"),
                self._tool_step("inspect", depends_on=("reason",)),
            ),
            requires_execution=True,
        )

        result = executor.execute(plan)

        self.assertFalse(result.succeeded)
        self.assertEqual(result.steps[0].evidence.state, WorkStepState.FAILED)
        self.assertEqual(result.steps[0].evidence.attempts, 1)
        self.assertEqual(result.steps[0].evidence.failure, "model-failure")
        self.assertEqual(result.steps[1].evidence.state, WorkStepState.BLOCKED)
        self.assertEqual(result.steps[1].evidence.attempts, 0)
        self.assertEqual(result.steps[1].evidence.failure, "dependency-failed")
        self.assertEqual(len(model_runner.calls), 1)
        self.assertEqual(tool_runner.calls, [])

    def test_tool_retry_requires_explicit_idempotency_contract(self):
        plan = WorkRoutePlan(
            steps=(self._tool_step(),),
            requires_execution=True,
        )
        tool_runner = _SequenceRunner((
            WorkStepRunResult.failure("temporary", retryable=True),
            WorkStepRunResult.success({"ok": True}),
        ))
        executor = WorkPlanExecutor(
            model_runner=_SequenceRunner(()),
            tool_runner=tool_runner,
        )

        with self.assertRaises(ValueError):
            executor.execute(
                plan,
                policies={"inspect": WorkStepExecutionPolicy(max_attempts=2)},
            )
        self.assertEqual(tool_runner.calls, [])

        result = executor.execute(
            plan,
            policies={
                "inspect": WorkStepExecutionPolicy(
                    max_attempts=2,
                    idempotent=True,
                    idempotency_key="repo-inspect:SEIS:fixture",
                )
            },
        )

        self.assertTrue(result.succeeded)
        self.assertEqual(result.steps[0].evidence.state, WorkStepState.SUCCEEDED)
        self.assertEqual(result.steps[0].evidence.attempts, 2)
        self.assertEqual(result.steps[0].result, {"ok": True})
        self.assertEqual(
            [call["attempt"] for call in tool_runner.calls],
            [1, 2],
        )
        self.assertEqual(
            {call["idempotency_key"] for call in tool_runner.calls},
            {"repo-inspect:SEIS:fixture"},
        )

    def test_model_retry_is_bounded_and_only_occurs_for_retryable_failures(self):
        plan = WorkRoutePlan(
            steps=(self._model_step(),),
            requires_execution=False,
        )
        model_runner = _SequenceRunner((
            WorkStepRunResult.failure("transient-model-error", retryable=True),
            WorkStepRunResult.success("reasoned"),
        ))
        executor = WorkPlanExecutor(
            model_runner=model_runner,
            tool_runner=_SequenceRunner(()),
        )

        result = executor.execute(
            plan,
            policies={"reason": WorkStepExecutionPolicy(max_attempts=2)},
        )

        self.assertTrue(result.succeeded)
        self.assertEqual(result.steps[0].result, "reasoned")
        self.assertEqual(result.steps[0].evidence.attempts, 2)
        self.assertEqual([call["attempt"] for call in model_runner.calls], [1, 2])

    def test_dependency_results_are_passed_only_after_success(self):
        model_runner = _SequenceRunner((WorkStepRunResult.success("analysis"),))
        tool_runner = _SequenceRunner((WorkStepRunResult.success("snapshot"),))
        executor = WorkPlanExecutor(model_runner=model_runner, tool_runner=tool_runner)
        plan = WorkRoutePlan(
            steps=(
                self._model_step("reason"),
                self._tool_step("inspect", depends_on=("reason",)),
            ),
            requires_execution=True,
        )

        result = executor.execute(plan)

        self.assertTrue(result.succeeded)
        self.assertEqual(tool_runner.calls[0]["dependency_results"], {"reason": "analysis"})
        self.assertEqual(result.steps[0].evidence.depends_on, ())
        self.assertEqual(result.steps[1].evidence.depends_on, ("reason",))
        self.assertFalse(hasattr(result.steps[1].evidence, "result"))

    def test_unknown_policy_and_unbounded_attempts_fail_closed(self):
        executor = WorkPlanExecutor(
            model_runner=_SequenceRunner(()),
            tool_runner=_SequenceRunner(()),
        )
        plan = WorkRoutePlan(
            steps=(self._model_step(),),
            requires_execution=False,
        )

        with self.assertRaises(LookupError):
            executor.execute(
                plan,
                policies={"missing": WorkStepExecutionPolicy()},
            )
        with self.assertRaises(ValueError):
            WorkStepExecutionPolicy(max_attempts=0)
        with self.assertRaises(ValueError):
            WorkStepExecutionPolicy(max_attempts=4)


if __name__ == "__main__":
    unittest.main()
