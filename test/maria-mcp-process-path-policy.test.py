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
    def __init__(self):
        self.plans = []

    def start(self, plan):
        self.plans.append(plan)
        return MCPProcessStartResult(
            started=True,
            ready=True,
            schema_valid=True,
            startup_latency_ms=10,
            stdout_bytes=0,
            stderr_bytes=0,
        )


def approved(command: str):
    descriptor = MCPConfigImporter().preview_json(json.dumps({
        "mcpServers": {"seis": {"command": command, "args": ["server.mjs"]}}
    })).servers[0]
    fact = MCPDiscoveryFact(
        server_name="seis",
        version="1.0.0",
        verified=True,
        reachable=True,
        schema_valid=True,
        provenance_verified=True,
        reliability=1.0,
        latency_ms=10,
        methods=(MCPMethodFact("seis.status", ActionClass.READ),),
        provenance_id="sha256:trusted",
    )
    return descriptor, MCPGateway().evaluate(descriptor, fact, approved=True)


class MCPProcessPathPolicyTests(unittest.TestCase):
    def test_path_lookup_is_blocked_by_default_even_when_command_name_is_allowlisted(self):
        descriptor, evaluation = approved("node")
        transport = FakeTransport()
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("node",),
                allowed_provenance_ids=("sha256:trusted",),
            ),
            transport=transport,
        )

        snapshot = supervisor.start(descriptor, evaluation)

        self.assertEqual(snapshot.state, MCPProcessState.BLOCKED)
        self.assertIn("path-lookup-disabled", snapshot.blockers)
        self.assertEqual(transport.plans, [])

    def test_exact_absolute_executable_can_reach_transport(self):
        descriptor, evaluation = approved("/usr/bin/node")
        transport = FakeTransport()
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("/usr/bin/node",),
                allowed_provenance_ids=("sha256:trusted",),
            ),
            transport=transport,
        )

        snapshot = supervisor.start(descriptor, evaluation)

        self.assertEqual(snapshot.state, MCPProcessState.READY)
        self.assertEqual(len(transport.plans), 1)
        self.assertEqual(transport.plans[0].argv[0], "/usr/bin/node")


if __name__ == "__main__":
    unittest.main()
