from __future__ import annotations

from dataclasses import dataclass
import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import CapabilityRequest, RouteDecision, RouteKind
from maria_runtime.mcp_config import MCPConfigImporter
from maria_runtime.mcp_gateway import MCPDiscoveryFact, MCPGateway, MCPMethodFact
from maria_runtime.mcp_invocation import MCPInvocationGuard
from maria_runtime.mcp_work_runner import MCPWorkStepBinding, MCPWorkStepRunner
from maria_runtime.permissions import ActionClass, PermissionEngine
from maria_runtime.work_routing import WorkRouteStep


@dataclass(frozen=True)
class _Evidence:
    failure: str | None = None


@dataclass(frozen=True)
class _InvocationResult:
    success: bool
    result: object | None
    evidence: _Evidence


class _SequenceExecutor:
    def __init__(self, results):
        self._results = list(results)
        self.calls = []

    def execute(self, plan, *, params, request_id, timeout_ms, max_response_bytes):
        self.calls.append({
            "plan": plan,
            "params": dict(params),
            "request_id": request_id,
            "timeout_ms": timeout_ms,
            "max_response_bytes": max_response_bytes,
        })
        if not self._results:
            raise AssertionError("executor called more times than expected")
        return self._results.pop(0)


class MCPWorkStepRunnerTests(unittest.TestCase):
    @staticmethod
    def _evaluation(*, action_class=ActionClass.READ, approved=True):
        descriptor = MCPConfigImporter().preview_json(json.dumps({
            "mcpServers": {
                "fixture": {"command": "/usr/bin/python3", "args": ["fixture.py"]}
            }
        })).servers[0]
        discovery = MCPDiscoveryFact(
            server_name="fixture",
            version="1.0.0-test",
            verified=True,
            reachable=True,
            schema_valid=True,
            provenance_verified=True,
            reliability=1.0,
            latency_ms=1,
            methods=(MCPMethodFact("fixture.inspect", action_class),),
            provenance_id="fixture:test",
        )
        return MCPGateway().evaluate(descriptor, discovery, approved=approved)

    @staticmethod
    def _step():
        request = CapabilityRequest(
            capability="fixture.inspect",
            execution_required=True,
            project="SEIS",
        )
        return WorkRouteStep(
            step_id="inspect",
            request=request,
            route=RouteDecision(
                capability="fixture.inspect",
                kind=RouteKind.TOOL,
                target_name="mcp:fixture",
                project="SEIS",
            ),
            depends_on=(),
        )

    def test_each_retry_gets_a_fresh_invocation_plan_and_correlated_request_id(self):
        nonces = iter(("plan-one", "plan-two"))
        request_ids = iter(("request-one", "request-two"))
        guard = MCPInvocationGuard(
            PermissionEngine(),
            clock=lambda: 10.0,
            nonce_factory=lambda: next(nonces),
        )
        executor = _SequenceExecutor((
            _InvocationResult(False, None, _Evidence("transport-failure")),
            _InvocationResult(True, {"ok": True}, _Evidence()),
        ))
        runner = MCPWorkStepRunner(
            guard=guard,
            executor=executor,
            bindings={
                "inspect": MCPWorkStepBinding(
                    evaluation=self._evaluation(),
                    target="SEIS:fixture",
                    params_factory=lambda _dependencies: {"scope": "repo"},
                    idempotency_parameter="request_key",
                )
            },
            request_id_factory=lambda: next(request_ids),
        )

        first = runner.run(
            self._step(),
            dependency_results={},
            attempt=1,
            idempotency_key="stable-work-key",
        )
        second = runner.run(
            self._step(),
            dependency_results={},
            attempt=2,
            idempotency_key="stable-work-key",
        )

        self.assertFalse(first.succeeded)
        self.assertTrue(first.retryable)
        self.assertEqual(first.failure_category, "transport-failure")
        self.assertTrue(second.succeeded)
        self.assertEqual(second.result, {"ok": True})
        self.assertEqual(
            [call["plan"].plan_id for call in executor.calls],
            ["plan-one", "plan-two"],
        )
        self.assertEqual(
            [call["request_id"] for call in executor.calls],
            ["request-one", "request-two"],
        )
        self.assertEqual(
            {call["params"]["request_key"] for call in executor.calls},
            {"stable-work-key"},
        )

    def test_permission_denial_is_normalized_before_executor_call(self):
        executor = _SequenceExecutor(())
        runner = MCPWorkStepRunner(
            guard=MCPInvocationGuard(PermissionEngine(), clock=lambda: 10.0),
            executor=executor,
            bindings={
                "inspect": MCPWorkStepBinding(
                    evaluation=self._evaluation(action_class=ActionClass.MODIFY),
                    target="SEIS:fixture",
                    params_factory=lambda _dependencies: {},
                    approved=False,
                    reversible=True,
                )
            },
        )

        result = runner.run(
            self._step(),
            dependency_results={},
            attempt=1,
            idempotency_key=None,
        )

        self.assertFalse(result.succeeded)
        self.assertFalse(result.retryable)
        self.assertEqual(result.failure_category, "permission-denied")
        self.assertEqual(executor.calls, [])

    def test_retry_key_must_be_injected_into_tool_params_or_retry_fails_closed(self):
        executor = _SequenceExecutor(())
        runner = MCPWorkStepRunner(
            guard=MCPInvocationGuard(PermissionEngine(), clock=lambda: 10.0),
            executor=executor,
            bindings={
                "inspect": MCPWorkStepBinding(
                    evaluation=self._evaluation(),
                    target="SEIS:fixture",
                    params_factory=lambda _dependencies: {"scope": "repo"},
                )
            },
        )

        with self.assertRaises(ValueError):
            runner.run(
                self._step(),
                dependency_results={},
                attempt=2,
                idempotency_key="stable-work-key",
            )
        self.assertEqual(executor.calls, [])

    def test_binding_identity_and_capability_must_match_routed_step(self):
        executor = _SequenceExecutor(())
        other = self._evaluation()
        runner = MCPWorkStepRunner(
            guard=MCPInvocationGuard(PermissionEngine(), clock=lambda: 10.0),
            executor=executor,
            bindings={
                "inspect": MCPWorkStepBinding(
                    evaluation=other,
                    target="SEIS:fixture",
                    params_factory=lambda _dependencies: {},
                )
            },
        )
        bad_step = WorkRouteStep(
            step_id="inspect",
            request=CapabilityRequest(
                capability="fixture.inspect",
                execution_required=True,
                project="SEIS",
            ),
            route=RouteDecision(
                capability="fixture.inspect",
                kind=RouteKind.TOOL,
                target_name="mcp:other",
                project="SEIS",
            ),
            depends_on=(),
        )

        with self.assertRaises(PermissionError):
            runner.run(
                bad_step,
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )
        self.assertEqual(executor.calls, [])

    def test_unknown_step_binding_fails_closed(self):
        runner = MCPWorkStepRunner(
            guard=MCPInvocationGuard(PermissionEngine(), clock=lambda: 10.0),
            executor=_SequenceExecutor(()),
            bindings={},
        )
        with self.assertRaises(LookupError):
            runner.run(
                self._step(),
                dependency_results={},
                attempt=1,
                idempotency_key=None,
            )


if __name__ == "__main__":
    unittest.main()
