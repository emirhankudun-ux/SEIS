from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any

from .recovery_candidate import RecoveryCandidateDisposition, RecoveryCandidateView
from .recovery_dashboard import RecoveryDashboardSnapshot


class RecoveryDashboardWireError(ValueError):
    """Raised when recovery-dashboard wire data cannot be trusted."""


@dataclass(frozen=True)
class RecoveryDashboardWireRow:
    project_id: str
    work_id: str
    disposition: str
    schema_version: int | None
    next_step_id: str | None
    drift_fields: tuple[str, ...]
    missing_context: tuple[str, ...]

    @property
    def execution_authorized(self) -> bool:
        return False


@dataclass(frozen=True)
class RecoveryDashboardWireSnapshot:
    schema_version: int
    project_id: str
    rows: tuple[RecoveryDashboardWireRow, ...]
    total_candidates: int
    replan_required: int
    drift_detected: int
    evidence_required: int
    anchor_missing: int
    aligned_replan_required: int
    complete: int

    @property
    def execution_authorized(self) -> bool:
        return False


class RecoveryDashboardWireCodec:
    """Strict, bounded JSON contract for read-only recovery dashboard metadata."""

    SCHEMA_VERSION = 1
    MAX_BYTES = 64 * 1024
    MAX_ROWS = 256
    MAX_ID_LENGTH = 512
    MAX_FIELD_NAMES = 16
    # Supported native Apple clients decode JSON integers into signed 64-bit Int.
    # Keep the Python wire contract inside that shared representable range.
    MAX_NATIVE_INTEGER = (1 << 63) - 1

    _ROOT_FIELDS = {
        "schema_version",
        "project_id",
        "rows",
        "total_candidates",
        "replan_required",
        "drift_detected",
        "evidence_required",
        "anchor_missing",
        "aligned_replan_required",
        "complete",
        "execution_authorized",
    }
    _ROW_FIELDS = {
        "project_id",
        "work_id",
        "disposition",
        "schema_version",
        "next_step_id",
        "drift_fields",
        "missing_context",
        "execution_authorized",
    }
    _DASHBOARD_DISPOSITIONS = {
        item.value
        for item in RecoveryCandidateDisposition
        if item is not RecoveryCandidateDisposition.NOT_FOUND
    }

    def encode(self, snapshot: RecoveryDashboardSnapshot) -> bytes:
        if not isinstance(snapshot, RecoveryDashboardSnapshot):
            raise TypeError("snapshot must be RecoveryDashboardSnapshot")
        # Dataclass annotations do not validate runtime values. Check the
        # bounded collection before iterating or allocating its payload.
        if not isinstance(snapshot.rows, tuple) or len(snapshot.rows) > self.MAX_ROWS:
            raise RecoveryDashboardWireError("dashboard rows are outside trusted bounds")
        payload = {
            "schema_version": self.SCHEMA_VERSION,
            "project_id": snapshot.project_id,
            "rows": [self._row_to_payload(row) for row in snapshot.rows],
            "total_candidates": snapshot.total_candidates,
            "replan_required": snapshot.replan_required,
            "drift_detected": snapshot.drift_detected,
            "evidence_required": snapshot.evidence_required,
            "anchor_missing": snapshot.anchor_missing,
            "aligned_replan_required": snapshot.aligned_replan_required,
            "complete": snapshot.complete,
            "execution_authorized": False,
        }
        self._payload_to_snapshot(payload)
        encoded = json.dumps(
            payload,
            ensure_ascii=True,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        ).encode("utf-8")
        if len(encoded) > self.MAX_BYTES:
            raise RecoveryDashboardWireError("dashboard wire payload exceeds maximum size")
        return encoded

    def decode(self, raw: bytes) -> RecoveryDashboardWireSnapshot:
        if not isinstance(raw, bytes):
            raise TypeError("raw must be bytes")
        if not raw or len(raw) > self.MAX_BYTES:
            raise RecoveryDashboardWireError("dashboard wire payload size is outside trusted bounds")

        def reject_non_finite(_: str) -> None:
            raise ValueError("non-finite JSON constant")

        def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
            result: dict[str, Any] = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("duplicate JSON object key")
                result[key] = value
            return result

        try:
            payload = json.loads(
                raw.decode("utf-8"),
                parse_constant=reject_non_finite,
                object_pairs_hook=reject_duplicate_keys,
            )
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError, RecursionError) as exc:
            raise RecoveryDashboardWireError("dashboard wire payload is not strict UTF-8 JSON") from exc
        return self._payload_to_snapshot(payload)

    @classmethod
    def _row_to_payload(cls, row: RecoveryCandidateView) -> dict[str, Any]:
        if not isinstance(row, RecoveryCandidateView):
            raise RecoveryDashboardWireError("dashboard contains an invalid row")
        if not isinstance(row.disposition, RecoveryCandidateDisposition):
            raise RecoveryDashboardWireError("unknown dashboard row disposition")
        for field_name in ("drift_fields", "missing_context"):
            values = getattr(row, field_name)
            if not isinstance(values, tuple) or len(values) > cls.MAX_FIELD_NAMES:
                raise RecoveryDashboardWireError(f"invalid {field_name}")
        return {
            "project_id": row.project_id,
            "work_id": row.work_id,
            "disposition": row.disposition.value,
            "schema_version": row.schema_version,
            "next_step_id": row.next_step_id,
            "drift_fields": list(row.drift_fields),
            "missing_context": list(row.missing_context),
            "execution_authorized": False,
        }

    @classmethod
    def _payload_to_snapshot(cls, payload: Any) -> RecoveryDashboardWireSnapshot:
        if not isinstance(payload, dict) or set(payload) != cls._ROOT_FIELDS:
            raise RecoveryDashboardWireError("dashboard wire envelope schema mismatch")
        schema_version = payload.get("schema_version")
        if (
            isinstance(schema_version, bool)
            or not isinstance(schema_version, int)
            or schema_version != cls.SCHEMA_VERSION
        ):
            raise RecoveryDashboardWireError("unsupported dashboard wire schema version")
        if payload.get("execution_authorized") is not False:
            raise RecoveryDashboardWireError("dashboard wire cannot authorize execution")

        project_id = cls._bounded_string(payload.get("project_id"), "project_id")
        raw_rows = payload.get("rows")
        if not isinstance(raw_rows, list) or len(raw_rows) > cls.MAX_ROWS:
            raise RecoveryDashboardWireError("dashboard rows are outside trusted bounds")
        rows = tuple(cls._payload_to_row(value, project_id=project_id) for value in raw_rows)
        work_ids = tuple(row.work_id for row in rows)
        if len(set(work_ids)) != len(work_ids) or work_ids != tuple(sorted(work_ids)):
            raise RecoveryDashboardWireError("dashboard rows must have unique sorted work ids")

        counters = {
            name: cls._counter(payload.get(name), name)
            for name in (
                "total_candidates",
                "replan_required",
                "drift_detected",
                "evidence_required",
                "anchor_missing",
                "aligned_replan_required",
                "complete",
            )
        }
        actual = {
            "total_candidates": len(rows),
            "replan_required": sum(
                row.disposition
                in {
                    RecoveryCandidateDisposition.ANCHOR_MISSING.value,
                    RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value,
                    RecoveryCandidateDisposition.DRIFT_DETECTED.value,
                    RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED.value,
                }
                for row in rows
            ),
            "drift_detected": sum(
                row.disposition == RecoveryCandidateDisposition.DRIFT_DETECTED.value
                for row in rows
            ),
            "evidence_required": sum(
                row.disposition == RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value
                for row in rows
            ),
            "anchor_missing": sum(
                row.disposition == RecoveryCandidateDisposition.ANCHOR_MISSING.value
                for row in rows
            ),
            "aligned_replan_required": sum(
                row.disposition == RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED.value
                for row in rows
            ),
            "complete": sum(
                row.disposition == RecoveryCandidateDisposition.COMPLETE.value
                for row in rows
            ),
        }
        if counters != actual:
            raise RecoveryDashboardWireError("dashboard aggregate counters do not match rows")

        return RecoveryDashboardWireSnapshot(
            schema_version=cls.SCHEMA_VERSION,
            project_id=project_id,
            rows=rows,
            total_candidates=counters["total_candidates"],
            replan_required=counters["replan_required"],
            drift_detected=counters["drift_detected"],
            evidence_required=counters["evidence_required"],
            anchor_missing=counters["anchor_missing"],
            aligned_replan_required=counters["aligned_replan_required"],
            complete=counters["complete"],
        )

    @classmethod
    def _payload_to_row(cls, value: Any, *, project_id: str) -> RecoveryDashboardWireRow:
        if not isinstance(value, dict) or set(value) != cls._ROW_FIELDS:
            raise RecoveryDashboardWireError("dashboard row schema mismatch")
        if value.get("execution_authorized") is not False:
            raise RecoveryDashboardWireError("dashboard row cannot authorize execution")
        row_project = cls._bounded_string(value.get("project_id"), "row project_id")
        if row_project != project_id:
            raise RecoveryDashboardWireError("dashboard row project does not match envelope")
        work_id = cls._bounded_string(value.get("work_id"), "work_id")
        disposition = value.get("disposition")
        if not isinstance(disposition, str) or disposition not in cls._DASHBOARD_DISPOSITIONS:
            raise RecoveryDashboardWireError("unknown dashboard row disposition")

        schema_version = value.get("schema_version")
        if schema_version is not None and (
            isinstance(schema_version, bool)
            or not isinstance(schema_version, int)
            or schema_version <= 0
            or schema_version > cls.MAX_NATIVE_INTEGER
        ):
            raise RecoveryDashboardWireError("invalid durable schema version")
        next_step_id = value.get("next_step_id")
        if next_step_id is not None:
            next_step_id = cls._bounded_string(next_step_id, "next_step_id")

        drift_fields = cls._string_tuple(value.get("drift_fields"), "drift_fields")
        missing_context = cls._string_tuple(value.get("missing_context"), "missing_context")
        return RecoveryDashboardWireRow(
            project_id=row_project,
            work_id=work_id,
            disposition=disposition,
            schema_version=schema_version,
            next_step_id=next_step_id,
            drift_fields=drift_fields,
            missing_context=missing_context,
        )

    @classmethod
    def _bounded_string(cls, value: Any, field_name: str) -> str:
        if not isinstance(value, str) or not value.strip() or len(value) > cls.MAX_ID_LENGTH:
            raise RecoveryDashboardWireError(f"invalid {field_name}")
        # Python can retain lone JSON surrogate escapes; native Swift strings
        # cannot. Reject rather than silently replace or normalize identity.
        if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
            raise RecoveryDashboardWireError(f"invalid {field_name}")
        return value

    @classmethod
    def _string_tuple(cls, value: Any, field_name: str) -> tuple[str, ...]:
        if not isinstance(value, list) or len(value) > cls.MAX_FIELD_NAMES:
            raise RecoveryDashboardWireError(f"invalid {field_name}")
        result: list[str] = []
        seen: set[str] = set()
        for item in value:
            normalized = cls._bounded_string(item, field_name)
            if normalized in seen:
                raise RecoveryDashboardWireError(f"duplicate {field_name} entry")
            seen.add(normalized)
            result.append(normalized)
        return tuple(result)

    @staticmethod
    def _counter(value: Any, field_name: str) -> int:
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise RecoveryDashboardWireError(f"invalid {field_name}")
        return value