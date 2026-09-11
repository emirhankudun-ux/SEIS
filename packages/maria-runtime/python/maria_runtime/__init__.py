"""MARIA × SEIS runtime foundation.

This package intentionally exposes policy, routing, provider metadata, and safe
integration-preview contracts only. Live tool/provider adapters remain separate,
explicit, capability-discovered, and permission-gated.
"""

from .cache import PromptCache
from .context import ContextFact, ProjectContextEngine
from .continuation import ContinuationBrief, ContinuationResolver
from .fabric_router import (
    CapabilityRequest,
    RouteDecision,
    RouteKind,
    UnifiedCapabilityRouter,
)
from .local_coordinator import LocalDiscoveryCoordinator
from .local_health import (
    LocalHealthEvidenceLedger,
    ProbeHealthSummary,
    ProbeObservation,
    ProbeOutcome,
)
from .local_probe import (
    LocalProbeError,
    LocalProbeFailureKind,
    LocalProbeRequest,
    LocalProbeResponse,
    LocalProbeResult,
    LocalRuntimeProbe,
)
from .local_status import (
    LocalRuntimeSnapshotBuilder,
    LocalRuntimeStatusSnapshot,
    RuntimeProbeState,
    RuntimeProbeStatus,
)
from .mcp_config import MCPConfigImporter, MCPImportPreview, MCPServerDescriptor
from .mcp_executor import (
    MCPInvocationEvidence,
    MCPInvocationExecutor,
    MCPInvocationResult,
    MCPInvocationTransport,
)
from .mcp_invocation import MCPInvocationGuard, MCPInvocationPlan
from .mcp_keychain import MCPKeychainSecretSource
from .mcp_protocol import (
    MCP_LEGACY_PROTOCOL_VERSION,
    MCP_MODERN_PROTOCOL_VERSION,
    MCPProtocolDecision,
    MCPProtocolEra,
    MCPProtocolNegotiator,
    MCPProtocolProbe,
)
from .mcp_secrets import (
    MCPEnvironmentResolver,
    MCPResolvedEnvironmentLease,
    MCPSecretSource,
)
from .mcp_stdio import MCPStdioFrameCodec, MCPStdioFrameError, MCPStdioFrameFailure
from .mcp_stdio_transport import (
    MCPStdioProcessTransport,
    MCPStdioShutdownState,
    MCPStdioTransportSnapshot,
)
from .mcp_supervisor import (
    MCPProcessLaunchPlan,
    MCPProcessPolicy,
    MCPProcessSnapshot,
    MCPProcessStartResult,
    MCPProcessState,
    MCPProcessSupervisor,
    MCPProcessTransport,
)
from .models import ModelRegistry, ModelSpec
from .permissions import ActionClass, PermissionDecision, PermissionEngine
from .projects import ProjectProfile, ProjectRegistry, WorkMode, default_project_registry
from .providers import ProviderRegistry, ProviderSpec, ProviderStatus, default_provider_registry
from .registry import CapabilityRegistry, ToolSpec, ToolStatus
from .routing import ModelRouteDecision, ModelRouter
from .safety import CommandPolicy
from .work_routing import (
    MultiStepWorkRouter,
    WorkRoutePlan,
    WorkRouteStep,
    WorkStepRequest,
)

__all__ = [
    "ActionClass",
    "CapabilityRegistry",
    "CapabilityRequest",
    "CommandPolicy",
    "ContextFact",
    "ContinuationBrief",
    "ContinuationResolver",
    "LocalDiscoveryCoordinator",
    "LocalHealthEvidenceLedger",
    "LocalProbeError",
    "LocalProbeFailureKind",
    "LocalProbeRequest",
    "LocalProbeResponse",
    "LocalProbeResult",
    "LocalRuntimeProbe",
    "LocalRuntimeSnapshotBuilder",
    "LocalRuntimeStatusSnapshot",
    "MCPConfigImporter",
    "MCPEnvironmentResolver",
    "MCPImportPreview",
    "MCPInvocationEvidence",
    "MCPInvocationExecutor",
    "MCPInvocationGuard",
    "MCPInvocationPlan",
    "MCPInvocationResult",
    "MCPInvocationTransport",
    "MCPKeychainSecretSource",
    "MCP_LEGACY_PROTOCOL_VERSION",
    "MCP_MODERN_PROTOCOL_VERSION",
    "MCPProcessLaunchPlan",
    "MCPProcessPolicy",
    "MCPProcessSnapshot",
    "MCPProcessStartResult",
    "MCPProcessState",
    "MCPProcessSupervisor",
    "MCPProcessTransport",
    "MCPProtocolDecision",
    "MCPProtocolEra",
    "MCPProtocolNegotiator",
    "MCPProtocolProbe",
    "MCPResolvedEnvironmentLease",
    "MCPSecretSource",
    "MCPServerDescriptor",
    "MCPStdioFrameCodec",
    "MCPStdioFrameError",
    "MCPStdioFrameFailure",
    "MCPStdioProcessTransport",
    "MCPStdioShutdownState",
    "MCPStdioTransportSnapshot",
    "ModelRegistry",
    "ModelRouteDecision",
    "ModelRouter",
    "ModelSpec",
    "MultiStepWorkRouter",
    "PermissionDecision",
    "PermissionEngine",
    "ProbeHealthSummary",
    "ProbeObservation",
    "ProbeOutcome",
    "ProjectContextEngine",
    "ProjectProfile",
    "ProjectRegistry",
    "PromptCache",
    "ProviderRegistry",
    "ProviderSpec",
    "ProviderStatus",
    "RouteDecision",
    "RouteKind",
    "RuntimeProbeState",
    "RuntimeProbeStatus",
    "ToolSpec",
    "ToolStatus",
    "UnifiedCapabilityRouter",
    "WorkMode",
    "WorkRoutePlan",
    "WorkRouteStep",
    "WorkStepRequest",
    "default_project_registry",
    "default_provider_registry",
]
