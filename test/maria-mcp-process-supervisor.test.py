from __future__ import annotations

import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_config import MCPConfigImporter
from maria_runtime.mcp_gateway import MCPDiscoveryFact, MCPGateway, MCPMethodFact
from maria_runtime.mcp_supervisor import (
    MCPProcessPolicy,
    MCPProcessStartResult,
    MCPProcessState,
    MCPProcessSupervisor,
)
from maria_runtime.permissions import ActionClass


class FakeTransport:
    def __init__(self, results):
        self.results = list(results)
        self.plans = []

    def start(self, plan):
        self.plans.append(plan)
        result = self.results.pop(0)
        if isinstance(result, BaseException):
            raise result
        return result


def approved_evaluation(*, command="node", args=("server.mjs",), provenance_id="sha256:trusted"):
    preview = MCPConfigImporter().preview_json(json.dumps({
        "mcpServers": {
            "seis": {"command": command, "args": list(args)}
        }
    }))
    descriptor = preview.servers[0]
    fact = MCPDiscoveryFact(
        server_name="seis",
        version="1.2.3",
        verified=True,
        reachable=True,
        schema_valid=True,
        provenance_verified=True,
        reliability=0.98,
        latency_ms=40,
        methods=(MCPMethodFact("seis.status", ActionClass.READ),),
        provenance_id=provenance_id,
    )
    evaluation = MCPGateway().evaluate(descriptor, fact, approved=True)
    return descriptor, evaluation


