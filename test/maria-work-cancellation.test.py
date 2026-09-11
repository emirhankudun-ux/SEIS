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
        self.calls.append((step.step_id, attempt))
        if not self._results:
            raise AssertionError("runner called more times than expected")
        return self._results.pop(0)


class WorkCancellationTests(unittest.TestCase):
    @staticmethod
    def _model_step(step_id, *, depends_on=()):
        request = CapabilityRequest(
            capability="reasoning",
            execution_required=False,
            project="SEIS",
        )
        return WorkRouteStep(
            step_id=step_id,
            request=request,
            route=RouteDecision(
                capability="reasoning",
                kind=RouteKind.MODEL,
                target_name="local-reasoner",
                project="SEIS",
            ),
            depends_on=tuple(depends_on),
        )

    @classmethod
    def _plan(cls):
        return WorkRoutePlan(
            steps=(
                cls._model_step("first"),
                cls._model_step("second", depends_on=("first",)),
            ),
            requires_execution=False,
        )

    def test_cancellation_before_first_step_skips_every_runner(self):
        runner = _SequenceRunner(())
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))

        result = executor.execute(self._plan(), cancel_requested=lambda: True)

        self.assertFalse(result.succeeded)
        self.assertTrue(result.cancelled)
        self.assertEqual(runner.calls, [])
        self.assertEqual(
            [step.evidence.state for step in result.steps],
            [WorkStepState.CANCELLED, WorkStepState.CANCELLED],
        )
        self.assertEqual([step.evidence.attempts for step in result.steps], [0, 0])
        self.assertEqual(result.steps[0].evidence.failure, "cancelled")

    def test_cancellation_after_success_preserves_success_and_cancels_remaining(self):
        runner = _SequenceRunner((WorkStepRunResult.success("first-secret"),))
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))

        result = executor.execute(
            self._plan(),
            cancel_requested=lambda: len(runner.calls) >= 1,
        )

        self.assertFalse(result.succeeded)
        self.assertEqual(runner.calls, [("first", 1)])
        self.assertEqual(result.steps[0].evidence.state, WorkStepState.SUCCEEDED)
        self.assertEqual(result.steps[1].evidence.state, WorkStepState.CANCELLED)
        self.assertEqual(result.steps[1].evidence.attempts, 0)

    def test_cancellation_between_retries_stops_before_second_attempt(self):
        runner = _SequenceRunner((
            WorkStepRunResult.failure("temporarily-unavailable", retryable=True),
        ))
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))
        plan = WorkRoutePlan(
            steps=(self._model_step("first"),),
            requires_execution=False,
        )

        result = executor.execute(
            plan,
            policies={"first": WorkStepExecutionPolicy(max_attempts=2)},
            cancel_requested=lambda: len(runner.calls) >= 1,
        )

        self.assertFalse(result.succeeded)
        self.assertTrue(result.cancelled)
        self.assertEqual(runner.calls, [("first", 1)])
        self.assertEqual(result.steps[0].evidence.state, WorkStepState.CANCELLED)
        self.assertEqual(result.steps[0].evidence.attempts, 1)
        self.assertEqual(result.steps[0].evidence.failure, "cancelled")

    def test_cancellation_source_failure_fails_closed_without_runner_call(self):
        runner = _SequenceRunner(())
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))

        def broken_source():
            raise RuntimeError("SECRET_CANCELLATION_SOURCE_DETAIL")

        result = executor.execute(self._plan(), cancel_requested=broken_source)

        self.assertFalse(result.succeeded)
        self.assertTrue(result.cancelled)
        self.assertEqual(runner.calls, [])
        self.assertEqual(result.steps[0].evidence.state, WorkStepState.CANCELLED)
        self.assertEqual(result.steps[0].evidence.failure, "cancellation-source-failure")
        self.assertNotIn("SECRET_CANCELLATION_SOURCE_DETAIL", repr(result))

    def test_checkpoint_contains_only_redacted_evidence_and_counts(self):
        secret = "RAW_TRANSIENT_RESULT_MUST_NOT_ENTER_CHECKPOINT"
        runner = _SequenceRunner((WorkStepRunResult.success({"secret": secret}),))
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))
        plan = WorkRoutePlan(
            steps=(self._model_step("first"),),
            requires_execution=False,
        )

        result = executor.execute(plan)
        checkpoint = result.checkpoint()

        self.assertTrue(checkpoint.complete)
        self.assertEqual(checkpoint.succeeded_steps, 1)
        self.assertEqual(checkpoint.failed_steps, 0)
        self.assertEqual(checkpoint.blocked_steps, 0)
        self.assertEqual(checkpoint.cancelled_steps, 0)
        self.assertIsNone(checkpoint.next_step_id)
        self.assertEqual(checkpoint.steps[0].state, WorkStepState.SUCCEEDED)
        self.assertNotIn(secret, repr(checkpoint))
        self.assertFalse(hasattr(checkpoint.steps[0], "result"))

    def test_cancelled_checkpoint_reports_next_safe_step(self):
        runner = _SequenceRunner(())
        executor = WorkPlanExecutor(model_runner=runner, tool_runner=_SequenceRunner(()))
        result = executor.execute(self._plan(), cancel_requested=lambda: True)
        checkpoint = result.checkpoint()

        self.assertFalse(checkpoint.complete)
        self.assertEqual(checkpoint.cancelled_steps, 2)
        self.assertEqual(checkpoint.next_step_id, "first")


if __name__ == "__main__":
    unittest.main()
