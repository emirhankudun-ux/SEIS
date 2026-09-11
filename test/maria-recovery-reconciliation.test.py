from __future__ import annotations

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.context import ContextFact, ProjectContextEngine
from maria_runtime.fabric_router import RouteKind
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)

try:
    from maria_runtime.recovery_reconciliation import (
        RecoveryAnchor,
        RecoveryReconciler,
        RecoveryReconciliationDisposition,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("recovery reconciliation module is missing") from exc


PROJECT = "SEIS"
REPO = "emirhankudun-ux/SEIS"
BRANCH = "feature/maria-recovery-integration-v1"
GOAL = "SEIS-GOAL-021"
REVISION = "abc123"


def fact(key: str, value: str, *, verified: bool = True) -> ContextFact:
    return ContextFact(
        key=key,
        value=value,
        source="fixture",
        project=PROJECT,
        confidence=1.0,
        verified=verified,
        observed_at="2026-09-11T08:45:00Z",
    )


def context(*, branch: str = BRANCH, revision: str = REVISION, verified_branch: bool = True) -> ProjectContextEngine:
    return ProjectContextEngine(
        (
            fact("active_goal", GOAL),
            fact("current_repo", REPO),
            fact("current_branch", branch, verified=verified_branch),
            fact("repository_revision", revision),
        )
    )


def cancelled_checkpoint() -> WorkPlanCheckpoint:
    step = WorkStepExecutionEvidence(
        step_id="build",
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=WorkStepState.CANCELLED,
        attempts=0,
        depends_on=(),
        failure="cancel-requested",
    )
    return WorkPlanCheckpoint(
        steps=(step,),
        complete=False,
        succeeded_steps=0,
        failed_steps=0,
        blocked_steps=0,
        cancelled_steps=1,
        next_step_id="build",
    )


def complete_checkpoint() -> WorkPlanCheckpoint:
    step = WorkStepExecutionEvidence(
        step_id="build",
        route_kind=RouteKind.MODEL,
        target_name="fixture-model",
        state=WorkStepState.SUCCEEDED,
        attempts=1,
        depends_on=(),
        failure=None,
    )
    return WorkPlanCheckpoint(
        steps=(step,),
        complete=True,
        succeeded_steps=1,
        failed_steps=0,
        blocked_steps=0,
        cancelled_steps=0,
        next_step_id=None,
    )


class RecoveryReconciliationTests(unittest.TestCase):
    def anchor(self, *, revision: str | None = REVISION) -> RecoveryAnchor:
        return RecoveryAnchor(
            project=PROJECT,
            active_goal=GOAL,
            current_repo=REPO,
            current_branch=BRANCH,
            repository_revision=revision,
        )

    def test_aligned_context_still_requires_replan_and_never_authorizes_execution(self):
        assessment = RecoveryReconciler(context()).reconcile(
            cancelled_checkpoint(),
            self.anchor(),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.ALIGNED_REPLAN_REQUIRED,
        )
        self.assertEqual(assessment.drift_fields, ())
        self.assertEqual(assessment.missing_context, ())
        self.assertTrue(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_branch_drift_is_detected_fail_closed(self):
        assessment = RecoveryReconciler(context(branch="feature/other")).reconcile(
            cancelled_checkpoint(),
            self.anchor(),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.DRIFT_DETECTED,
        )
        self.assertEqual(assessment.drift_fields, ("current_branch",))
        self.assertTrue(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_repository_revision_drift_is_detected_when_anchor_has_revision(self):
        assessment = RecoveryReconciler(context(revision="def456")).reconcile(
            cancelled_checkpoint(),
            self.anchor(),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.DRIFT_DETECTED,
        )
        self.assertEqual(assessment.drift_fields, ("repository_revision",))

    def test_unverified_required_current_context_requires_fresh_evidence(self):
        assessment = RecoveryReconciler(context(verified_branch=False)).reconcile(
            cancelled_checkpoint(),
            self.anchor(),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.EVIDENCE_REQUIRED,
        )
        self.assertIn("current_branch", assessment.missing_context)
        self.assertEqual(assessment.drift_fields, ())
        self.assertTrue(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_revision_is_optional_only_when_checkpoint_anchor_did_not_record_one(self):
        current = ProjectContextEngine(
            (
                fact("active_goal", GOAL),
                fact("current_repo", REPO),
                fact("current_branch", BRANCH),
            )
        )
        assessment = RecoveryReconciler(current).reconcile(
            cancelled_checkpoint(),
            self.anchor(revision=None),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.ALIGNED_REPLAN_REQUIRED,
        )
        self.assertEqual(assessment.missing_context, ())

    def test_complete_checkpoint_short_circuits_as_complete(self):
        assessment = RecoveryReconciler(ProjectContextEngine()).reconcile(
            complete_checkpoint(),
            self.anchor(),
        )
        self.assertEqual(
            assessment.disposition,
            RecoveryReconciliationDisposition.COMPLETE,
        )
        self.assertFalse(assessment.replan_required)
        self.assertFalse(assessment.execution_authorized)

    def test_anchor_rejects_blank_identity_fields(self):
        for field_name in ("project", "active_goal", "current_repo", "current_branch"):
            values = {
                "project": PROJECT,
                "active_goal": GOAL,
                "current_repo": REPO,
                "current_branch": BRANCH,
            }
            values[field_name] = "   "
            with self.subTest(field_name=field_name):
                with self.assertRaises(ValueError):
                    RecoveryAnchor(**values)


if __name__ == "__main__":
    unittest.main()
