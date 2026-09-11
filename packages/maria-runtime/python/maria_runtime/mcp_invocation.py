from __future__ import annotations

from dataclasses import dataclass
import secrets
import time
from typing import Callable, Optional

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
    plan_id: str
    issued_at_monotonic: float
    expires_at_monotonic: float


class MCPInvocationGuard:
    """Prepare one short-lived MCP call after a fresh permission check.

    The resulting plan is an in-memory capability token. It is intentionally
    bounded by a monotonic-time expiry and a high-entropy plan identifier so a
    downstream executor can reject stale or replayed approvals. Plans are not
    durable authorization records and should never be persisted/reused across
    process lifetimes.

    This class does not launch a process or execute a method. It is the final
    policy guard an executor must call for each invocation, even when the MCP
    server itself was previously approved and enabled.
    """

    DEFAULT_TTL_SECONDS = 30.0
    MAX_TTL_SECONDS = 300.0

    def __init__(
        self,
        permissions: PermissionEngine,
        *,
        clock: Callable[[], float] = time.monotonic,
        nonce_factory: Callable[[], str] | None = None,
        ttl_seconds: float = DEFAULT_TTL_SECONDS,
    ) -> None:
        if not 0 < ttl_seconds <= self.MAX_TTL_SECONDS:
            raise ValueError(
                f"ttl_seconds must be > 0 and <= {self.MAX_TTL_SECONDS:g}"
            )
        self.permissions = permissions
        self._clock = clock
        self._nonce_factory = nonce_factory or (lambda: secrets.token_hex(16))
        self._ttl_seconds = float(ttl_seconds)

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
        issued_at = float(self._clock())
        if issued_at < 0:
            raise RuntimeError("monotonic clock returned an invalid value")
        plan_id = self._nonce_factory()
        if not isinstance(plan_id, str) or not plan_id.strip():
            raise RuntimeError("nonce factory returned an invalid plan identifier")

        return MCPInvocationPlan(
            tool_name=evaluation.tool.name,
            capability=capability,
            action_class=action_class,
            permission=permission,
            ready=permission.allowed,
            plan_id=plan_id,
            issued_at_monotonic=issued_at,
            expires_at_monotonic=issued_at + self._ttl_seconds,
        )
