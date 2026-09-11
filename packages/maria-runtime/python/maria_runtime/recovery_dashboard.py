from __future__ import annotations

from dataclasses import dataclass

from .recovery_candidate import (
    RecoveryCandidateDisposition,
    RecoveryCandidateInspector,
    RecoveryCandidateView,
)
from .work_recovery import DurableWorkCheckpointStore


@dataclass(frozen=True)
class RecoveryDashboardSnapshot:
    """Bounded public-safe recovery overview for one project.

    Rows are the already-redacted ``RecoveryCandidateView`` records. The
    snapshot intentionally carries no checkpoint bodies, recovery anchors,
    prompts, tool parameters, credentials, raw model/tool output, or execution
    authorization.
    """

    project_id: str
    rows: tuple[RecoveryCandidateView, ...]
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


class RecoveryDashboardBuilder:
    """Compose durable discovery and candidate inspection without mutation."""

    def __init__(
        self,
        *,
        store: DurableWorkCheckpointStore,
        inspector: RecoveryCandidateInspector,
    ) -> None:
        if not isinstance(store, DurableWorkCheckpointStore):
            raise TypeError("store must be DurableWorkCheckpointStore")
        if not isinstance(inspector, RecoveryCandidateInspector):
            raise TypeError("inspector must be RecoveryCandidateInspector")
        if inspector.store is not store:
            raise ValueError("inspector and dashboard must share the same store")
        self.store = store
        self.inspector = inspector

    def snapshot(
        self,
        project_id: str,
        *,
        include_complete: bool = False,
        limit: int = 64,
    ) -> RecoveryDashboardSnapshot:
        """Build one deterministic read-only recovery dashboard snapshot.

        ``DurableWorkCheckpointStore.discover`` remains authoritative for path,
        corruption, file-count and caller-limit validation. Inspection then adds
        current-context reconciliation. A record removed by a concurrent trusted
        cleanup between discovery and inspection is omitted rather than surfaced
        as resumable evidence.
        """

        catalog = self.store.discover(
            project_id,
            include_complete=include_complete,
            limit=limit,
        )
        rows: list[RecoveryCandidateView] = []
        for entry in catalog:
            view = self.inspector.inspect(entry.project_id, entry.work_id)
            if view.disposition is RecoveryCandidateDisposition.NOT_FOUND:
                continue
            rows.append(view)

        rows.sort(key=lambda row: row.work_id)
        frozen_rows = tuple(rows)

        def count(disposition: RecoveryCandidateDisposition) -> int:
            return sum(row.disposition is disposition for row in frozen_rows)

        return RecoveryDashboardSnapshot(
            project_id=project_id,
            rows=frozen_rows,
            total_candidates=len(frozen_rows),
            replan_required=sum(row.replan_required for row in frozen_rows),
            drift_detected=count(RecoveryCandidateDisposition.DRIFT_DETECTED),
            evidence_required=count(RecoveryCandidateDisposition.EVIDENCE_REQUIRED),
            anchor_missing=count(RecoveryCandidateDisposition.ANCHOR_MISSING),
            aligned_replan_required=count(
                RecoveryCandidateDisposition.ALIGNED_REPLAN_REQUIRED
            ),
            complete=count(RecoveryCandidateDisposition.COMPLETE),
        )
