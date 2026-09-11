from __future__ import annotations

import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.recovery_candidate import RecoveryCandidateDisposition, RecoveryCandidateView
from maria_runtime.recovery_dashboard import RecoveryDashboardSnapshot
from maria_runtime.recovery_dashboard_wire import RecoveryDashboardWireCodec
from maria_runtime.recovery_native_bridge import RecoveryNativeBridgeAdapter


class SwiftRecoveryParityTests(unittest.TestCase):
    def test_shared_fixture_matches_real_python_encoder_decoder_and_adapter(self):
        fixture = json.loads((ROOT / "test/fixtures/maria-recovery-swift-v1.json").read_text("utf-8"))
        self.assertEqual(fixture["fixture_version"], 1)
        raw = fixture["wire"].encode("utf-8")
        decoded = RecoveryDashboardWireCodec().decode(raw)
        native = RecoveryNativeBridgeAdapter().adapt(decoded)
        actual = [
            dict(work_id=row.work_id, status_label=row.status_label,
                 severity=row.severity.value, detail_fields=list(row.detail_fields),
                 replan_required=row.replan_required)
            for row in native.rows
        ]
        self.assertEqual(actual, fixture["expected"])
        self.assertEqual(
            {row.disposition for row in native.rows},
            {item.value for item in RecoveryCandidateDisposition if item is not RecoveryCandidateDisposition.NOT_FOUND},
        )
        rows = tuple(
            RecoveryCandidateView(
                project_id=row.project_id, work_id=row.work_id,
                disposition=RecoveryCandidateDisposition(row.disposition),
                schema_version=row.schema_version, next_step_id=row.next_step_id,
                drift_fields=row.drift_fields, missing_context=row.missing_context,
            )
            for row in decoded.rows
        )
        counters = {
            name: getattr(decoded, name)
            for name in ("total_candidates", "replan_required", "drift_detected",
                         "evidence_required", "anchor_missing", "aligned_replan_required", "complete")
        }
        dashboard = RecoveryDashboardSnapshot(project_id=decoded.project_id, rows=rows, **counters)
        self.assertEqual(RecoveryDashboardWireCodec().encode(dashboard), raw)
        self.assertFalse(native.execution_authorized)
        self.assertTrue(all(not row.execution_authorized for row in native.rows))


if __name__ == "__main__":
    unittest.main()
