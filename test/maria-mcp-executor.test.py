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


class _FailingTransport(_FakeTransport):
    def request(self, **kwargs):
        self.calls.append(kwargs)
        raise RuntimeError("sensitive transport details must not escape")


class MCPInvocationExecutorTests(unittest.TestCase):
    @staticmethod
    def _plan(
        *,
        ready=True,
        allowed=True,
        tool_name="mcp:unreal",
        capability="unreal.inspect_actors",
        plan_id="plan-1",
        issued_at_monotonic=100.0,
        expires_at_monotonic=130.0,
    ):
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
            plan_id=plan_id,
            issued_at_monotonic=issued_at_monotonic,
            expires_at_monotonic=expires_at_monotonic,
        )

    @staticmethod
    def _executor(transport, *, now=110.0):
        return MCPInvocationExecutor(transport, clock=lambda: now)

    def test_executes_only_ready_allowed_plan_on_matching_healthy_transport(self):
        transport = _FakeTransport()
        executor = self._executor(transport)

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
            executor = self._executor(transport)
            with self.assertRaises(PermissionError):
                executor.execute(plan, params={}, request_id="blocked")
            self.assertEqual(transport.calls, [])

    def test_rejects_transport_server_mismatch_or_unhealthy_child(self):
        mismatched = _FakeTransport(server_name="blender")
        with self.assertRaises(PermissionError):
            self._executor(mismatched).execute(
                self._plan(), params={}, request_id="mismatch"
            )
        self.assertEqual(mismatched.calls, [])

        stopped = _FakeTransport(running=False)
        with self.assertRaises(RuntimeError):
            self._executor(stopped).execute(
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
        result = self._executor(transport).execute(
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
            self._executor(_BadIdTransport()).execute(
                self._plan(), params={}, request_id="expected"
            )

        class _BadVersionTransport(_FakeTransport):
            def request(self, **kwargs):
                self.calls.append(kwargs)
                return {"jsonrpc": "1.0", "id": kwargs["request_id"], "result": {}}

        with self.assertRaises(ValueError):
            self._executor(_BadVersionTransport()).execute(
                self._plan(), params={}, request_id="expected"
            )

    def test_expired_plan_is_rejected_before_transport_call(self):
        transport = _FakeTransport()
        executor = self._executor(transport, now=131.0)

        with self.assertRaises(PermissionError):
            executor.execute(self._plan(), params={}, request_id="expired")

        self.assertEqual(transport.calls, [])

    def test_plan_is_single_use_and_replay_is_rejected(self):
        transport = _FakeTransport()
        executor = self._executor(transport)
        plan = self._plan(plan_id="single-use")

        first = executor.execute(plan, params={}, request_id="first")
        self.assertTrue(first.success)

        with self.assertRaises(PermissionError):
            executor.execute(plan, params={}, request_id="replay")

        self.assertEqual(len(transport.calls), 1)

    def test_transport_attempt_consumes_plan_even_when_transport_fails(self):
        transport = _FailingTransport()
        executor = self._executor(transport)
        plan = self._plan(plan_id="attempt-once")

        first = executor.execute(plan, params={}, request_id="first")
        self.assertFalse(first.success)
        self.assertEqual(first.evidence.failure, "transport-failure")

        with self.assertRaises(PermissionError):
            executor.execute(plan, params={}, request_id="retry")

        self.assertEqual(len(transport.calls), 1)

    def test_rejects_forged_overlong_or_future_plan(self):
        transport = _FakeTransport()
        executor = self._executor(transport, now=110.0)

        with self.assertRaises(PermissionError):
            executor.execute(
                self._plan(issued_at_monotonic=100.0, expires_at_monotonic=1_000.0),
                params={},
                request_id="overlong",
            )

        with self.assertRaises(PermissionError):
            executor.execute(
                self._plan(issued_at_monotonic=120.0, expires_at_monotonic=130.0),
                params={},
                request_id="future",
            )

        self.assertEqual(transport.calls, [])


if __name__ == "__main__":
    unittest.main()
