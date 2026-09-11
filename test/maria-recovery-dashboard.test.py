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
from maria_runtime.recovery_candidate import RecoveryCandidateDisposition, RecoveryCandidateInspector
from maria_runtime.recovery_reconciliation import RecoveryAnchor, RecoveryReconciler
from maria_runtime.work_execution import WorkPlanCheckpoint, WorkStepExecutionEvidence, WorkStepState
from maria_runtime.work_recovery import DurableWorkCheckpointStore

try:
    from maria_runtime.recovery_dashboard import RecoveryDashboardBuilder
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("recovery dashboard snapshot is missing") from exc

PROJECT = "SEIS"
GOAL = "SEIS-GOAL-021"
REPO = "emirhankudun-ux/SEIS"
BRANCH = "feature/maria-recovery-dashboard-v1"
REVISION = "42f5db3a1589e183e022c2e81fe740afdaed959f"
NOW = datetime(2026, 9, 11, 10, 0, tzinfo=timezone.utc).isoformat()


def fact(key: str, value: str) -> ContextFact:
    return ContextFact(key=key, value=value, source="github-fixture", project=PROJECT, confidence=1.0, verified=True, observed_at=NOW)


def context(*, branch: str = BRANCH) -> ProjectContextEngine:
    return ProjectContextEngine([
        fact("active_goal", GOAL),
        fact("current_repo", REPO),
        fact("current_branch", branch),
        fact("repository_revision", REVISION),
    ])


def checkpoint(*, complete: bool = False) -> WorkPlanCheckpoint:
    state = WorkStepState.SUCCEEDED if complete else WorkStepState.CANCELLED
    evidence = WorkStepExecutionEvidence(
        step_id="build", route_kind=RouteKind.MODEL, target_name="fixture-model",
        state=state, attempts=1 if complete else 0, depends_on=(), failure=None if complete else "cancelled",
    )
    return WorkPlanCheckpoint(
        steps=(evidence,), complete=complete,
        succeeded_steps=1 if complete else 0, failed_steps=0, blocked_steps=0,
        cancelled_steps=0 if complete else 1, next_step_id=None if complete else "build",
    )


def anchor() -> RecoveryAnchor:
    return RecoveryAnchor(project=PROJECT, active_goal=GOAL, current_repo=REPO, current_branch=BRANCH, repository_revision=REVISION)


class RecoveryDashboardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.store = DurableWorkCheckpointStore(Path(self.tmp.name))

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def builder(self, engine: ProjectContextEngine | None = None) -> RecoveryDashboardBuilder:
        inspector = RecoveryCandidateInspector(store=self.store, reconciler=RecoveryReconciler(engine or context()))
        return RecoveryDashboardBuilder(store=self.store, inspector=inspector)

    def test_snapshot_returns_bounded_public_safe_rows_in_work_id_order(self):
        self.store.save(PROJECT, "work-b", checkpoint(), recovery_anchor=anchor())
        self.store.save(PROJECT, "work-a", checkpoint())
        snapshot = self.builder().snapshot(PROJECT)
        self.assertEqual(tuple(row.work_id for row in snapshot.rows), ("work-a", "work-b"))
        self.assertEqual(snapshot.total_candidates, 2)
        self.assertEqual(snapshot.rows[0].disposition, RecoveryCandidateDisposition.ANCHOR_MISSING)
        self.assertEqual(snapshot.rows[1].disposition, RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED)
        self.assertFalse(hasattr(snapshot.rows[0], "checkpoint"))
        self.assertFalse(hasattr(snapshot.rows[0], "recovery_anchor"))
        self.assertFalse(snapshot.execution_authorized)

    def test_complete_records_are_excluded_by_default_and_optional_when_requested(self):
        self.store.save(PROJECT, "work-a", checkpoint(complete=True))
        self.assertEqual(self.builder().snapshot(PROJECT).rows, ())
        included = self.builder().snapshot(PROJECT, include_complete=True)
        self.assertEqual(len(included.rows), 1)
        self.assertEqual(included.rows[0].disposition, RecoveryCandidateDisposition.COMPLETE)

    def test_drift_counts_are_aggregated_without_exposing_payloads(self):
        self.store.save(PROJECT, "work-a", checkpoint(), recovery_anchor=anchor())
        snapshot = self.builder(context(branch="feature/other")).snapshot(PROJECT)
        self.assertEqual(snapshot.drift_detected, 1)
        self.assertEqual(snapshot.replan_required, 1)
        self.assertEqual(snapshot.rows[0].drift_fields, ("current_branch",))
        self.assertFalse(snapshot.execution_authorized)

    def test_limit_is_forwarded_to_bounded_catalog_discovery(self):
        self.store.save(PROJECT, "work-a", checkpoint())
        self.store.save(PROJECT, "work-b", checkpoint())
        with self.assertRaises(Exception):
            self.builder().snapshot(PROJECT, limit=1)

    def test_snapshot_is_read_only(self):
        path = self.store.save(PROJECT, "work-a", checkpoint(), recovery_anchor=anchor())
        before = path.read_bytes()
        self.builder().snapshot(PROJECT)
        self.assertEqual(path.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
