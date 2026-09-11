"""MARIA × SEIS runtime foundation.

This package intentionally exposes policy and routing contracts only. Live tool
adapters remain separate, explicit, and permission-gated.
"""

from .cache import PromptCache
from .context import ContextFact, ProjectContextEngine
from .continuation import ContinuationBrief, ContinuationResolver
from .models import ModelRegistry, ModelSpec
from .permissions import ActionClass, PermissionDecision, PermissionEngine, ResolvedTargetEvidence
from .projects import ProjectProfile, ProjectRegistry, WorkMode, default_project_registry
from .registry import CapabilityRegistry, ToolSpec, ToolStatus
from .routing import ModelRouter
from .safety import CommandPolicy

__all__ = [
    "ActionClass",
    "CapabilityRegistry",
    "CommandPolicy",
    "ContextFact",
    "ContinuationBrief",
    "ContinuationResolver",
    "ModelRegistry",
    "ModelRouter",
    "ModelSpec",
    "PermissionDecision",
    "PermissionEngine",
    "ProjectContextEngine",
    "ProjectProfile",
    "ProjectRegistry",
    "PromptCache",
    "ResolvedTargetEvidence",
    "ToolSpec",
    "ToolStatus",
    "WorkMode",
    "default_project_registry",
]
