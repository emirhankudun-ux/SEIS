from __future__ import annotations

from dataclasses import dataclass
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_executor import MCPInvocationExecutor
from maria_runtime.mcp_invocation import MCPInvocationPlan
from maria_runtime.permissions import ActionClass, PermissionDecision


@dataclass(frozen=True)
class _TransportSnapshot:
    server_name: str
    running: bool = True
    failure: str | None = None


class _FakeTransport:
    def __init__(self, *, server_name: str = "unreal", response=None, running: bool = True) -> None:
        self._snapshot = _TransportSnapshot(server_name=server_name, running=running)
        self.response = response or {
            "jsonrpc": "2.0",
            "id": "invoke-1",
            "result": {"actors": 12, "raw_marker": "RAW_TOOL_RESULT_123"},
        }
        self.calls = []

    def snapshot(self):
        return self._snapshot

    def request(self, *, method, params, request_id, timeout_ms, max_response_bytes):
        self.calls.append({
            "method": method,
            "params": params,
            "request_id": request_id,
            "timeout_ms": timeout_ms,
            "max_response_bytes": max_response_bytes,
        })
        response = dict(self.response)
        response["id"] = request_id
        return response


class MCPInvocationExecutorTests(unittest.TestCase):
    @staticmethod
    def _plan(*, ready=True, allowed=True, tool_name="mcp:unreal", capability="unreal.inspect_actors"):
        permission = PermissionDecision(
            action_class=ActionClass.READ,
            target="Deadly Evil:actors",
            allowed=allowed,
            requires_approval=False,
            reason="policy allows low-risk action",
            reversible=None,
        )
        return MCPInvocationPlan(
            tool_name=tool_name,
            capability=capability,
            action_class=ActionClass.READ,
            permission=permission,
            ready=ready,
        )

    def test_executes_only_ready_allowed_plan_on_matching_healthy_transport(self):
        transport = _FakeTransport()
        executor = MCPInvocationExecutor(transport)

        result = executor.execute(
            self._plan(),
            params={"level": "/Game/Maps/Hotel"},
            request_id="invoke-1",
            timeout_ms=800,
            max_response_bytes=16_384,
        )

        self.assertTrue(result.success)
        self.assertEqual(
            result.result,
            {"actors": 12, "raw_marker": "RAW_TOOL_RESULT_123"},
        )
        self.assertEqual(len(transport.calls), 1)
        self.assertEqual(transport.calls[0]["method"], "unreal.inspect_actors")
        self.assertEqual(result.evidence.tool_name, "mcp:unreal")
        self.assertEqual(result.evidence.action_class, ActionClass.READ)
        self.assertTrue(result.evidence.permission_allowed)
        self.assertEqual(result.evidence.failure, None)
        self.assertNotIn("RAW_TOOL_RESULT_123", repr(result.evidence))

    def test_rejects_not_ready_or_permission_inconsistent_plan_before_transport_call(self):
        for plan in (
            self._plan(ready=False),
            self._plan(allowed=False),
        ):
            transport = _FakeTransport()
            executor = MCPInvocationExecutor(transport)
            with self.assertRaises(PermissionError):
                executor.execute(plan, params={}, request_id="blocked")
            self.assertEqual(transport.calls, [])

    def test_rejects_transport_server_mismatch_or_unhealthy_child(self):
        mismatched = _FakeTransport(server_name="blender")
        with self.assertRaises(PermissionError):
            MCPInvocationExecutor(mismatched).execute(
                self._plan(), params={}, request_id="mismatch"
            )
        self.assertEqual(mismatched.calls, [])

        stopped = _FakeTransport(running=False)
        with self.assertRaises(RuntimeError):
            MCPInvocationExecutor(stopped).execute(
                self._plan(), params={}, request_id="stopped"
            )
        self.assertEqual(stopped.calls, [])

    def test_json_rpc_error_is_returned_as_redacted_failure_evidence(self):
        secret = "SERVER_SECRET_SHOULD_NOT_APPEAR"
        transport = _FakeTransport(response={
            "jsonrpc": "2.0",
            "id": "invoke-1",
            "error": {"code": -32000, "message": secret, "data": {"secret": secret}},
        })
        result = MCPInvocationExecutor(transport).execute(
            self._plan(), params={}, request_id="invoke-1"
        )

        self.assertFalse(result.success)
        self.assertIsNone(result.result)
        self.assertEqual(result.evidence.failure, "jsonrpc-error")
        self.assertEqual(result.evidence.error_code, -32000)
        self.assertNotIn(secret, repr(result.evidence))
        self.assertNotIn(secret, repr(result))

    def test_rejects_response_id_or_jsonrpc_mismatch(self):
        class _BadIdTransport(_FakeTransport):
            def request(self, **kwargs):
                self.calls.append(kwargs)
                return {"jsonrpc": "2.0", "id": "wrong", "result": {}}

        with self.assertRaises(ValueError):
            MCPInvocationExecutor(_BadIdTransport()).execute(
                self._plan(), params={}, request_id="expected"
            )

        class _BadVersionTransport(_FakeTransport):
            def request(self, **kwargs):
                self.calls.append(kwargs)
                return {"jsonrpc": "1.0", "id": kwargs["request_id"], "result": {}}

        with self.assertRaises(ValueError):
            MCPInvocationExecutor(_BadVersionTransport()).execute(
                self._plan(), params={}, request_id="expected"
            )


if __name__ == "__main__":
    unittest.main()
