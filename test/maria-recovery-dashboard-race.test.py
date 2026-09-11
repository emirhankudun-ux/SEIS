from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.context import ProjectContextEngine
from maria_runtime.recovery_candidate import RecoveryCandidateInspector
from maria_runtime.recovery_dashboard import RecoveryDashboardBuilder
from maria_runtime.recovery_reconciliation import RecoveryReconciler
from maria_runtime.work_execution import WorkPlanCheckpoint, WorkStepExecutionEvidence, WorkStepState
from maria_runtime.work_recovery import CheckpointCorruptError, DurableWorkCheckpointStore


def checkpoint(*, complete: bool = False) -> WorkPlanCheckpoint:
    step = WorkStepExecutionEvidence(
        step_id="build", route_kind=RouteKind.MODEL, target_name="fixture-model",
        state=WorkStepState.SUCCEEDED if complete else WorkStepState.CANCELLED,
        attempts=1 if complete else 0, depends_on=(),
        failure=None if complete else "cancelled",
    )
    return WorkPlanCheckpoint(
        steps=(step,), complete=complete, succeeded_steps=int(complete),
        failed_steps=0, blocked_steps=0, cancelled_steps=int(not complete),
        next_step_id=None if complete else "build",
    )


class ChangingInspector(RecoveryCandidateInspector):
    """Inject one deterministic trusted-writer interleaving; no sleeps/threads."""

    def __init__(self, store: DurableWorkCheckpointStore, change):
        super().__init__(store=store, reconciler=RecoveryReconciler(ProjectContextEngine()))
        self.change = change

    def inspect(self, project_id: str, work_id: str):
        self.change(project_id, work_id)
        return super().inspect(project_id, work_id)


class RecoveryDashboardRaceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.store = DurableWorkCheckpointStore(Path(self.tmp.name))
        self.store.save("SEIS", "work-001", checkpoint())

    def builder(self, change):
        return RecoveryDashboardBuilder(store=self.store, inspector=ChangingInspector(self.store, change))

    def complete_record(self, project_id, work_id):
        self.store.save(project_id, work_id, checkpoint(complete=True))

    def test_completed_between_discovery_and_inspection_is_excluded_by_default(self):
        snapshot = self.builder(self.complete_record).snapshot("SEIS")
        self.assertEqual(snapshot.rows, ())
        self.assertEqual(snapshot.total_candidates, 0)
        self.assertEqual(snapshot.complete, 0)
        self.assertEqual(snapshot.replan_required, 0)
        self.assertFalse(snapshot.execution_authorized)

    def test_concurrently_completed_record_can_be_explicitly_included(self):
        snapshot = self.builder(self.complete_record).snapshot("SEIS", include_complete=True)
        self.assertEqual(snapshot.total_candidates, 1)
        self.assertEqual(snapshot.complete, 1)
        self.assertEqual(snapshot.replan_required, 0)
        self.assertIsNone(snapshot.rows[0].next_step_id)
        self.assertFalse(snapshot.rows[0].execution_authorized)

    def test_record_deleted_between_discovery_and_inspection_is_omitted(self):
        def remove(project, work):
            self.store.path_for(project, work).unlink()
        snapshot = self.builder(remove).snapshot("SEIS")
        self.assertEqual(snapshot.rows, ())
        self.assertEqual(snapshot.total_candidates, 0)

    def test_corruption_between_discovery_and_inspection_never_returns_partial_rows(self):
        self.store.save("SEIS", "work-002", checkpoint())
        def corrupt_second(project, work):
            if work == "work-002":
                self.store.path_for(project, work).write_text("{invalid", encoding="utf-8")
        with self.assertRaises(CheckpointCorruptError):
            self.builder(corrupt_second).snapshot("SEIS")

    def test_mixed_records_count_only_the_rows_that_survive_final_filter(self):
        self.store.save("SEIS", "work-002", checkpoint())
        def complete_first(project, work):
            if work == "work-001":
                self.complete_record(project, work)
        snapshot = self.builder(complete_first).snapshot("SEIS")
        self.assertEqual(tuple(row.work_id for row in snapshot.rows), ("work-002",))
        self.assertEqual(snapshot.total_candidates, 1)
        self.assertEqual(snapshot.anchor_missing, 1)
        self.assertEqual(snapshot.replan_required, 1)
        self.assertEqual(snapshot.complete, 0)


if __name__ == "__main__":
    unittest.main()
