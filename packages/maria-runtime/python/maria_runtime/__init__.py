"""MARIA × SEIS runtime foundation.

This package exposes policy, routing, provider metadata, safe integration
contracts, explicit bounded local-model inference adapters, and redacted
readiness snapshots. Live external execution remains capability-discovered,
permission-gated, and opt-in.
"""

from .cache import PromptCache
from .context import ContextFact, ProjectContextEngine
from .continuation import ContinuationBrief, ContinuationResolver
from .fabric_router import CapabilityRequest, RouteDecision, RouteKind, UnifiedCapabilityRouter
from .local_coordinator import LocalDiscoveryCoordinator
from .local_health import LocalHealthEvidenceLedger, ProbeHealthSummary, ProbeObservation, ProbeOutcome
from .local_model_adapter import LMStudioModelWorkAdapter, LocalModelLimits, OllamaModelWorkAdapter
from .local_model_readiness import (
    LocalModelReadinessBuilder,
    LocalModelReadinessRecord,
    LocalModelReadinessState,
)
from .local_model_transport import (
    LocalModelRequest,
    LocalModelResponse,
    LocalModelTransport,
    LoopbackModelHTTPTransport,
)
from .local_probe import (
    LocalProbeError,
    LocalProbeFailureKind,
    LocalProbeRequest,
    LocalProbeResponse,
    LocalProbeResult,
    LocalRuntimeProbe,
)
from .local_status import LocalRuntimeSnapshotBuilder, LocalRuntimeStatusSnapshot, RuntimeProbeState, RuntimeProbeStatus
from .mcp_config import MCPConfigImporter, MCPImportPreview, MCPServerDescriptor
from .mcp_executor import MCPInvocationEvidence, MCPInvocationExecutor, MCPInvocationResult, MCPInvocationTransport
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
from .mcp_secrets import MCPEnvironmentResolver, MCPResolvedEnvironmentLease, MCPSecretSource
from .mcp_stdio import MCPStdioFrameCodec, MCPStdioFrameError, MCPStdioFrameFailure
from .mcp_stdio_transport import MCPStdioProcessTransport, MCPStdioShutdownState, MCPStdioTransportSnapshot
from .mcp_supervisor import (
    MCPProcessLaunchPlan,
    MCPProcessPolicy,
    MCPProcessSnapshot,
    MCPProcessStartResult,
    MCPProcessState,
    MCPProcessSupervisor,
    MCPProcessTransport,
)
from .mcp_work_runner import MCPWorkInvocationExecutor, MCPWorkStepBinding, MCPWorkStepRunner
from .model_work_runner import ModelAdapterResult, ModelWorkAdapter, ModelWorkInput, ModelWorkStepBinding, ModelWorkStepRunner
from .models import ModelRegistry, ModelSpec
from .permissions import ActionClass, PermissionDecision, PermissionEngine
from .projects import ProjectProfile, ProjectRegistry, WorkMode, default_project_registry
from .providers import ProviderRegistry, ProviderSpec, ProviderStatus, default_provider_registry
from .registry import CapabilityRegistry, ToolSpec, ToolStatus
from .routing import ModelRouteDecision, ModelRouter
from .safety import CommandPolicy
from .work_execution import (
    WorkPlanCheckpoint,
    WorkPlanExecutionResult,
    WorkPlanExecutor,
    WorkStepExecutionEvidence,
    WorkStepExecutionPolicy,
    WorkStepExecutionResult,
    WorkStepRunResult,
    WorkStepRunner,
    WorkStepState,
)
from .work_routing import MultiStepWorkRouter, WorkRoutePlan, WorkRouteStep, WorkStepRequest

__all__ = [
    "ActionClass", "CapabilityRegistry", "CapabilityRequest", "CommandPolicy", "ContextFact",
    "ContinuationBrief", "ContinuationResolver", "LMStudioModelWorkAdapter", "LocalDiscoveryCoordinator",
    "LocalHealthEvidenceLedger", "LocalModelLimits", "LocalModelReadinessBuilder", "LocalModelReadinessRecord",
    "LocalModelReadinessState", "LocalModelRequest", "LocalModelResponse", "LocalModelTransport",
    "LocalProbeError", "LocalProbeFailureKind", "LocalProbeRequest", "LocalProbeResponse", "LocalProbeResult",
    "LocalRuntimeProbe", "LocalRuntimeSnapshotBuilder", "LocalRuntimeStatusSnapshot", "LoopbackModelHTTPTransport",
    "MCPConfigImporter", "MCPEnvironmentResolver", "MCPImportPreview", "MCPInvocationEvidence",
    "MCPInvocationExecutor", "MCPInvocationGuard", "MCPInvocationPlan", "MCPInvocationResult",
    "MCPInvocationTransport", "MCPKeychainSecretSource", "MCP_LEGACY_PROTOCOL_VERSION",
    "MCP_MODERN_PROTOCOL_VERSION", "MCPProcessLaunchPlan", "MCPProcessPolicy", "MCPProcessSnapshot",
    "MCPProcessStartResult", "MCPProcessState", "MCPProcessSupervisor", "MCPProcessTransport",
    "MCPProtocolDecision", "MCPProtocolEra", "MCPProtocolNegotiator", "MCPProtocolProbe",
    "MCPResolvedEnvironmentLease", "MCPSecretSource", "MCPServerDescriptor", "MCPStdioFrameCodec",
    "MCPStdioFrameError", "MCPStdioFrameFailure", "MCPStdioProcessTransport", "MCPStdioShutdownState",
    "MCPStdioTransportSnapshot", "MCPWorkInvocationExecutor", "MCPWorkStepBinding", "MCPWorkStepRunner",
    "ModelAdapterResult", "ModelRegistry", "ModelRouteDecision", "ModelRouter", "ModelSpec", "ModelWorkAdapter",
    "ModelWorkInput", "ModelWorkStepBinding", "ModelWorkStepRunner", "MultiStepWorkRouter",
    "OllamaModelWorkAdapter", "PermissionDecision", "PermissionEngine", "ProbeHealthSummary",
    "ProbeObservation", "ProbeOutcome", "ProjectContextEngine", "ProjectProfile", "ProjectRegistry",
    "PromptCache", "ProviderRegistry", "ProviderSpec", "ProviderStatus", "RouteDecision", "RouteKind",
    "RuntimeProbeState", "RuntimeProbeStatus", "ToolSpec", "ToolStatus", "UnifiedCapabilityRouter", "WorkMode",
    "WorkPlanCheckpoint", "WorkPlanExecutionResult", "WorkPlanExecutor", "WorkRoutePlan", "WorkRouteStep",
    "WorkStepExecutionEvidence", "WorkStepExecutionPolicy", "WorkStepExecutionResult", "WorkStepRequest",
    "WorkStepRunResult", "WorkStepRunner", "WorkStepState", "default_project_registry", "default_provider_registry",
]