class MCPProcessSupervisorTests(unittest.TestCase):
    def test_starts_only_from_approved_gateway_evaluation_and_exact_allowlists(self):
        descriptor, evaluation = approved_evaluation()
        transport = FakeTransport((MCPProcessStartResult(
            started=True,
            ready=True,
            schema_valid=True,
            startup_latency_ms=55,
            stdout_bytes=128,
            stderr_bytes=0,
        ),))
        policy = MCPProcessPolicy(
            allowed_commands=("node",),
            allowed_provenance_ids=("sha256:trusted",),
            startup_timeout_ms=2_000,
            max_stdout_bytes=4_096,
            max_stderr_bytes=2_048,
        )
        supervisor = MCPProcessSupervisor(policy=policy, transport=transport)

        snapshot = supervisor.start(descriptor, evaluation)

        self.assertEqual(snapshot.state, MCPProcessState.READY)
        self.assertEqual(snapshot.attempt_count, 1)
        self.assertEqual(snapshot.consecutive_failures, 0)
        self.assertEqual(snapshot.blockers, ())
        self.assertEqual(len(transport.plans), 1)
        plan = transport.plans[0]
        self.assertEqual(plan.argv, ("node", "server.mjs"))
        self.assertEqual(plan.server_name, "seis")
        self.assertEqual(plan.provenance_id, "sha256:trusted")
        self.assertEqual(plan.startup_timeout_ms, 2_000)
        self.assertEqual(plan.max_stdout_bytes, 4_096)
        self.assertEqual(plan.max_stderr_bytes, 2_048)
        self.assertFalse(hasattr(plan, "env"))

    def test_blocks_unapproved_or_untrusted_gateway_state_without_touching_transport(self):
        descriptor, evaluation = approved_evaluation()
        pending_fact = MCPDiscoveryFact(
            server_name="seis",
            version="1.2.3",
            verified=True,
            reachable=True,
            schema_valid=True,
            provenance_verified=True,
            reliability=0.98,
            latency_ms=40,
            methods=(MCPMethodFact("seis.status", ActionClass.READ),),
            provenance_id="sha256:trusted",
        )
        pending = MCPGateway().evaluate(descriptor, pending_fact, approved=False)
        transport = FakeTransport(())
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("node",),
                allowed_provenance_ids=("sha256:trusted",),
            ),
            transport=transport,
        )

        snapshot = supervisor.start(descriptor, pending)

        self.assertEqual(snapshot.state, MCPProcessState.BLOCKED)
        self.assertIn("gateway-not-approved", snapshot.blockers)
        self.assertEqual(transport.plans, [])

    def test_blocks_dynamic_package_manager_launch_and_unresolved_environment_by_default(self):
        descriptor, evaluation = approved_evaluation(command="npx", args=("-y", "some-mcp"))
        transport = FakeTransport(())
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("npx",),
                allowed_provenance_ids=("sha256:trusted",),
            ),
            transport=transport,
        )
        snapshot = supervisor.start(descriptor, evaluation)
        self.assertEqual(snapshot.state, MCPProcessState.BLOCKED)
        self.assertIn("dynamic-package-manager-disabled", snapshot.blockers)

        env_preview = MCPConfigImporter().preview_json(json.dumps({
            "mcpServers": {
                "seis": {"command": "node", "args": ["server.mjs"], "env": {"LOG_LEVEL": "info"}}
            }
        }))
        env_descriptor = env_preview.servers[0]
        env_fact = MCPDiscoveryFact(
            server_name="seis",
            version="1.2.3",
            verified=True,
            reachable=True,
            schema_valid=True,
            provenance_verified=True,
            reliability=0.98,
            latency_ms=40,
            methods=(MCPMethodFact("seis.status", ActionClass.READ),),
            provenance_id="sha256:trusted",
        )
        env_evaluation = MCPGateway().evaluate(env_descriptor, env_fact, approved=True)
        env_snapshot = supervisor.start(env_descriptor, env_evaluation)
        self.assertEqual(env_snapshot.state, MCPProcessState.BLOCKED)
        self.assertIn("environment-resolution-required", env_snapshot.blockers)
        self.assertEqual(transport.plans, [])

    def test_output_and_schema_limits_fail_closed_without_retaining_raw_output(self):
        descriptor, evaluation = approved_evaluation()
        transport = FakeTransport((MCPProcessStartResult(
            started=True,
            ready=True,
            schema_valid=False,
            startup_latency_ms=50,
            stdout_bytes=50_000,
            stderr_bytes=0,
        ),))
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("node",),
                allowed_provenance_ids=("sha256:trusted",),
                max_stdout_bytes=1_024,
                circuit_failure_threshold=3,
            ),
            transport=transport,
        )

        snapshot = supervisor.start(descriptor, evaluation)

        self.assertEqual(snapshot.state, MCPProcessState.DEGRADED)
        self.assertIn("schema-invalid", snapshot.blockers)
        self.assertIn("stdout-limit-exceeded", snapshot.blockers)
        self.assertEqual(snapshot.consecutive_failures, 1)
        rendered = repr(snapshot).lower()
        self.assertNotIn("stdout", rendered.replace("stdout-limit-exceeded", ""))
        self.assertNotIn("secret", rendered)

    def test_circuit_breaker_opens_after_bounded_failures_and_requires_explicit_reset(self):
        descriptor, evaluation = approved_evaluation()
        transport = FakeTransport((RuntimeError("sensitive raw transport failure"), RuntimeError("again")))
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("node",),
                allowed_provenance_ids=("sha256:trusted",),
                circuit_failure_threshold=2,
                max_attempts=3,
            ),
            transport=transport,
        )

        first = supervisor.start(descriptor, evaluation)
        self.assertEqual(first.state, MCPProcessState.DEGRADED)
        self.assertEqual(first.consecutive_failures, 1)
        self.assertNotIn("sensitive raw transport failure", repr(first))

        second = supervisor.start(descriptor, evaluation)
        self.assertEqual(second.state, MCPProcessState.CIRCUIT_OPEN)
        self.assertEqual(second.consecutive_failures, 2)

        blocked = supervisor.start(descriptor, evaluation)
        self.assertEqual(blocked.state, MCPProcessState.CIRCUIT_OPEN)
        self.assertIn("circuit-open", blocked.blockers)
        self.assertEqual(len(transport.plans), 2)

        with self.assertRaises(PermissionError):
            supervisor.reset_circuit(approved=False)
        reset = supervisor.reset_circuit(approved=True)
        self.assertEqual(reset.state, MCPProcessState.STOPPED)
        self.assertEqual(reset.consecutive_failures, 0)


if __name__ == "__main__":
    unittest.main()
