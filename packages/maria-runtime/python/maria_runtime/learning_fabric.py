"""Evidence-only admission for model learning and host-bound plugin skills.

This module does no I/O, training, downloading, installation, or tool execution.
Review records must come from trusted host review/evaluation workflows, never
from model output or imported plugin metadata. It checks supplied attestations;
it does not authenticate reviewers, interpret licenses, or scan private content.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import math
import re

from .models import ModelSpec
from .registry import CapabilityRegistry, ToolStatus


class LearningUse(str, Enum):
    KNOWLEDGE = "knowledge"
    FINETUNE = "finetune"
    DISTILLATION = "distillation"


class SourceKind(str, Enum):
    PROJECT = "project"
    MODEL_OUTPUT = "model-output"
    SKILL_DOCUMENTATION = "skill-documentation"
    TOOL_TRACE = "tool-trace"


class HostSurface(str, Enum):
    CHATGPT = "chatgpt"
    CODEX = "codex"
    SEIS = "seis"


def _expect(value: object, expected: type) -> None:
    if type(value) is not expected:
        raise TypeError("invalid learning contract type")


def _label(value: object) -> None:
    if (not isinstance(value, str) or not 1 <= len(value) <= 512
            or value != value.strip() or "*" in value
            or any(ord(c) < 32 or ord(c) == 127 for c in value)):
        raise ValueError("invalid learning contract identifier")


def _digest(value: object) -> None:
    if not isinstance(value, str) or re.fullmatch(r"[0-9a-f]{64}", value) is None:
        raise ValueError("content revision must be a lowercase SHA-256 digest")


def _timestamp(value: object) -> None:
    try:
        valid = type(value) in (int, float) and value > 0 and math.isfinite(value)
    except OverflowError:
        valid = False
    if not valid:
        raise ValueError("timestamp must be a finite positive Unix timestamp")


@dataclass(frozen=True, repr=False)
class ModelIdentity:
    provider: str
    name: str
    revision: str

    def __post_init__(self) -> None:
        for value in (self.provider, self.name, self.revision):
            _label(value)

    @classmethod
    def from_spec(cls, model: ModelSpec, revision: str) -> ModelIdentity:
        _expect(model, ModelSpec)
        # Inference availability/capabilities never imply training support.
        return cls(model.provider, model.name, revision)


@dataclass(frozen=True, repr=False)
class LearningSource:
    source_id: str
    revision: str
    kind: SourceKind
    origin_id: str

    def __post_init__(self) -> None:
        _label(self.source_id)
        _digest(self.revision)
        _expect(self.kind, SourceKind)
        _label(self.origin_id)


@dataclass(frozen=True, repr=False)
class LearningApproval:
    source: LearningSource
    purpose: LearningUse
    project: str
    target: ModelIdentity
    review_id: str
    expires_at: float
    rights_reviewed: bool = False
    privacy_reviewed: bool = False
    quality_reviewed: bool = False
    revoked: bool = False

    def __post_init__(self) -> None:
        _expect(self.source, LearningSource)
        _expect(self.purpose, LearningUse)
        _expect(self.target, ModelIdentity)
        _label(self.project)
        _label(self.review_id)
        _timestamp(self.expires_at)
        for value in (self.rights_reviewed, self.privacy_reviewed,
                      self.quality_reviewed, self.revoked):
            _expect(value, bool)


@dataclass(frozen=True, repr=False)
class TrainingSupport:
    target: ModelIdentity
    purposes: tuple[LearningUse, ...]
    review_id: str
    expires_at: float
    verified: bool = False

    def __post_init__(self) -> None:
        _expect(self.target, ModelIdentity)
        _expect(self.purposes, tuple)
        if not 1 <= len(self.purposes) <= 2:
            raise ValueError("training support requires one or two explicit purposes")
        for purpose in self.purposes:
            _expect(purpose, LearningUse)
            if purpose not in (LearningUse.FINETUNE, LearningUse.DISTILLATION):
                raise ValueError("knowledge access is not a training method")
        if len(set(self.purposes)) != len(self.purposes):
            raise ValueError("duplicate training purposes")
        _label(self.review_id)
        _timestamp(self.expires_at)
        _expect(self.verified, bool)


@dataclass(frozen=True)
class LearningAdmission:
    admitted: bool
    reason: str

    @property
    def training_started(self) -> bool:
        return False


class LearningAdmissionPolicy:
    """Evaluate a single source-target-purpose admission, without exporting data.

    A positive decision is NOT permission to start a job, spend money, publish
    weights, upload content, or execute tools. Actual content digests, consent,
    licensing and review authenticity are checked by the trusted caller.
    """

    def assess(
        self, *, source: LearningSource, purpose: LearningUse, project: str,
        target: ModelIdentity, now: float,
        approval: LearningApproval | None = None,
        support: TrainingSupport | None = None,
    ) -> LearningAdmission:
        _expect(source, LearningSource)
        _expect(purpose, LearningUse)
        _expect(target, ModelIdentity)
        _label(project)
        _timestamp(now)
        if support is not None:
            _expect(support, TrainingSupport)
        if approval is None:
            return LearningAdmission(False, "approval-required")
        _expect(approval, LearningApproval)
        if (approval.source != source or approval.purpose is not purpose
                or approval.project != project or approval.target != target):
            return LearningAdmission(False, "approval-mismatch")
        if approval.revoked:
            return LearningAdmission(False, "approval-revoked")
        if now >= approval.expires_at:
            return LearningAdmission(False, "approval-expired")
        if not (approval.rights_reviewed and approval.privacy_reviewed and approval.quality_reviewed):
            return LearningAdmission(False, "review-incomplete")
        if source.kind is SourceKind.MODEL_OUTPUT and purpose is LearningUse.FINETUNE:
            return LearningAdmission(False, "teacher-requires-distillation")
        if purpose is not LearningUse.KNOWLEDGE:
            if (support is None or not support.verified or support.target != target
                    or purpose not in support.purposes or now >= support.expires_at):
                return LearningAdmission(False, "training-support-required")
        return LearningAdmission(True, "admitted-for-planning")


@dataclass(frozen=True, repr=False)
class PluginSkillBinding:
    plugin_id: str
    skill_id: str
    host: HostSurface
    version: str
    revision: str
    tool_name: str
    capability: str
    tool_version: str

    def __post_init__(self) -> None:
        for value in (self.plugin_id, self.skill_id, self.version,
                      self.tool_name, self.capability, self.tool_version):
            _label(value)
        _digest(self.revision)
        _expect(self.host, HostSurface)


@dataclass(frozen=True, repr=False)
class SkillEvaluation:
    binding: PluginSkillBinding
    target: ModelIdentity
    project: str
    total_cases: int
    passed_cases: int
    report_id: str
    expires_at: float

    def __post_init__(self) -> None:
        _expect(self.binding, PluginSkillBinding)
        _expect(self.target, ModelIdentity)
        _label(self.project)
        _expect(self.total_cases, int)
        _expect(self.passed_cases, int)
        if not 1 <= self.total_cases <= 1_000_000 or not 0 <= self.passed_cases <= self.total_cases:
            raise ValueError("invalid evaluation case counts")
        _label(self.report_id)
        _timestamp(self.expires_at)


@dataclass(frozen=True)
class PluginSkillReadiness:
    verified: bool
    reason: str

    @property
    def execution_authorized(self) -> bool:
        return False


class PluginSkillPolicy:
    """Check evaluation evidence against an existing host-scoped tool registry.

    'verified' means supplied evaluation evidence matches, NOT 'weight-trained',
    authenticated by this module, or universally available. The caller supplies
    a current registry for the stated host. Per-action permission checks in the
    existing work runner/MCP invocation path are mandatory after this preview.
    """

    def assess(
        self, *, binding: PluginSkillBinding, target: ModelIdentity,
        host: HostSurface, project: str, registry: CapabilityRegistry, now: float,
        evaluation: SkillEvaluation | None = None,
    ) -> PluginSkillReadiness:
        _expect(binding, PluginSkillBinding)
        _expect(target, ModelIdentity)
        _expect(host, HostSurface)
        _expect(registry, CapabilityRegistry)
        _label(project)
        _timestamp(now)
        if evaluation is not None:
            _expect(evaluation, SkillEvaluation)
        if binding.host is not host:
            return PluginSkillReadiness(False, "host-mismatch")
        tool = next((item for item in registry.all() if item.name == binding.tool_name), None)
        if tool is None or tool.status is not ToolStatus.AVAILABLE:
            return PluginSkillReadiness(False, "tool-unavailable")
        if tool.version != binding.tool_version:
            return PluginSkillReadiness(False, "version-mismatch")
        if binding.capability not in tool.capabilities:
            return PluginSkillReadiness(False, "capability-mismatch")
        if "*" not in tool.supported_projects and project not in tool.supported_projects:
            return PluginSkillReadiness(False, "project-denied")
        if evaluation is None:
            return PluginSkillReadiness(False, "evaluation-required")
        if (evaluation.binding != binding or evaluation.target != target
                or evaluation.project != project):
            return PluginSkillReadiness(False, "evaluation-mismatch")
        if now >= evaluation.expires_at:
            return PluginSkillReadiness(False, "evaluation-expired")
        if evaluation.passed_cases != evaluation.total_cases:
            return PluginSkillReadiness(False, "evaluation-failed")
        return PluginSkillReadiness(True, "evaluation-verified")
