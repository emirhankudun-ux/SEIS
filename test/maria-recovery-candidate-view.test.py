from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.fabric_router import RouteKind
from maria_runtime.recovery_reconciliation import RecoveryAnchor, RecoveryReconciler
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)
from maria_runtime.work_recovery import DurableWorkCheckpointStore

try:
    from maria_runtime.recovery_candidate import (
        RecoveryCandidateDisposition,
        RecoveryCandidateInspector,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("recovery candidate view is missing") from exc


PROJECT = "SEIS"
WORK_ID = "work-001"
GOAL = "SEIS-GOAL-021"
REPO = "emirhankudun-ux/SEIS"
BRANCH = "feature/maria-recovery-candidate-view-v1"
REVISION = "765399903bbccdf42cc51ef3d4bc1ffd26c51383"
NOW = datetime(2026, 9, 11, 9, 50, tzinfo=timezone.utc).isoformat()


def fact(key: str, value: str, *, verified: bool = True) -> ContextFact:
    return ContextFact(
        key=key,
        value=value,
        source="github-fixture",
        project=PROJECT,
        confidence=1.0,
        verified=verified,
        observed_at=NOW,
    )


def context(*, branch: str = BRANCH, verified_branch: bool = True) -> ProjectContextEngine:
    return ProjectContextEngine(
        [
            fact("active_goal", GOAL),
            fact("current_repo", REPO),
            fact("current_branch", branch, verified=verified_branch),
            fact("repository_revision", REVISION),
        ]
    )


def checkpoint(*, complete: bool = False) -> WorkPlanCheckpoint:
    if complete:
        evidence = WorkStepExecutionEvidence(
            step_id="build",
            route_kind=RouteKind.MODEL,
            target_name="fixture-model",
            state=WorkStepState.SUCCEEDED,
            attempts=1,
            depends_on=(),
            failure=None,
        )
        return WorkPlanCheckpoint(
            steps=(evidence,),
            complete=True,
            succeeded_steps=1,
            failed_steps=0,
            blocked_steps=0,
            cancelled_steps=0,
            next_step_id=None,
        )

    evidence = WorkStepExecutionEvidence(
        step_id="build",
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=WorkStepState.CANCELLED,
        attempts=0,
        depends_on=(),
        failure="cancelled",
    )
    return WorkPlanCheckpoint(
        steps=(evidence,),
        complete=False,
        succeeded_steps=0,
        failed_steps=0,
        blocked_steps=0,
        cancelled_steps=1,
        next_step_id="build",
    )


def anchor() -> RecoveryAnchor:
    return RecoveryAnchor(
        project=PROJECT,
        active_goal=GOAL,
        current_repo=REPO,
        current_branch=BRANCH,
        repository_revision=REVISION,
    )


class RecoveryCandidateViewTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.store = DurableWorkCheckpointStore(Path(self.tmp.name))

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def inspector(self, engine: ProjectContextEngine | None = None) -> RecoveryCandidateInspector:
        return RecoveryCandidateInspector(
            store=self.store,
            reconciler=RecoveryReconciler(engine or context()),
        )

    def test_missing_record_is_explicit_and_non_executable(self):
        view = self.inspector().inspect(PROJECT, "missing")
        self.assertEqual(view.disposition, RecoveryCandidateDisposition.NOT_FOUND)
        self.assertIsNone(view.schema_version)
        self.assertFalse(view.replan_required)
        self.assertFalse(view.execution_authorized)

    def test_complete_record_is_complete_even_without_anchor(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(complete=True))
        view = self.inspector().inspect(PROJECT, WORK_ID)
        self.assertEqual(view.disposition, RecoveryCandidateDisposition.COMPLETE)
        self.assertFalse(view.replan_required)
        self.assertFalse(view.execution_authorized)

    def test_incomplete_anchorless_record_requires_anchor_evidence(self):
        self.store.save(PROJECT, WORK_ID, checkpoint())
        view = self.inspector().inspect(PROJECT, WORK_ID)
        self.assertEqual(view.disposition, RecoveryCandidateDisposition.ANCHOR_MISSING)
        self.assertEqual(view.next_step_id, "build")
        self.assertTrue(view.replan_required)
        self.assertFalse(view.execution_authorized)

    def test_aligned_record_still_requires_replan(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        view = self.inspector().inspect(PROJECT, WORK_ID)
        self.assertEqual(
            view.disposition,
            RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED,
        )
        self.assertEqual(view.drift_fields, ())
        self.assertEqual(view.missing_context, ())
        self.assertTrue(view.replan_required)
        self.assertFalse(view.execution_authorized)

    def test_context_drift_is_reported_without_exposing_anchor_payload(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        view = self.inspector(context(branch="feature/other")).inspect(PROJECT, WORK_ID)
        self.assertEqual(view.disposition, RecoveryCandidateDisposition.DRIFT_DETECTED)
        self.assertEqual(view.drift_fields, ("current_branch",))
        self.assertFalse(hasattr(view, "checkpoint"))
        self.assertFalse(hasattr(view, "recovery_anchor"))
        self.assertFalse(view.execution_authorized)

    def test_unverified_current_evidence_is_reported_as_required(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        view = self.inspector(context(verified_branch=False)).inspect(PROJECT, WORK_ID)
        self.assertEqual(view.disposition, RecoveryCandidateDisposition.EVIDENCE_REQUIRED)
        self.assertEqual(view.missing_context, ("current_branch",))
        self.assertFalse(view.execution_authorized)

    def test_inspection_is_read_only(self):
        path = self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        before = path.read_bytes()
        self.inspector().inspect(PROJECT, WORK_ID)
        after = path.read_bytes()
        self.assertEqual(after, before)


if __name__ == "__main__":
    unittest.main()
