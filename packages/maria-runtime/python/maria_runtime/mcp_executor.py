from __future__ import annotations

from dataclasses import dataclass
import json
import math
import threading
import time
from typing import Any, Callable, Mapping, Protocol

from .mcp_invocation import MCPInvocationPlan
from .permissions import ActionClass


class MCPInvocationTransport(Protocol):
    """Minimal transport contract required by the invocation executor."""

    def snapshot(self) -> Any:
        ...

    def request(
        self,
        *,
        method: str,
        params: Mapping[str, Any],
        request_id: str | int,
        timeout_ms: int,
        max_response_bytes: int,
    ) -> Mapping[str, Any]:
        ...


@dataclass(frozen=True)
class MCPInvocationEvidence:
    """Redacted execution evidence.

    Tool output, parameters, permission targets, server error messages and raw
    JSON-RPC payloads are intentionally excluded. This object is safe to retain
    as lifecycle/audit evidence without turning logs into a secret store.
    """

    tool_name: str
    capability: str
    action_class: ActionClass
    permission_allowed: bool
    request_id: str | int
    success: bool
    response_bytes: int
    duration_ms: int
    failure: str | None = None
    error_code: int | None = None


@dataclass(frozen=True)
class MCPInvocationResult:
    success: bool
    result: Any | None
    evidence: MCPInvocationEvidence


