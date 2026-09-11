from __future__ import annotations

from dataclasses import replace
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.recovery_candidate import RecoveryCandidateDisposition, RecoveryCandidateView
from maria_runtime.recovery_dashboard import RecoveryDashboardSnapshot
from maria_runtime.recovery_dashboard_wire import RecoveryDashboardWireCodec, RecoveryDashboardWireError
from maria_runtime.recovery_native_bridge import RecoveryNativeBridgeAdapter, RecoveryNativeBridgeError


def dashboard() -> RecoveryDashboardSnapshot:
    row = RecoveryCandidateView(
        project_id="SEIS", work_id="work-001",
        disposition=RecoveryCandidateDisposition.DRIFT_DETECTED,
        schema_version=2, next_step_id="build", drift_fields=("current_branch",),
    )
    return RecoveryDashboardSnapshot(
        project_id="SEIS", rows=(row,), total_candidates=1, replan_required=1,
        drift_detected=1, evidence_required=0, anchor_missing=0,
        aligned_replan_required=0, complete=0,
    )


class MustNotIterate:
    def __iter__(self):
        raise AssertionError("invalid collection was iterated before validation")


class RecoveryInputBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.codec = RecoveryDashboardWireCodec()
        self.source = dashboard()

    def payload(self):
        return json.loads(self.codec.encode(self.source))

    def test_non_string_wire_dispositions_raise_only_the_contract_error(self):
        for value in ([], {}, ["drift-detected"], None, True, 0):
            with self.subTest(value=value):
                payload = self.payload()
                payload["rows"][0]["disposition"] = value
                with self.assertRaises(RecoveryDashboardWireError):
                    self.codec.decode(json.dumps(payload).encode())

    def test_non_string_typed_dispositions_raise_only_the_bridge_error(self):
        original = self.codec.decode(self.codec.encode(self.source))
        for value in ([], {}, ["drift-detected"], None, True, 0):
            with self.subTest(value=value):
                row = replace(original.rows[0], disposition=value)
                with self.assertRaises(RecoveryNativeBridgeError):
                    RecoveryNativeBridgeAdapter().adapt(replace(original, rows=(row,)))

    def test_deeply_nested_wire_input_is_a_redacted_contract_error(self):
        raw = b"[" * 2000 + b"0" + b"]" * 2000
        self.assertLess(len(raw), self.codec.MAX_BYTES)
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.decode(raw)

    def test_encode_checks_row_collection_before_iterating_it(self):
        invalid = replace(self.source, rows=MustNotIterate())
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.encode(invalid)

    def test_encode_checks_row_count_before_visiting_any_row(self):
        invalid = replace(self.source, rows=(object(),) * (self.codec.MAX_ROWS + 1))
        with self.assertRaisesRegex(RecoveryDashboardWireError, "rows are outside trusted bounds"):
            self.codec.encode(invalid)

    def test_encode_checks_disposition_before_reading_enum_value(self):
        for value in ("drift-detected", [], {}, None):
            with self.subTest(value=value):
                row = replace(self.source.rows[0], disposition=value)
                with self.assertRaises(RecoveryDashboardWireError):
                    self.codec.encode(replace(self.source, rows=(row,)))

    def test_encode_checks_detail_collections_before_materializing_them(self):
        for field in ("drift_fields", "missing_context"):
            with self.subTest(field=field):
                row = replace(self.source.rows[0], **{field: MustNotIterate()})
                with self.assertRaises(RecoveryDashboardWireError):
                    self.codec.encode(replace(self.source, rows=(row,)))

    def test_wire_rejects_unpaired_surrogates_in_all_string_fields(self):
        for field in ("project_id", "work_id", "next_step_id", "drift_fields", "missing_context"):
            for value in ("\ud800", "\udfff"):
                with self.subTest(field=field, codepoint=ord(value)):
                    payload = self.payload()
                    if field == "project_id":
                        payload[field] = value
                        payload["rows"][0][field] = value
                    elif field in ("drift_fields", "missing_context"):
                        payload["rows"][0][field] = [value]
                    else:
                        payload["rows"][0][field] = value
                    with self.assertRaises(RecoveryDashboardWireError):
                        self.codec.decode(json.dumps(payload).encode())

    def test_host_created_snapshot_cannot_export_unpaired_surrogates(self):
        row = replace(self.source.rows[0], work_id="\ud800")
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.encode(replace(self.source, rows=(row,)))

    def test_direct_typed_bridge_cannot_bypass_unicode_scalar_validation(self):
        original = self.codec.decode(self.codec.encode(self.source))
        row = replace(original.rows[0], work_id="\ud800")
        with self.assertRaises(RecoveryNativeBridgeError):
            RecoveryNativeBridgeAdapter().adapt(replace(original, rows=(row,)))

    def test_durable_schema_version_must_fit_native_signed_integer(self):
        native_max = (1 << 63) - 1

        payload = self.payload()
        payload["rows"][0]["schema_version"] = native_max
        decoded = self.codec.decode(json.dumps(payload).encode())
        self.assertEqual(decoded.rows[0].schema_version, native_max)
        self.assertEqual(
            RecoveryNativeBridgeAdapter().adapt(decoded).rows[0].durable_schema_version,
            native_max,
        )
        encoded_source = replace(
            self.source,
            rows=(replace(self.source.rows[0], schema_version=native_max),),
        )
        self.assertEqual(
            self.codec.decode(self.codec.encode(encoded_source)).rows[0].schema_version,
            native_max,
        )

        for value in (native_max + 1, 1 << 100):
            with self.subTest(path="decode", value=value):
                payload = self.payload()
                payload["rows"][0]["schema_version"] = value
                with self.assertRaises(RecoveryDashboardWireError):
                    self.codec.decode(json.dumps(payload).encode())

            with self.subTest(path="encode", value=value):
                row = replace(self.source.rows[0], schema_version=value)
                with self.assertRaises(RecoveryDashboardWireError):
                    self.codec.encode(replace(self.source, rows=(row,)))

            with self.subTest(path="typed-native", value=value):
                original = self.codec.decode(self.codec.encode(self.source))
                row = replace(original.rows[0], schema_version=value)
                with self.assertRaises(RecoveryNativeBridgeError):
                    RecoveryNativeBridgeAdapter().adapt(replace(original, rows=(row,)))

    def test_valid_supplementary_and_combining_unicode_still_round_trips(self):
        for value in ("iş-\U0001f680", "e\u0301", "\u00e9"):
            with self.subTest(value=value):
                row = replace(self.source.rows[0], work_id=value)
                source = replace(self.source, rows=(row,))
                wire = self.codec.decode(self.codec.encode(source))
                native = RecoveryNativeBridgeAdapter().adapt(wire)
                self.assertEqual(wire.rows[0].work_id, value)
                self.assertEqual(native.rows[0].work_id, value)
                self.assertFalse(native.execution_authorized)

    def test_oversized_valid_output_is_rejected_not_truncated(self):
        row = self.source.rows[0]
        rows = tuple(replace(row, work_id=f"work-{n:03d}-" + "x" * 450) for n in range(120))
        source = replace(self.source, rows=rows, total_candidates=120, replan_required=120, drift_detected=120)
        with self.assertRaises(RecoveryDashboardWireError):
            self.codec.encode(source)

    def test_invalid_json_errors_do_not_echo_raw_input(self):
        marker = "synthetic-private-marker"
        for raw in (b"{", b"\xff", ('{"' + marker + '":NaN}').encode()):
            with self.subTest(raw=raw):
                with self.assertRaises(RecoveryDashboardWireError) as error:
                    self.codec.decode(raw)
                self.assertNotIn(marker, str(error.exception))


if __name__ == "__main__":
    unittest.main()
