from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .mcp_gateway import MCPGatewayEvaluation
from .permissions import ActionClass, PermissionDecision, PermissionEngine
from .registry import ToolStatus


@dataclass(frozen=True)
class MCPInvocationPlan:
    tool_name: str
    capability: str
    action_class: ActionClass
    permission: PermissionDecision
    ready: bool


class MCPInvocationGuard:
    """Prepare an MCP call only after a fresh permission check.

    This class does not launch a process or execute a method. It is the final
    policy guard a future executor must call for each invocation, even when the
    MCP server itself was previously approved and enabled.
    """

    def __init__(self, permissions: PermissionEngine) -> None:
        self.permissions = permissions

    def plan(
        self,
        evaluation: MCPGatewayEvaluation,
        *,
        capability: str,
        target: str,
        approved: bool = False,
        reversible: Optional[bool] = None,
    ) -> MCPInvocationPlan:
        if evaluation.tool.status is not ToolStatus.AVAILABLE:
            raise PermissionError("MCP server is not enabled for invocation")

        action_class = evaluation.permission_map.get(capability)
        if action_class is None:
            raise LookupError(f"MCP capability was not discovered: {capability}")

        permission = self.permissions.evaluate(
            action_class,
            target=target,
            approved=approved,
            reversible=reversible,
        )
        return MCPInvocationPlan(
            tool_name=evaluation.tool.name,
            capability=capability,
            action_class=action_class,
            permission=permission,
            ready=permission.allowed,
        )
