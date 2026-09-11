from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)
from maria_runtime.work_recovery import CheckpointCorruptError, DurableWorkCheckpointStore


def step(
    step_id: str,
    state: WorkStepState,
    *,
    depends_on: tuple[str, ...] = (),
    attempts: int = 1,
    failure: str | None = None,
) -> WorkStepExecutionEvidence:
    return WorkStepExecutionEvidence(
        step_id=step_id,
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=state,
        attempts=attempts,
        depends_on=depends_on,
        failure=failure,
    )


def checkpoint(
    *steps: WorkStepExecutionEvidence,
    next_step_id: str | None = None,
) -> WorkPlanCheckpoint:
    succeeded = sum(item.state is WorkStepState.SUCCEEDED for item in steps)
    failed = sum(item.state is WorkStepState.FAILED for item in steps)
    blocked = sum(item.state is WorkStepState.BLOCKED for item in steps)
    cancelled = sum(item.state is WorkStepState.CANCELLED for item in steps)
    return WorkPlanCheckpoint(
        steps=tuple(steps),
        complete=cancelled == 0,
        succeeded_steps=succeeded,
        failed_steps=failed,
        blocked_steps=blocked,
        cancelled_steps=cancelled,
        next_step_id=next_step_id,
    )


class DurableCheckpointInvariantTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.store = DurableWorkCheckpointStore(Path(self.tmp.name))

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_save_rejects_forward_or_unknown_dependency(self):
        malformed = checkpoint(
            step("build", WorkStepState.SUCCEEDED, depends_on=("plan",)),
            step("plan", WorkStepState.SUCCEEDED),
        )
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "work-forward", malformed)

    def test_save_rejects_duplicate_dependency_identifiers(self):
        malformed = checkpoint(
            step("plan", WorkStepState.SUCCEEDED),
            step(
                "build",
                WorkStepState.SUCCEEDED,
                depends_on=("plan", "plan"),
            ),
        )
        with self.assertRaises(ValueError):
            self.store.save("SEIS", "work-duplicate-dependency", malformed)

    def test_load_rejects_next_step_that_skips_first_cancelled_step(self):
        original = checkpoint(
            step("plan", WorkStepState.SUCCEEDED),
            step(
                "build",
                WorkStepState.CANCELLED,
                attempts=0,
                failure="cancelled",
            ),
            step(
                "verify",
                WorkStepState.CANCELLED,
                attempts=0,
                failure="cancelled",
            ),
            next_step_id="build",
        )
        path = self.store.save("SEIS", "work-cancelled", original)
        payload = json.loads(path.read_text("utf-8"))
        payload["checkpoint"]["next_step_id"] = "verify"
        path.write_text(json.dumps(payload), "utf-8")

        with self.assertRaises(CheckpointCorruptError):
            self.store.load("SEIS", "work-cancelled")

    def test_save_rejects_impossible_state_attempt_and_failure_combinations(self):
        malformed_steps = (
            step("succeeded-zero", WorkStepState.SUCCEEDED, attempts=0),
            step(
                "succeeded-failure",
                WorkStepState.SUCCEEDED,
                attempts=1,
                failure="unexpected",
            ),
            step(
                "failed-zero",
                WorkStepState.FAILED,
                attempts=0,
                failure="runner-failure",
            ),
            step("failed-missing", WorkStepState.FAILED, attempts=1),
            step(
                "blocked-attempted",
                WorkStepState.BLOCKED,
                attempts=1,
                failure="dependency-failed",
            ),
            step("blocked-missing", WorkStepState.BLOCKED, attempts=0),
            step("cancelled-missing", WorkStepState.CANCELLED, attempts=0),
        )

        for malformed in malformed_steps:
            with self.subTest(step_id=malformed.step_id):
                next_step_id = (
                    malformed.step_id
                    if malformed.state is WorkStepState.CANCELLED
                    else None
                )
                with self.assertRaises(ValueError):
                    self.store.save(
                        "SEIS",
                        f"work-{malformed.step_id}",
                        checkpoint(malformed, next_step_id=next_step_id),
                    )


if __name__ == "__main__":
    unittest.main()
