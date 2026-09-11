from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .recovery_reconciliation import (
    RecoveryReconciler,
    RecoveryReconciliationDisposition,
)
from .work_recovery import DurableWorkCheckpointStore


class RecoveryCandidateDisposition(str, Enum):
    """Public-safe status for one durable recovery candidate."""

    NOT_FOUND = "not-found"
    COMPLETE = "complete"
    ANCHOR_MISSING = "anchor-missing"
    EVIDENCE_REQUIRED = "evidence-required"
    DRIFT_DETECTED = "drift-detected"
    ALIGNED_REPLAN_REQUIRED = "aligned-replan-required"


@dataclass(frozen=True)
class RecoveryCandidateView:
    """Read-only recovery status suitable for runtime/UI presentation.

    The view intentionally excludes the full checkpoint and recovery anchor.
    Those records remain internal evidence. This object cannot resume or execute
    work and never carries an authorization token.
    """

    project_id: str
    work_id: str
    disposition: RecoveryCandidateDisposition
    schema_version: int | None = None
    next_step_id: str | None = None
    drift_fields: tuple[str, ...] = ()
    missing_context: tuple[str, ...] = ()

    @property
    def replan_required(self) -> bool:
        return self.disposition in {
            RecoveryCandidateDisposition.ANCHOR_MISSING,
            RecoveryCandidateDisposition.EVIDENCE_REQUIRED,
            RecoveryCandidateDisposition.DRIFT_DETECTED,
            RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED,
        }

    @property
    def execution_authorized(self) -> bool:
        return False


class RecoveryCandidateInspector:
    """Combine durable recovery evidence with current verified context.

    Inspection is read-only. It delegates durable validation to
    ``DurableWorkCheckpointStore`` and identity drift checks to
    ``RecoveryReconciler``. An aligned candidate still requires a fresh plan and
    normal authorization before any execution can occur.
    """

    def __init__(
        self,
        *,
        store: DurableWorkCheckpointStore,
        reconciler: RecoveryReconciler,
    ) -> None:
        if not isinstance(store, DurableWorkCheckpointStore):
            raise TypeError("store must be DurableWorkCheckpointStore")
        if not isinstance(reconciler, RecoveryReconciler):
            raise TypeError("reconciler must be RecoveryReconciler")
        self.store = store
        self.reconciler = reconciler

    def inspect(self, project_id: str, work_id: str) -> RecoveryCandidateView:
        record = self.store.load_record(project_id, work_id)
        if record is None:
            return RecoveryCandidateView(
                project_id=project_id,
                work_id=work_id,
                disposition=RecoveryCandidateDisposition.NOT_FOUND,
            )

        checkpoint = record.checkpoint
        if checkpoint.complete:
            return RecoveryCandidateView(
                project_id=project_id,
                work_id=work_id,
                disposition=RecoveryCandidateDisposition.COMPLETE,
                schema_version=record.schema_version,
            )

        if record.recovery_anchor is None:
            return RecoveryCandidateView(
                project_id=project_id,
                work_id=work_id,
                disposition=RecoveryCandidateDisposition.ANCHOR_MISSING,
                schema_version=record.schema_version,
                next_step_id=checkpoint.next_step_id,
            )

        assessment = self.reconciler.reconcile(
            checkpoint,
            record.recovery_anchor,
        )
        disposition_map = {
            RecoveryReconciliationDisposition.COMPLETE: RecoveryCandidateDisposition.COMPLETE,
            RecoveryReconciliationDisposition.EVIDENCE_REQUIRED: RecoveryCandidateDisposition.EVIDENCE_REQUIRED,
            RecoveryReconciliationDisposition.DRIFT_DETECTED: RecoveryCandidateDisposition.DRIFT_DETECTED,
            RecoveryReconciliationDisposition.ALIGNED_REPLAN_REQUIRED: RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED,
        }
        return RecoveryCandidateView(
            project_id=project_id,
            work_id=work_id,
            disposition=disposition_map[assessment.disposition],
            schema_version=record.schema_version,
            next_step_id=checkpoint.next_step_id,
            drift_fields=assessment.drift_fields,
            missing_context=assessment.missing_context,
        )
