from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .recovery_candidate import RecoveryCandidateDisposition
from .recovery_dashboard_wire import (
    RecoveryDashboardWireCodec,
    RecoveryDashboardWireRow,
    RecoveryDashboardWireSnapshot,
)


class RecoveryNativeBridgeError(ValueError):
    """Raised when typed recovery wire metadata cannot be trusted for UI use."""


class RecoveryNativeSeverity(str, Enum):
    """Platform-neutral presentation severity for recovery dashboard rows."""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    SUCCESS = "success"


@dataclass(frozen=True)
class RecoveryNativeRow:
    """Read-only UI presentation metadata for one recovery candidate."""

    project_id: str
    work_id: str
    disposition: str
    status_label: str
    severity: RecoveryNativeSeverity
    durable_schema_version: int
    next_step_id: str | None
    detail_fields: tuple[str, ...]
    replan_required: bool

    @property
    def execution_authorized(self) -> bool:
        return False


@dataclass(frozen=True)
class RecoveryNativeSnapshot:
    """Platform-neutral recovery presentation snapshot with no action surface."""

    wire_schema_version: int
    project_id: str
    rows: tuple[RecoveryNativeRow, ...]
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


class RecoveryNativeBridgeAdapter:
    """Map validated wire schema v1 into UI-ready read-only presentation data.

    The adapter deliberately exposes no commands, callbacks, resume flags,
    authorization tokens, checkpoint bodies, anchors, provider data, or tool
    output. Native clients remain presentation consumers only.
    """

    _LABELS = {
        RecoveryCandidateDisposition.ANCHOR_MISSING.value: "Recovery anchor missing",
        RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value: "Current evidence required",
        RecoveryCandidateDisposition.DRIFT_DETECTED.value: "Context drift detected",
        RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED.value: "Aligned; re-plan required",
        RecoveryCandidateDisposition.COMPLETE.value: "Complete",
    }
    _SEVERITIES = {
        RecoveryCandidateDisposition.ANCHOR_MISSING.value: RecoveryNativeSeverity.WARNING,
        RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value: RecoveryNativeSeverity.WARNING,
        RecoveryCandidateDisposition.DRIFT_DETECTED.value: RecoveryNativeSeverity.CRITICAL,
        RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED.value: RecoveryNativeSeverity.INFO,
        RecoveryCandidateDisposition.COMPLETE.value: RecoveryNativeSeverity.SUCCESS,
    }
    _REPLAN_DISPOSITIONS = {
        RecoveryCandidateDisposition.ANCHOR_MISSING.value,
        RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value,
        RecoveryCandidateDisposition.DRIFT_DETECTED.value,
        RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED.value,
    }

    def adapt(self, snapshot: RecoveryDashboardWireSnapshot) -> RecoveryNativeSnapshot:
        if not isinstance(snapshot, RecoveryDashboardWireSnapshot):
            raise TypeError("snapshot must be RecoveryDashboardWireSnapshot")
        if (
            isinstance(snapshot.schema_version, bool)
            or not isinstance(snapshot.schema_version, int)
            or snapshot.schema_version != RecoveryDashboardWireCodec.SCHEMA_VERSION
        ):
            raise RecoveryNativeBridgeError("unsupported recovery dashboard wire schema version")
        project_id = self._bounded_string(snapshot.project_id, "project_id")
        if not isinstance(snapshot.rows, tuple) or len(snapshot.rows) > RecoveryDashboardWireCodec.MAX_ROWS:
            raise RecoveryNativeBridgeError("recovery native rows are outside trusted bounds")

        rows = tuple(self._adapt_row(row, project_id=project_id) for row in snapshot.rows)
        work_ids = tuple(row.work_id for row in rows)
        if len(set(work_ids)) != len(work_ids) or work_ids != tuple(sorted(work_ids)):
            raise RecoveryNativeBridgeError("recovery native rows must have unique sorted work ids")

        actual = {
            "total_candidates": len(rows),
            "replan_required": sum(row.replan_required for row in rows),
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
        expected = {
            name: self._counter(getattr(snapshot, name), name)
            for name in actual
        }
        if expected != actual:
            raise RecoveryNativeBridgeError("recovery native summary counters do not match rows")

        return RecoveryNativeSnapshot(
            wire_schema_version=snapshot.schema_version,
            project_id=project_id,
            rows=rows,
            total_candidates=actual["total_candidates"],
            replan_required=actual["replan_required"],
            drift_detected=actual["drift_detected"],
            evidence_required=actual["evidence_required"],
            anchor_missing=actual["anchor_missing"],
            aligned_replan_required=actual["aligned_replan_required"],
            complete=actual["complete"],
        )

    @classmethod
    def _adapt_row(cls, row: RecoveryDashboardWireRow, *, project_id: str) -> RecoveryNativeRow:
        if not isinstance(row, RecoveryDashboardWireRow):
            raise RecoveryNativeBridgeError("recovery native snapshot contains an invalid row")
        row_project = cls._bounded_string(row.project_id, "row project_id")
        if row_project != project_id:
            raise RecoveryNativeBridgeError("recovery native row project does not match snapshot")
        work_id = cls._bounded_string(row.work_id, "work_id")
        disposition = row.disposition
        if not isinstance(disposition, str) or disposition not in cls._LABELS:
            raise RecoveryNativeBridgeError("unsupported recovery native disposition")
        schema_version = row.schema_version
        if (
            isinstance(schema_version, bool)
            or not isinstance(schema_version, int)
            or schema_version <= 0
        ):
            raise RecoveryNativeBridgeError("invalid durable recovery schema version")

        next_step_id = row.next_step_id
        if disposition == RecoveryCandidateDisposition.COMPLETE.value:
            if next_step_id is not None:
                raise RecoveryNativeBridgeError("complete recovery row cannot have a next step")
        else:
            if next_step_id is None:
                raise RecoveryNativeBridgeError("incomplete recovery row requires a next step")
            cls._bounded_string(next_step_id, "next_step_id")

        drift_fields = cls._bounded_field_tuple(row.drift_fields, "drift_fields")
        missing_context = cls._bounded_field_tuple(row.missing_context, "missing_context")
        if disposition == RecoveryCandidateDisposition.DRIFT_DETECTED.value:
            if not drift_fields or missing_context:
                raise RecoveryNativeBridgeError("drift row contains inconsistent detail fields")
            detail_fields = drift_fields
        elif disposition == RecoveryCandidateDisposition.EVIDENCE_REQUIRED.value:
            if not missing_context or drift_fields:
                raise RecoveryNativeBridgeError("evidence row contains inconsistent detail fields")
            detail_fields = missing_context
        else:
            if drift_fields or missing_context:
                raise RecoveryNativeBridgeError("recovery row contains unexpected detail fields")
            detail_fields = ()

        return RecoveryNativeRow(
            project_id=row_project,
            work_id=work_id,
            disposition=disposition,
            status_label=cls._LABELS[disposition],
            severity=cls._SEVERITIES[disposition],
            durable_schema_version=schema_version,
            next_step_id=next_step_id,
            detail_fields=detail_fields,
            replan_required=disposition in cls._REPLAN_DISPOSITIONS,
        )

    @staticmethod
    def _counter(value: object, field_name: str) -> int:
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise RecoveryNativeBridgeError(f"invalid {field_name}")
        return value

    @staticmethod
    def _bounded_string(value: object, field_name: str) -> str:
        if (
            not isinstance(value, str)
            or not value.strip()
            or len(value) > RecoveryDashboardWireCodec.MAX_ID_LENGTH
        ):
            raise RecoveryNativeBridgeError(f"invalid {field_name}")
        # Typed wire records can be constructed without going through the codec.
        if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
            raise RecoveryNativeBridgeError(f"invalid {field_name}")
        return value

    @classmethod
    def _bounded_field_tuple(cls, value: object, field_name: str) -> tuple[str, ...]:
        if not isinstance(value, tuple) or len(value) > RecoveryDashboardWireCodec.MAX_FIELD_NAMES:
            raise RecoveryNativeBridgeError(f"invalid {field_name}")
        seen: set[str] = set()
        normalized: list[str] = []
        for item in value:
            field = cls._bounded_string(item, field_name)
            if field in seen:
                raise RecoveryNativeBridgeError(f"duplicate {field_name} entry")
            seen.add(field)
            normalized.append(field)
        return tuple(normalized)
