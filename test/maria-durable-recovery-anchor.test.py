from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import RouteKind
from maria_runtime.recovery_reconciliation import RecoveryAnchor
from maria_runtime.work_execution import (
    WorkPlanCheckpoint,
    WorkStepExecutionEvidence,
    WorkStepState,
)
from maria_runtime.work_recovery import (
    CheckpointCorruptError,
    DurableRecoveryRecord,
    DurableWorkCheckpointStore,
)


def checkpoint() -> WorkPlanCheckpoint:
    steps = (
        WorkStepExecutionEvidence(
            step_id="plan",
            route_kind=RouteKind.MODEL,
            target_name="fixture-model",
            state=WorkStepState.SUCCEEDED,
            attempts=1,
            depends_on=(),
        ),
        WorkStepExecutionEvidence(
            step_id="build",
            route_kind=RouteKind.MODEL,
            target_name="fixture-model",
            state=WorkStepState.CANCELLED,
            attempts=0,
            depends_on=("plan",),
            failure="cancel-requested",
        ),
    )
    return WorkPlanCheckpoint(
        steps=steps,
        complete=False,
        succeeded_steps=1,
        failed_steps=0,
        blocked_steps=0,
        cancelled_steps=1,
        next_step_id="build",
    )


def anchor() -> RecoveryAnchor:
    return RecoveryAnchor(
        project="SEIS",
        active_goal="SEIS-GOAL-021",
        current_repo="emirhankudun-ux/SEIS",
        current_branch="feature/maria-durable-recovery-anchor-v1",
        repository_revision="0123456789abcdef",
    )


class DurableRecoveryAnchorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.store = DurableWorkCheckpointStore(self.root)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_v2_round_trip_binds_checkpoint_and_recovery_anchor(self):
        cp = checkpoint()
        expected_anchor = anchor()
        path = self.store.save(
            "SEIS",
            "work-001",
            cp,
            recovery_anchor=expected_anchor,
        )

        record = self.store.load_record("SEIS", "work-001")
        self.assertIsInstance(record, DurableRecoveryRecord)
        self.assertEqual(record.checkpoint, cp)
        self.assertEqual(record.recovery_anchor, expected_anchor)
        self.assertEqual(self.store.load("SEIS", "work-001"), cp)

        payload = json.loads(path.read_text("utf-8"))
        self.assertEqual(payload["schema_version"], 2)
        self.assertEqual(
            payload["recovery_anchor"],
            {
                "project": "SEIS",
                "active_goal": "SEIS-GOAL-021",
                "current_repo": "emirhankudun-ux/SEIS",
                "current_branch": "feature/maria-durable-recovery-anchor-v1",
                "repository_revision": "0123456789abcdef",
            },
        )

    def test_v2_without_anchor_preserves_legacy_save_call_shape(self):
        cp = checkpoint()
        path = self.store.save("SEIS", "work-001", cp)
        payload = json.loads(path.read_text("utf-8"))
        self.assertEqual(payload["schema_version"], 2)
        self.assertIsNone(payload["recovery_anchor"])

        record = self.store.load_record("SEIS", "work-001")
        self.assertEqual(record.checkpoint, cp)
        self.assertIsNone(record.recovery_anchor)

    def test_legacy_v1_checkpoint_remains_readable_without_fabricating_anchor(self):
        cp = checkpoint()
        path = self.store.save("SEIS", "work-001", cp)
        payload = json.loads(path.read_text("utf-8"))
        payload["schema_version"] = 1
        payload.pop("recovery_anchor")
        path.write_text(json.dumps(payload, separators=(",", ":"), sort_keys=True), "utf-8")

        record = self.store.load_record("SEIS", "work-001")
        self.assertEqual(record.checkpoint, cp)
        self.assertIsNone(record.recovery_anchor)
        self.assertEqual(self.store.load("SEIS", "work-001"), cp)

    def test_malformed_v2_anchor_fails_closed(self):
        path = self.store.save("SEIS", "work-001", checkpoint(), recovery_anchor=anchor())
        payload = json.loads(path.read_text("utf-8"))
        payload["recovery_anchor"]["current_branch"] = ""
        path.write_text(json.dumps(payload), "utf-8")

        with self.assertRaises(CheckpointCorruptError):
            self.store.load_record("SEIS", "work-001")

    def test_v2_anchor_rejects_unknown_fields(self):
        path = self.store.save("SEIS", "work-001", checkpoint(), recovery_anchor=anchor())
        payload = json.loads(path.read_text("utf-8"))
        payload["recovery_anchor"]["execution_authorized"] = True
        path.write_text(json.dumps(payload), "utf-8")

        with self.assertRaises(CheckpointCorruptError):
            self.store.load_record("SEIS", "work-001")

    def test_record_is_advisory_data_not_execution_authority(self):
        record = DurableRecoveryRecord(checkpoint=checkpoint(), recovery_anchor=anchor())
        self.assertFalse(hasattr(record, "execution_authorized"))
        self.assertFalse(hasattr(record, "resume"))
        self.assertFalse(hasattr(record, "execute"))


if __name__ == "__main__":
    unittest.main()
