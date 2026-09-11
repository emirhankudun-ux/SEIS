"""Metadata-only planning for reviewed MARIA learning datasets.

This module never reads source content, exports a dataset, calls a provider,
allocates compute, or starts training. It converts already reviewed source
metadata into a deterministic train/validation/test manifest while reusing the
Learning Fabric admission policy as the source-of-truth authorization boundary.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import hashlib
import json
import math

from .learning_fabric import (
    LearningAdmissionPolicy,
    LearningApproval,
    LearningSource,
    LearningUse,
    ModelIdentity,
    TrainingSupport,
)


class DatasetSplit(str, Enum):
    TRAIN = "train"
    VALIDATION = "validation"
    TEST = "test"


def _validate_project(project: object) -> None:
    if (
        type(project) is not str
        or not 1 <= len(project) <= 512
        or project != project.strip()
        or "*" in project
        or any(ord(char) < 32 or ord(char) == 127 for char in project)
    ):
        raise ValueError("invalid dataset project identifier")


def _validate_timestamp(now: object) -> None:
    try:
        valid = type(now) in (int, float) and now > 0 and math.isfinite(now)
    except OverflowError:
        valid = False
    if not valid:
        raise ValueError("dataset planning time must be a finite positive Unix timestamp")


@dataclass(frozen=True, repr=False)
class DatasetCandidate:
    source: LearningSource
    approval: LearningApproval

    def __post_init__(self) -> None:
        if type(self.source) is not LearningSource:
            raise TypeError("dataset candidate source must be a LearningSource")
        if type(self.approval) is not LearningApproval:
            raise TypeError("dataset candidate approval must be a LearningApproval")
        if self.approval.source != self.source:
            raise ValueError("dataset candidate approval source mismatch")


@dataclass(frozen=True, repr=False)
class DatasetEntry:
    source_id: str
    source_revision: str
    origin_id: str
    source_kind: str
    split: DatasetSplit


@dataclass(frozen=True, repr=False)
class DatasetPlan:
    project: str
    target: ModelIdentity
    purpose: LearningUse
    entries: tuple[DatasetEntry, ...]
    manifest_digest: str

    @property
    def training_started(self) -> bool:
        return False

    def count(self, split: DatasetSplit) -> int:
        if type(split) is not DatasetSplit:
            raise TypeError("split must be a DatasetSplit")
        return sum(1 for entry in self.entries if entry.split is split)


@dataclass(frozen=True, repr=False)
class DatasetPlanDecision:
    planned: bool
    reason: str
    plan: DatasetPlan | None = None

    @property
    def training_started(self) -> bool:
        return False


class DatasetPlanner:
    """Build a deterministic metadata manifest from explicitly reviewed sources.

    The planner deliberately keeps sources sharing the same ``origin_id`` in one
    split. This reduces accidental leakage between training and held-out evidence.
    At least three independent origins are required so train, validation and test
    can all remain non-empty without splitting a provenance group.

    A successful decision is only a *plan*. It grants no data-read authority and
    cannot launch a trainer or publish weights.
    """

    def __init__(self, admission_policy: LearningAdmissionPolicy | None = None) -> None:
        if admission_policy is not None and type(admission_policy) is not LearningAdmissionPolicy:
            raise TypeError("admission_policy must be LearningAdmissionPolicy")
        self._admission = admission_policy or LearningAdmissionPolicy()

    def plan(
        self,
        *,
        candidates: tuple[DatasetCandidate, ...],
        purpose: LearningUse,
        project: str,
        target: ModelIdentity,
        support: TrainingSupport | None,
        now: float,
    ) -> DatasetPlanDecision:
        if type(candidates) is not tuple:
            raise TypeError("candidates must be an immutable tuple")
        if type(purpose) is not LearningUse:
            raise TypeError("purpose must be a LearningUse")
        if type(target) is not ModelIdentity:
            raise TypeError("target must be a ModelIdentity")
        if support is not None and type(support) is not TrainingSupport:
            raise TypeError("support must be a TrainingSupport or None")
        _validate_project(project)
        _validate_timestamp(now)
        if not candidates:
            return DatasetPlanDecision(False, "candidate-required")
        for candidate in candidates:
            if type(candidate) is not DatasetCandidate:
                raise TypeError("every candidate must be a DatasetCandidate")

        if purpose is LearningUse.KNOWLEDGE:
            return DatasetPlanDecision(False, "training-purpose-required")

        revisions: set[str] = set()
        for candidate in candidates:
            revision = candidate.source.revision
            if revision in revisions:
                return DatasetPlanDecision(False, "duplicate-content")
            revisions.add(revision)

        for candidate in candidates:
            admission = self._admission.assess(
                source=candidate.source,
                purpose=purpose,
                project=project,
                target=target,
                approval=candidate.approval,
                support=support,
                now=now,
            )
            if not admission.admitted:
                return DatasetPlanDecision(False, f"candidate-{admission.reason}")

        grouped: dict[str, list[DatasetCandidate]] = {}
        for candidate in candidates:
            grouped.setdefault(candidate.source.origin_id, []).append(candidate)
        if len(grouped) < 3:
            return DatasetPlanDecision(False, "insufficient-independent-origins")

        # Keep whole provenance groups together. Prefer the two smallest groups as
        # held-out groups so the training partition remains useful. SHA-256 is a
        # deterministic tie-breaker and reveals no ordering dependence.
        ordered_origins = sorted(
            grouped,
            key=lambda origin: (
                len(grouped[origin]),
                hashlib.sha256(origin.encode("utf-8")).hexdigest(),
            ),
        )
        split_by_origin = {
            ordered_origins[0]: DatasetSplit.TEST,
            ordered_origins[1]: DatasetSplit.VALIDATION,
        }
        for origin in ordered_origins[2:]:
            split_by_origin[origin] = DatasetSplit.TRAIN

        entries = tuple(
            DatasetEntry(
                source_id=candidate.source.source_id,
                source_revision=candidate.source.revision,
                origin_id=candidate.source.origin_id,
                source_kind=candidate.source.kind.value,
                split=split_by_origin[candidate.source.origin_id],
            )
            for candidate in sorted(
                candidates,
                key=lambda item: (
                    item.source.revision,
                    item.source.source_id,
                    item.source.origin_id,
                    item.source.kind.value,
                ),
            )
        )

        canonical_manifest = {
            "project": project,
            "target": {
                "provider": target.provider,
                "name": target.name,
                "revision": target.revision,
            },
            "purpose": purpose.value,
            "entries": [
                {
                    "source_id": entry.source_id,
                    "source_revision": entry.source_revision,
                    "origin_id": entry.origin_id,
                    "source_kind": entry.source_kind,
                    "split": entry.split.value,
                }
                for entry in entries
            ],
        }
        manifest_digest = hashlib.sha256(
            json.dumps(
                canonical_manifest,
                ensure_ascii=True,
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
        ).hexdigest()

        return DatasetPlanDecision(
            True,
            "dataset-plan-ready",
            DatasetPlan(
                project=project,
                target=target,
                purpose=purpose,
                entries=entries,
                manifest_digest=manifest_digest,
            ),
        )
