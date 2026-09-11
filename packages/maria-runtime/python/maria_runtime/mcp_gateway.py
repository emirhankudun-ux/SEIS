from __future__ import annotations

from dataclasses import dataclass

from .mcp_config import MCPServerDescriptor
from .permissions import ActionClass
from .registry import ToolSpec, ToolStatus


@dataclass(frozen=True)
class MCPMethodFact:
    capability: str
    action_class: ActionClass

    def __post_init__(self) -> None:
        if not self.capability.strip():
            raise ValueError("MCP method capability is required")
        if not isinstance(self.action_class, ActionClass):
            object.__setattr__(self, "action_class", ActionClass(self.action_class))


@dataclass(frozen=True)
class MCPDiscoveryFact:
    """Redacted evidence collected by an MCP discovery source.

    This object carries health/schema/provenance facts only. It never contains
    credentials and does not launch a process by itself.
    """

    server_name: str
    version: str
    verified: bool
    reachable: bool
    schema_valid: bool
    provenance_verified: bool
    reliability: float
    latency_ms: int
    methods: tuple[MCPMethodFact, ...]

    def __post_init__(self) -> None:
        if not self.server_name.strip() or not self.version.strip():
            raise ValueError("server_name and version are required")
        if not 0.0 <= self.reliability <= 1.0:
            raise ValueError("reliability must be between 0 and 1")
        if self.latency_ms < 0:
            raise ValueError("latency cannot be negative")


@dataclass(frozen=True)
class MCPGatewayEvaluation:
    tool: ToolSpec
    permission_map: dict[str, ActionClass]
    ready_for_approval: bool
    blockers: tuple[str, ...]


class MCPGateway:
    """Pure MCP trust and enablement evaluator.

    The gateway consumes already-redacted discovery facts. It never starts an
    MCP process, resolves a secret, edits config, or performs a tool call.
    Explicit approval is required even for a healthy server before its ToolSpec
    becomes AVAILABLE. Per-method action classes remain available to the
    PermissionEngine for every eventual call.
    """

    def evaluate(
        self,
        descriptor: MCPServerDescriptor,
        fact: MCPDiscoveryFact,
        *,
        approved: bool = False,
    ) -> MCPGatewayEvaluation:
        if descriptor.name != fact.server_name:
            raise ValueError(
                f"MCP discovery fact server mismatch: {fact.server_name!r} != {descriptor.name!r}"
            )

        permission_map = {method.capability: method.action_class for method in fact.methods}
        if len(permission_map) != len(fact.methods):
            raise ValueError("duplicate MCP capability in discovered method schema")

        blockers: list[str] = []
        status = ToolStatus.DISABLED

        if descriptor.requires_review:
            blockers.append("manual-review")
        if not fact.verified:
            blockers.append("discovery-unverified")
        elif not fact.reachable:
            blockers.append("unreachable")
            status = ToolStatus.UNAVAILABLE
        if fact.verified and fact.reachable and not fact.schema_valid:
            blockers.append("schema-invalid")
            status = ToolStatus.INCOMPATIBLE
        if not fact.provenance_verified:
            blockers.append("provenance-unverified")
        if not fact.methods:
            blockers.append("schema-empty")
            status = ToolStatus.INCOMPATIBLE

        trust_blockers = {
            "manual-review",
            "discovery-unverified",
            "unreachable",
            "schema-invalid",
            "provenance-unverified",
            "schema-empty",
        }
        has_trust_blocker = any(blocker in trust_blockers for blocker in blockers)
        ready_for_approval = not has_trust_blocker and not approved

        if not has_trust_blocker:
            if approved:
                status = ToolStatus.AVAILABLE
            else:
                blockers.append("approval-required")
                status = ToolStatus.DISABLED

        capabilities = tuple(permission_map) or (f"mcp.{descriptor.name}.discover",)
        permissions = tuple(sorted({action.value for action in permission_map.values()}))
        tool = ToolSpec(
            name=f"mcp:{descriptor.name}",
            capabilities=capabilities,
            method_rank=2,
            reliability=fact.reliability if fact.verified else 0.0,
            latency_ms=fact.latency_ms,
            cost=0.0,
            status=status,
            version=fact.version if fact.verified else "unverified",
            permissions=permissions,
        )

        return MCPGatewayEvaluation(
            tool=tool,
            permission_map=permission_map,
            ready_for_approval=ready_for_approval,
            blockers=tuple(blockers),
        )
