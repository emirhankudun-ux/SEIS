"""MARIA × SEIS runtime foundation.

This package intentionally exposes policy and routing contracts only. Live tool
adapters remain separate, explicit, and permission-gated.
"""

from .cache import PromptCache
from .context import ContextFact, ProjectContextEngine
from .models import ModelRegistry, ModelSpec
from .permissions import ActionClass, PermissionDecision, PermissionEngine
from .registry import CapabilityRegistry, ToolSpec, ToolStatus
from .routing import ModelRouter
from .safety import CommandPolicy

__all__ = [
    "ActionClass",
    "CapabilityRegistry",
    "CommandPolicy",
    "ContextFact",
    "ModelRegistry",
    "ModelRouter",
    "ModelSpec",
    "PermissionDecision",
    "PermissionEngine",
    "ProjectContextEngine",
    "PromptCache",
    "ToolSpec",
    "ToolStatus",
]
