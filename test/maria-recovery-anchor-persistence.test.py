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

try:
    from maria_runtime.work_recovery import (
        CheckpointCorruptError,
        DurableRecoveryRecord,
        DurableWorkCheckpointStore,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("durable recovery record migration API is missing") from exc


PROJECT = "SEIS"
WORK_ID = "work-001"
GOAL = "SEIS-GOAL-021"
REPO = "emirhankudun-ux/SEIS"
BRANCH = "feature/maria-recovery-anchor-persistence-v1"
REVISION = "197236246a5d1ed876215659f388153630cf6404"


def checkpoint() -> WorkPlanCheckpoint:
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


def anchor(*, project: str = PROJECT) -> RecoveryAnchor:
    return RecoveryAnchor(
        project=project,
        active_goal=GOAL,
        current_repo=REPO,
        current_branch=BRANCH,
        repository_revision=REVISION,
    )


class DurableRecoveryAnchorPersistenceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.store = DurableWorkCheckpointStore(self.root)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_v2_round_trip_binds_checkpoint_and_anchor_without_execution_authority(self):
        original_checkpoint = checkpoint()
        original_anchor = anchor()

        self.store.save(
            PROJECT,
            WORK_ID,
            original_checkpoint,
            recovery_anchor=original_anchor,
        )
        record = self.store.load_record(PROJECT, WORK_ID)

        self.assertIsInstance(record, DurableRecoveryRecord)
        self.assertEqual(record.checkpoint, original_checkpoint)
        self.assertEqual(record.recovery_anchor, original_anchor)
        self.assertEqual(record.schema_version, 2)
        self.assertFalse(record.execution_authorized)

    def test_existing_load_api_still_returns_checkpoint_only(self):
        original = checkpoint()
        self.store.save(PROJECT, WORK_ID, original, recovery_anchor=anchor())
        self.assertEqual(self.store.load(PROJECT, WORK_ID), original)

    def test_v2_anchor_has_exact_public_safe_fields(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        payload = json.loads(self.store.path_for(PROJECT, WORK_ID).read_text("utf-8"))

        self.assertEqual(payload["schema_version"], 2)
        self.assertEqual(
            set(payload["recovery_anchor"]),
            {
                "project",
                "active_goal",
                "current_repo",
                "current_branch",
                "repository_revision",
            },
        )
        serialized = json.dumps(payload["recovery_anchor"], sort_keys=True).lower()
        for forbidden in (
            "prompt",
            "credential",
            "permission",
            "raw_output",
            "tool_arguments",
            "model_response",
        ):
            self.assertNotIn(forbidden, serialized)

    def test_save_rejects_anchor_bound_to_different_project(self):
        with self.assertRaises(ValueError):
            self.store.save(
                PROJECT,
                WORK_ID,
                checkpoint(),
                recovery_anchor=anchor(project="Deadly Evil"),
            )

    def test_legacy_v1_envelope_remains_readable_without_inventing_anchor(self):
        original = checkpoint()
        self.store.save(PROJECT, WORK_ID, original, recovery_anchor=anchor())
        path = self.store.path_for(PROJECT, WORK_ID)
        payload = json.loads(path.read_text("utf-8"))
        payload["schema_version"] = 1
        payload.pop("recovery_anchor")
        path.write_text(json.dumps(payload), "utf-8")

        record = self.store.load_record(PROJECT, WORK_ID)
        self.assertEqual(record.checkpoint, original)
        self.assertIsNone(record.recovery_anchor)
        self.assertEqual(record.schema_version, 1)
        self.assertFalse(record.execution_authorized)
        self.assertEqual(self.store.load(PROJECT, WORK_ID), original)

    def test_v2_malformed_anchor_fails_closed(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        path = self.store.path_for(PROJECT, WORK_ID)
        payload = json.loads(path.read_text("utf-8"))
        payload["recovery_anchor"]["unexpected"] = "field"
        path.write_text(json.dumps(payload), "utf-8")

        with self.assertRaises(CheckpointCorruptError):
            self.store.load_record(PROJECT, WORK_ID)

    def test_v2_blank_anchor_identity_fails_closed(self):
        self.store.save(PROJECT, WORK_ID, checkpoint(), recovery_anchor=anchor())
        path = self.store.path_for(PROJECT, WORK_ID)
        payload = json.loads(path.read_text("utf-8"))
        payload["recovery_anchor"]["current_branch"] = "   "
        path.write_text(json.dumps(payload), "utf-8")

        with self.assertRaises(CheckpointCorruptError):
            self.store.load_record(PROJECT, WORK_ID)

    def test_v2_without_anchor_is_valid_but_does_not_invent_one(self):
        original = checkpoint()
        self.store.save(PROJECT, WORK_ID, original)
        record = self.store.load_record(PROJECT, WORK_ID)
        self.assertEqual(record.checkpoint, original)
        self.assertIsNone(record.recovery_anchor)
        self.assertEqual(record.schema_version, 2)


if __name__ == "__main__":
    unittest.main()