class MCPInvocationExecutor:
    """Execute one fresh, single-use MCP invocation through a healthy transport.

    This is intentionally downstream of ``MCPInvocationGuard``. The executor
    treats a ready plan as a short-lived capability token for exactly one
    transport attempt and checks its internal permission invariants again before
    touching the transport. It also binds the plan's ``mcp:<server>`` identity
    to the currently running child.

    A plan is consumed immediately before the transport request. Transport
    failures, JSON-RPC errors and malformed responses therefore never make the
    same authorization reusable. Callers that want to retry must obtain a fresh
    permission decision and invocation plan.
    """

    MAX_PLAN_TTL_SECONDS = 300.0

    def __init__(
        self,
        transport: MCPInvocationTransport,
        *,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._transport = transport
        self._clock = clock
        self._claim_lock = threading.Lock()
        # Keep only unexpired consumed identifiers. This bounds replay state by
        # the maximum authorization lifetime rather than process lifetime.
        self._consumed_until: dict[str, float] = {}

    def execute(
        self,
        plan: MCPInvocationPlan,
        *,
        params: Mapping[str, Any],
        request_id: str | int,
        timeout_ms: int = 5_000,
        max_response_bytes: int = 64 * 1024,
    ) -> MCPInvocationResult:
        self._validate_plan(plan)
        now = self._validate_lifecycle(plan)
        self._validate_request(params, request_id, timeout_ms, max_response_bytes)
        self._validate_transport(plan)
        self._claim_plan(plan, now=now)

        started_at = time.monotonic()
        try:
            response = self._transport.request(
                method=plan.capability,
                params=dict(params),
                request_id=request_id,
                timeout_ms=timeout_ms,
                max_response_bytes=max_response_bytes,
            )
        except Exception:
            # Do not capture exception text: transports may include server output,
            # paths, credentials or other sensitive implementation details.
            evidence = self._evidence(
                plan,
                request_id=request_id,
                started_at=started_at,
                success=False,
                response_bytes=0,
                failure="transport-failure",
            )
            return MCPInvocationResult(success=False, result=None, evidence=evidence)

        if not isinstance(response, Mapping):
            raise ValueError("MCP response must be a JSON object")
        if response.get("jsonrpc") != "2.0":
            raise ValueError("MCP response has invalid jsonrpc version")
        if response.get("id") != request_id:
            raise ValueError("MCP response id does not match request id")

        response_bytes = self._measure_response(response)
        if response_bytes > max_response_bytes:
            raise ValueError("MCP response exceeds configured byte limit")

        error = response.get("error")
        if isinstance(error, Mapping):
            code = error.get("code")
            error_code = code if isinstance(code, int) and not isinstance(code, bool) else None
            evidence = self._evidence(
                plan,
                request_id=request_id,
                started_at=started_at,
                success=False,
                response_bytes=response_bytes,
                failure="jsonrpc-error",
                error_code=error_code,
            )
            return MCPInvocationResult(success=False, result=None, evidence=evidence)

        if "result" not in response:
            raise ValueError("MCP response must contain result or error")

        evidence = self._evidence(
            plan,
            request_id=request_id,
            started_at=started_at,
            success=True,
            response_bytes=response_bytes,
        )
        return MCPInvocationResult(
            success=True,
            result=response.get("result"),
            evidence=evidence,
        )

    @staticmethod
    def _validate_plan(plan: MCPInvocationPlan) -> None:
        if not isinstance(plan, MCPInvocationPlan):
            raise TypeError("plan must be MCPInvocationPlan")
        if not plan.ready or not plan.permission.allowed:
            raise PermissionError("MCP invocation plan is not ready and allowed")
        if plan.permission.action_class is not plan.action_class:
            raise PermissionError("MCP invocation permission/action class mismatch")
        if not plan.tool_name.startswith("mcp:") or not plan.tool_name.removeprefix("mcp:").strip():
            raise PermissionError("MCP invocation plan has invalid tool identity")
        if not plan.capability.strip():
            raise ValueError("MCP capability must be non-empty")
        if not plan.permission.target.strip():
            raise PermissionError("MCP invocation permission target is empty")

    def _validate_lifecycle(self, plan: MCPInvocationPlan) -> float:
        if not isinstance(plan.plan_id, str) or not plan.plan_id.strip():
            raise PermissionError("MCP invocation plan has invalid lifecycle identity")

        issued = plan.issued_at_monotonic
        expires = plan.expires_at_monotonic
        for value in (issued, expires):
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise PermissionError("MCP invocation plan has invalid lifecycle timestamp")
            if not math.isfinite(float(value)):
                raise PermissionError("MCP invocation plan has invalid lifecycle timestamp")

        issued = float(issued)
        expires = float(expires)
        ttl = expires - issued
        if issued < 0 or ttl <= 0 or ttl > self.MAX_PLAN_TTL_SECONDS:
            raise PermissionError("MCP invocation plan lifetime is invalid")

        now = float(self._clock())
        if not math.isfinite(now) or now < 0:
            raise RuntimeError("monotonic clock returned an invalid value")
        if issued > now:
            raise PermissionError("MCP invocation plan was issued in the future")
        if expires <= now:
            raise PermissionError("MCP invocation plan has expired")
        return now

    @staticmethod
    def _validate_request(
        params: Mapping[str, Any],
        request_id: str | int,
        timeout_ms: int,
        max_response_bytes: int,
    ) -> None:
        if not isinstance(params, Mapping):
            raise TypeError("MCP params must be a mapping")
        if isinstance(request_id, str) and not request_id.strip():
            raise ValueError("request_id must be non-empty")
        if not isinstance(request_id, (str, int)) or isinstance(request_id, bool):
            raise TypeError("request_id must be a string or integer")
        if timeout_ms <= 0:
            raise ValueError("timeout_ms must be positive")
        if max_response_bytes <= 0:
            raise ValueError("max_response_bytes must be positive")

    def _validate_transport(self, plan: MCPInvocationPlan) -> None:
        snapshot = self._transport.snapshot()
        expected_server = plan.tool_name.removeprefix("mcp:")
        actual_server = getattr(snapshot, "server_name", None)
        if actual_server != expected_server:
            raise PermissionError("MCP invocation transport/server identity mismatch")
        if not bool(getattr(snapshot, "running", False)):
            raise RuntimeError("MCP invocation transport is not running")
        if getattr(snapshot, "failure", None) is not None:
            raise RuntimeError("MCP invocation transport has unresolved failure evidence")

    def _claim_plan(self, plan: MCPInvocationPlan, *, now: float) -> None:
        with self._claim_lock:
            stale = [
                plan_id
                for plan_id, expires_at in self._consumed_until.items()
                if expires_at <= now
            ]
            for plan_id in stale:
                del self._consumed_until[plan_id]

            if plan.plan_id in self._consumed_until:
                raise PermissionError("MCP invocation plan has already been consumed")
            self._consumed_until[plan.plan_id] = float(plan.expires_at_monotonic)

    @staticmethod
    def _measure_response(response: Mapping[str, Any]) -> int:
        try:
            rendered = json.dumps(
                dict(response),
                ensure_ascii=False,
                separators=(",", ":"),
                allow_nan=False,
            )
        except (TypeError, ValueError):
            raise ValueError("MCP response is not JSON serializable") from None
        return len(rendered.encode("utf-8"))

    @staticmethod
    def _evidence(
        plan: MCPInvocationPlan,
        *,
        request_id: str | int,
        started_at: float,
        success: bool,
        response_bytes: int,
        failure: str | None = None,
        error_code: int | None = None,
    ) -> MCPInvocationEvidence:
        duration_ms = max(0, int((time.monotonic() - started_at) * 1000))
        return MCPInvocationEvidence(
            tool_name=plan.tool_name,
            capability=plan.capability,
            action_class=plan.action_class,
            permission_allowed=plan.permission.allowed,
            request_id=request_id,
            success=success,
            response_bytes=response_bytes,
            duration_ms=duration_ms,
            failure=failure,
            error_code=error_code,
        )
