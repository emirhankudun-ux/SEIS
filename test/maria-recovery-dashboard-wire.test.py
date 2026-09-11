from __future__ import annotations

import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.recovery_candidate import (
    RecoveryCandidateDisposition,
    RecoveryCandidateView,
)
from maria_runtime.recovery_dashboard import RecoveryDashboardSnapshot

try:
    from maria_runtime.recovery_dashboard_wire import (
        RecoveryDashboardWireCodec,
        RecoveryDashboardWireError,
        RecoveryDashboardWireSnapshot,
    )
except ImportError as exc:  # intentional RED until implementation exists
    raise AssertionError("recovery dashboard wire contract is missing") from exc


def dashboard() -> RecoveryDashboardSnapshot:
    rows = (
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-001",
            disposition=RecoveryCandidateDisposition.DRIFT_DETECTED,
            schema_version=2,
            next_step_id="build",
            drift_fields=("current_branch",),
        ),
        RecoveryCandidateView(
            project_id="SEIS",
            work_id="work-002",
            disposition=RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED,
            schema_version=2,
            next_step_id="verify",
        ),
    )
    return RecoveryDashboardSnapshot(
        project_id="SEIS",
        rows=rows,
        total_candidates=2,
        replan_required=2,
        drift_detected=1,
        evidence_required=0,
        anchor_missing=0,
        aligned_replan_required=1,
        complete=0,
    )


class RecoveryDashboardWireTests(unittest.TestCase):
    def setUp(self) -> None:
        self.codec = RecoveryDashboardWireCodec()

    def test_encode_is_deterministic_compact_versioned_utf8_json(self):
        first = self.codec.encode(dashboard())
        second = self.codec.encode(dashboard())
        self.assertEqual(first, second)
        self.assertLessEqual(len(first), self.codec.MAX_BYTES)
        payload = json.loads(first.decode("utf-8"))
        self.assertEqual(payload["schema_version"], 1)
        self.assertEqual(payload["project_id"], "SEIS")
        self.assertEqual(payload["total_candidates"], 2)
        self.assertEqual([row["work_id"] for row in payload["rows"]], ["work-001", "work-002"])

    def test_wire_payload_contains_only_public_safe_dashboard_fields(self):
        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        serialized = json.dumps(payload, sort_keys=True)
        for forbidden in (
            "checkpoint",
            "recovery_anchor",
            "prompt",
            "credential",
            "permission",
            "tool_output",
            "model_output",
            "execution_token",
        ):
            self.assertNotIn(forbidden, serialized)
        self.assertFalse(payload["execution_authorized"])
        for row in payload["rows"]:
            self.assertFalse(row["execution_authorized"])

    def test_round_trip_returns_immutable_non_executable_wire_snapshot(self):
        restored = self.codec.decode(self.codec.encode(dashboard()))
        self.assertIsInstance(restored, RecoveryDashboardWireSnapshot)
        self.assertEqual(restored.project_id, "SEIS")
        self.assertEqual(restored.total_candidates, 2)
        self.assertEqual(restored.rows[0].work_id, "work-001")
        self.assertEqual(restored.rows[0].disposition, "drift-detected")
        self.assertEqual(restored.rows[0].drift_fields, ("current_branch",))
        self.assertFalse(restored.execution_authorized)
        self.assertFalse(restored.rows[0].execution_authorized)
        self.assertFalse(hasattr(restored, "checkpoint"))
        self.assertFalse(hasattr(restored, "recovery_anchor"))

    def test_decode_rejects_unknown_schema_version_and_extra_fields(self):
        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["schema_version"] = 999
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["unexpected"] = True
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

    def test_decode_rejects_boolean_schema_version(self):
        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["schema_version"] = True
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

    def test_decode_rejects_duplicate_keys_non_finite_json_and_oversize_input(self):
        encoded = self.codec.encode(dashboard()).decode("utf-8")
        duplicate = encoded.replace('"project_id":"SEIS"', '"project_id":"OTHER","project_id":"SEIS"', 1)
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(duplicate.encode("utf-8"))

        non_finite = encoded.replace('"total_candidates":2', '"total_candidates":NaN', 1)
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(non_finite.encode("utf-8"))

        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(b"{" + b"x" * self.codec.MAX_BYTES + b"}")

    def test_decode_rejects_counter_or_row_project_inconsistency(self):
        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["drift_detected"] = 0
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["rows"][0]["project_id"] = "OTHER"
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

    def test_decode_rejects_not_found_rows_that_dashboard_builder_never_surfaces(self):
        payload = json.loads(self.codec.encode(dashboard()).decode("utf-8"))
        payload["rows"][0]["disposition"] = "not-found"
        payload["replan_required"] = 1
        payload["drift_detected"] = 0
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))

    def test_encode_and_decode_reject_unsorted_or_duplicate_work_ids(self):
        source = dashboard()
        unsorted = RecoveryDashboardSnapshot(
            project_id=source.project_id,
            rows=tuple(reversed(source.rows)),
            total_candidates=source.total_candidates,
            replan_required=source.replan_required,
            drift_detected=source.drift_detected,
            evidence_required=source.evidence_required,
            anchor_missing=source.anchor_missing,
            aligned_replan_required=source.aligned_replan_required,
            complete=source.complete,
        )
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.encode(unsorted)

        payload = json.loads(self.codec.encode(source).decode("utf-8"))
        payload["rows"][1]["work_id"] = payload["rows"][0]["work_id"]
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(json.dumps(payload).encode("utf-8"))


if __name__ == "__main__":
    unittest.main()
