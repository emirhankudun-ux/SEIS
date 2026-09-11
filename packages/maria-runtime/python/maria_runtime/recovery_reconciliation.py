from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from .context import ProjectContextEngine, _parse_time
from .work_execution import WorkPlanCheckpoint


class RecoveryReconciliationDisposition(str, Enum):
    """Advisory outcome for comparing a checkpoint anchor with current evidence."""

    COMPLETE = "complete"
    EVIDENCE_REQUIRED = "evidence-required"
    DRIFT_DETECTED = "drift-detected"
    ALIGNED_REPLAN_REQUIRED = "aligned-replan-required"


@dataclass(frozen=True)
class RecoveryAnchor:
    """Small checkpoint-time identity snapshot used only for drift comparison.

    The anchor intentionally excludes prompts, tool parameters, model output,
    credentials, permissions, and arbitrary workspace content. It captures only
    the minimum project/workspace identity needed to notice that an interrupted
    plan is no longer grounded in the same verified context.
    """

    project: str
    active_goal: str
    current_repo: str
    current_branch: str
    repository_revision: str | None = None

    _MAX_IDENTITY_LENGTH = 512

    def __post_init__(self) -> None:
        for field_name in ("project", "active_goal", "current_repo", "current_branch"):
            value = getattr(self, field_name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field_name} must be a non-empty string")
            if len(value) > self._MAX_IDENTITY_LENGTH:
                raise ValueError(f"{field_name} exceeds maximum length")
        if self.repository_revision is not None:
            if not isinstance(self.repository_revision, str) or not self.repository_revision.strip():
                raise ValueError("repository_revision must be non-empty when present")
            if len(self.repository_revision) > self._MAX_IDENTITY_LENGTH:
                raise ValueError("repository_revision exceeds maximum length")


@dataclass(frozen=True)
class RecoveryReconciliationAssessment:
    disposition: RecoveryReconciliationDisposition
    drift_fields: tuple[str, ...] = ()
    missing_context: tuple[str, ...] = ()

    @property
    def replan_required(self) -> bool:
        return self.disposition is not RecoveryReconciliationDisposition.COMPLETE

    @property
    def execution_authorized(self) -> bool:
        return False


class RecoveryReconciler:
    """Compare an interrupted checkpoint anchor with current verified context.

    This class never resumes or executes work. An aligned result means only that
    no identity drift was detected in the bounded fields checked here. Existing
    MARIA routing, planning, permission, and per-attempt authorization must still
    run again before any model/tool work occurs.

    A host may opt into a bounded freshness policy. When enabled, verified facts
    older than that window, or dated after the comparison instant, are treated as
    missing evidence rather than as drift. The default remains backward-compatible
    and applies no age policy.
    """

    _REQUIRED_FIELDS = (
        "active_goal",
        "current_repo",
        "current_branch",
    )
    _OPTIONAL_REVISION_FIELD = "repository_revision"
    _MAX_EVIDENCE_AGE_SECONDS = 24 * 60 * 60

    def __init__(
        self,
        context: ProjectContextEngine,
        *,
        max_evidence_age_seconds: int | None = None,
    ) -> None:
        if not isinstance(context, ProjectContextEngine):
            raise TypeError("context must be ProjectContextEngine")
        if max_evidence_age_seconds is not None:
            if isinstance(max_evidence_age_seconds, bool) or not isinstance(max_evidence_age_seconds, int):
                raise TypeError("max_evidence_age_seconds must be an integer when present")
            if not 1 <= max_evidence_age_seconds <= self._MAX_EVIDENCE_AGE_SECONDS:
                raise ValueError(
                    f"max_evidence_age_seconds must be between 1 and {self._MAX_EVIDENCE_AGE_SECONDS}"
                )
        self.context = context
        self.max_evidence_age_seconds = max_evidence_age_seconds

    def reconcile(
        self,
        checkpoint: WorkPlanCheckpoint,
        anchor: RecoveryAnchor,
        *,
        as_of: str | None = None,
    ) -> RecoveryReconciliationAssessment:
        if not isinstance(checkpoint, WorkPlanCheckpoint):
            raise TypeError("checkpoint must be WorkPlanCheckpoint")
        if not isinstance(anchor, RecoveryAnchor):
            raise TypeError("anchor must be RecoveryAnchor")

        if checkpoint.complete:
            return RecoveryReconciliationAssessment(
                RecoveryReconciliationDisposition.COMPLETE,
            )

        reference_time = self._reference_time(as_of)
        current: dict[str, str] = {}
        missing: list[str] = []
        for field_name in self._REQUIRED_FIELDS:
            value = self._verified_string_value(
                field_name,
                project=anchor.project,
                as_of=reference_time,
            )
            if value is None:
                missing.append(field_name)
            else:
                current[field_name] = value

        if anchor.repository_revision is not None:
            revision = self._verified_string_value(
                self._OPTIONAL_REVISION_FIELD,
                project=anchor.project,
                as_of=reference_time,
            )
            if revision is None:
                missing.append(self._OPTIONAL_REVISION_FIELD)
            else:
                current[self._OPTIONAL_REVISION_FIELD] = revision

        if missing:
            return RecoveryReconciliationAssessment(
                RecoveryReconciliationDisposition.EVIDENCE_REQUIRED,
                missing_context=tuple(missing),
            )

        expected: dict[str, str] = {
            "active_goal": anchor.active_goal,
            "current_repo": anchor.current_repo,
            "current_branch": anchor.current_branch,
        }
        if anchor.repository_revision is not None:
            expected[self._OPTIONAL_REVISION_FIELD] = anchor.repository_revision

        drift_fields = tuple(
            field_name
            for field_name in (*self._REQUIRED_FIELDS, self._OPTIONAL_REVISION_FIELD)
            if field_name in expected and current[field_name] != expected[field_name]
        )
        if drift_fields:
            return RecoveryReconciliationAssessment(
                RecoveryReconciliationDisposition.DRIFT_DETECTED,
                drift_fields=drift_fields,
            )

        return RecoveryReconciliationAssessment(
            RecoveryReconciliationDisposition.ALIGNED_REPLAN_REQUIRED,
        )

    def _reference_time(self, as_of: str | None) -> datetime | None:
        if self.max_evidence_age_seconds is None:
            return None
        if as_of is None:
            return datetime.now(timezone.utc)
        if not isinstance(as_of, str):
            raise TypeError("as_of must be an ISO timestamp when present")
        return _parse_time(as_of)

    def _verified_string_value(
        self,
        key: str,
        *,
        project: str,
        as_of: datetime | None,
    ) -> str | None:
        fact = self.context.get(key, project=project)
        if fact is None or not fact.verified:
            return None
        value: Any = fact.value
        if not isinstance(value, str) or not value.strip():
            return None
        if as_of is not None:
            observed_at = _parse_time(fact.observed_at)
            age_seconds = (as_of - observed_at).total_seconds()
            if age_seconds < 0 or age_seconds > self.max_evidence_age_seconds:
                return None
        return value
