from __future__ import annotations

from dataclasses import replace
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.recovery_candidate import RecoveryCandidateDisposition, RecoveryCandidateView
from maria_runtime.recovery_dashboard import RecoveryDashboardSnapshot
from maria_runtime.recovery_dashboard_wire import RecoveryDashboardWireCodec

try:
    from maria_runtime.recovery_native_bridge import (
        RecoveryNativeBridgeAdapter,
        RecoveryNativeBridgeError,
        RecoveryNativeSeverity,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("recovery native bridge adapter is missing") from exc


def dashboard() -> RecoveryDashboardSnapshot:
    rows = (
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-001",
            disposition=RecoveryCandidateDisposition.ANCHOR_MISSING,
            schema_version=2,
            next_step_id="anchor",
        ),
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-002",
            disposition=RecoveryCandidateDisposition.EVIDENCE_REQUIRED,
            schema_version=2,
            next_step_id="evidence",
            missing_context=("current_branch",),
        ),
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-003",
            disposition=RecoveryCandidateDisposition.DRIFT_DETECTED,
            schema_version=2,
            next_step_id="replan",
            drift_fields=("repository_revision",),
        ),
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-004",
            disposition=RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED,
            schema_version=2,
            next_step_id="verify",
        ),
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-005",
            disposition=RecoveryCandidateDisposition.COMPLETE,
            schema_version=2,
            next_step_id=None,
        ),
    )
    return RecoveryDashboardSnapshot(
        project_id="SEIS",
        rows=rows,
        total_candidates=5,
        replan_required=4,
        drift_detected=1,
        evidence_required=1,
        anchor_missing=1,
        aligned_replan_required=1,
        complete=1,
    )


def wire_snapshot():
    codec = RecoveryDashboardWireCodec()
    return codec.decode(codec.encode(dashboard()))


class RecoveryNativeBridgeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.adapter = RecoveryNativeBridgeAdapter()

    def test_maps_wire_v1_into_stable_ui_status_and_severity(self):
        view = self.adapter.adapt(wire_snapshot())
        self.assertEqual(view.project_id, "SEIS")
        self.assertEqual(view.wire_schema_version, 1)
        self.assertEqual(
            tuple(row.status_label for row in view.rows),
            (
                "Recovery anchor missing",
                "Current evidence required",
                "Context drift detected",
                "Aligned; re-plan required",
                "Complete",
            ),
        )
        self.assertEqual(
            tuple(row.severity for row in view.rows),
            (
                RecoveryNativeSeverity.WARNING,
                RecoveryNativeSeverity.WARNING,
                RecoveryNativeSeverity.CRITICAL,
                RecoveryNativeSeverity.INFO,
                RecoveryNativeSeverity.SUCCESS,
            ),
        )

    def test_exposes_only_read_only_presentation_metadata_and_never_actions(self):
        view = self.adapter.adapt(wire_snapshot())
        self.assertFalse(view.execution_authorized)
        for row in view.rows:
            self.assertFalse(row.execution_authorized)
            self.assertFalse(hasattr(row, "action"))
            self.assertFalse(hasattr(row, "resume"))
            self.assertFalse(hasattr(row, "can_resume"))
            self.assertFalse(hasattr(row, "checkpoint"))
            self.assertFalse(hasattr(row, "recovery_anchor"))
            self.assertFalse(hasattr(row, "credential"))

    def test_maps_only_public_safe_detail_fields_for_drift_or_missing_evidence(self):
        view = self.adapter.adapt(wire_snapshot())
        self.assertEqual(view.rows[0].detail_fields, ())
        self.assertEqual(view.rows[1].detail_fields, ("current_branch",))
        self.assertEqual(view.rows[2].detail_fields, ("repository_revision",))
        self.assertEqual(view.rows[3].detail_fields, ())
        self.assertEqual(view.rows[4].detail_fields, ())
        self.assertEqual(view.rows[2].next_step_id, "replan")
        self.assertTrue(view.rows[2].replan_required)
        self.assertFalse(view.rows[4].replan_required)

    def test_preserves_validated_summary_counts_without_adding_authority(self):
        view = self.adapter.adapt(wire_snapshot())
        self.assertEqual(view.total_candidates, 5)
        self.assertEqual(view.replan_required, 4)
        self.assertEqual(view.drift_detected, 1)
        self.assertEqual(view.evidence_required, 1)
        self.assertEqual(view.anchor_missing, 1)
        self.assertEqual(view.aligned_replan_required, 1)
        self.assertEqual(view.complete, 1)
        self.assertFalse(view.execution_authorized)

    def test_rejects_unknown_wire_schema_or_unknown_disposition_fail_closed(self):
        source = wire_snapshot()
        with self.assertRaises(RecoveryNativeBridgeError):
            self.adapter.adapt(replace(source, schema_version=999))

        forged_row = replace(source.rows[0], disposition="future-unknown")
        forged = replace(source, rows=(forged_row, *source.rows[1:]))
        with self.assertRaises(RecoveryNativeBridgeError):
            self.adapter.adapt(forged)

    def test_rejects_forged_row_project_order_or_summary_inconsistency(self):
        source = wire_snapshot()
        wrong_project_row = replace(source.rows[0], project_id="OTHER")
        with self.assertRaises(RecoveryNativeBridgeError):
            self.adapter.adapt(replace(source, rows=(wrong_project_row, *source.rows[1:])))

        with self.assertRaises(RecoveryNativeBridgeError):
            self.adapter.adapt(replace(source, rows=tuple(reversed(source.rows))))

        with self.assertRaises(RecoveryNativeBridgeError):
            self.adapter.adapt(replace(source, total_candidates=999))


if __name__ == "__main__":
    unittest.main()
