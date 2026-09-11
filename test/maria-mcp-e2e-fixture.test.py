from __future__ import annotations

import json
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_config import MCPConfigImporter
from maria_runtime.mcp_executor import MCPInvocationExecutor
from maria_runtime.mcp_gateway import MCPDiscoveryFact, MCPGateway, MCPMethodFact
from maria_runtime.mcp_invocation import MCPInvocationGuard
from maria_runtime.mcp_protocol import MCPProtocolNegotiator
from maria_runtime.mcp_stdio_transport import MCPStdioProcessTransport
from maria_runtime.mcp_supervisor import MCPProcessPolicy, MCPProcessState, MCPProcessSupervisor
from maria_runtime.permissions import ActionClass, PermissionEngine


class MCPFixtureEndToEndTests(unittest.TestCase):
    def test_reviewed_fixture_runs_through_supervisor_permission_and_executor(self):
        fixture = ROOT / "test" / "fixtures" / "mcp_fixture_server.py"
        descriptor = MCPConfigImporter().preview_json(json.dumps({
            "mcpServers": {
                "fixture": {
                    "command": sys.executable,
                    "args": [str(fixture)],
                }
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
            methods=(MCPMethodFact("fixture.echo", ActionClass.READ),),
            provenance_id="fixture:repo-test-v1",
        )
        evaluation = MCPGateway().evaluate(descriptor, discovery, approved=True)

        transport = MCPStdioProcessTransport(
            negotiator=MCPProtocolNegotiator(
                client_name="SEIS-Test",
                client_version="0.1.0",
                discovery_timeout_ms=750,
            ),
            shutdown_timeout_ms=250,
            terminate_timeout_ms=250,
            kill_timeout_ms=250,
        )
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=(sys.executable,),
                allowed_provenance_ids=("fixture:repo-test-v1",),
                startup_timeout_ms=2_000,
                max_stdout_bytes=16_384,
                max_stderr_bytes=4_096,
                max_attempts=1,
            ),
            transport=transport,
        )

        try:
            startup = supervisor.start(descriptor, evaluation)
            self.assertEqual(startup.state, MCPProcessState.READY)
            self.assertTrue(transport.snapshot().running)

            plan = MCPInvocationGuard(PermissionEngine()).plan(
                evaluation,
                capability="fixture.echo",
                target="test:harmless-echo",
            )
            result = MCPInvocationExecutor(transport).execute(
                plan,
                params={"value": "hello-seis"},
                request_id="fixture-call-1",
                timeout_ms=750,
                max_response_bytes=4_096,
            )

            self.assertTrue(result.success)
            self.assertEqual(result.result, {"echo": "hello-seis"})
            self.assertEqual(result.evidence.tool_name, "mcp:fixture")
            self.assertNotIn("hello-seis", repr(result.evidence))
        finally:
            transport.shutdown()

        self.assertFalse(transport.snapshot().running)


if __name__ == "__main__":
    unittest.main()
