"""MARIA × SEIS runtime foundation.

This package intentionally exposes policy, routing, provider metadata, and safe
integration-preview contracts only. Live tool/provider adapters remain separate,
explicit, capability-discovered, and permission-gated.
"""

from .cache import PromptCache
from .context import ContextFact, ProjectContextEngine
from .continuation import ContinuationBrief, ContinuationResolver
from .local_probe import (
    LocalProbeError,
    LocalProbeRequest,
    LocalProbeResponse,
    LocalProbeResult,
    LocalRuntimeProbe,
)
from .mcp_config import MCPConfigImporter, MCPImportPreview, MCPServerDescriptor
from .models import ModelRegistry, ModelSpec
from .permissions import ActionClass, PermissionDecision, PermissionEngine
from .projects import ProjectProfile, ProjectRegistry, WorkMode, default_project_registry
from .providers import ProviderRegistry, ProviderSpec, ProviderStatus, default_provider_registry
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
    "LocalProbeError",
    "LocalProbeRequest",
    "LocalProbeResponse",
    "LocalProbeResult",
    "LocalRuntimeProbe",
    "MCPConfigImporter",
    "MCPImportPreview",
    "MCPServerDescriptor",
    "ModelRegistry",
    "ModelRouter",
    "ModelSpec",
    "PermissionDecision",
    "PermissionEngine",
    "ProjectContextEngine",
    "ProjectProfile",
    "ProjectRegistry",
    "PromptCache",
    "ProviderRegistry",
    "ProviderSpec",
    "ProviderStatus",
    "ToolSpec",
    "ToolStatus",
    "WorkMode",
    "default_project_registry",
    "default_provider_registry",
]
