from __future__ import annotations

import io
import json
import subprocess
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_config import MCPConfigImporter
from maria_runtime.mcp_gateway import MCPDiscoveryFact, MCPGateway, MCPMethodFact
from maria_runtime.mcp_protocol import MCPProtocolNegotiator
from maria_runtime.mcp_secrets import MCPEnvironmentResolver
from maria_runtime.mcp_stdio_transport import MCPStdioProcessTransport
from maria_runtime.mcp_supervisor import (
    MCPProcessPolicy,
    MCPProcessStartResult,
    MCPProcessState,
    MCPProcessSupervisor,
)
from maria_runtime.permissions import ActionClass


class _DictSecretSource:
    def __init__(self, values):
        self.values = dict(values)
        self.calls = []

    def resolve(self, *, server_name, key):
        self.calls.append((server_name, key))
        return self.values.get((server_name, key))


class _SupervisorTransport:
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


class _InputSink(io.BytesIO):
    def close(self):
        self.flush()


class _FakeProcess:
    def __init__(self, stdout):
        self.stdin = _InputSink()
        self.stdout = io.BytesIO(stdout)
        self.stderr = io.BytesIO(b"")
        self.returncode = None

    def poll(self):
        return self.returncode

    def wait(self, timeout=None):
        self.returncode = 0
        return 0

    def terminate(self):
        self.returncode = -15

    def kill(self):
        self.returncode = -9


class _Factory:
    def __init__(self, process):
        self.process = process
        self.calls = []

    def __call__(self, argv, **kwargs):
        self.calls.append((tuple(argv), kwargs))
        return self.process


def _approved_env_server():
    preview = MCPConfigImporter().preview_json(json.dumps({
        "mcpServers": {
            "demo": {
                "command": "/usr/bin/node",
                "args": ["/opt/seis/demo-mcp.js"],
                "env": {
                    "OPENAI_API_KEY": "must-be-discarded",
                    "LOG_LEVEL": "must-also-be-discarded",
                },
            }
        }
    }))
    descriptor = preview.servers[0]
    fact = MCPDiscoveryFact(
        server_name="demo",
        version="1.0.0",
        verified=True,
        reachable=True,
        schema_valid=True,
        provenance_verified=True,
        reliability=0.99,
        latency_ms=20,
        methods=(MCPMethodFact("demo.status", ActionClass.READ),),
        provenance_id="sha256:demo",
    )
    evaluation = MCPGateway().evaluate(descriptor, fact, approved=True)
    return descriptor, evaluation


class MCPSecretResolutionTests(unittest.TestCase):
    def test_resolver_returns_redacted_one_shot_environment_lease(self):
        descriptor, evaluation = _approved_env_server()
        secret = "sk-super-secret-value"
        source = _DictSecretSource({
            ("demo", "OPENAI_API_KEY"): secret,
            ("demo", "LOG_LEVEL"): "debug",
        })

        lease = MCPEnvironmentResolver(source).resolve(descriptor, evaluation)

        self.assertEqual(lease.server_name, "demo")
        self.assertEqual(lease.keys, ("LOG_LEVEL", "OPENAI_API_KEY"))
        self.assertFalse(lease.consumed)
        self.assertNotIn(secret, repr(lease))
        self.assertNotIn("debug", repr(lease))
        self.assertEqual(
            lease.materialize_once(server_name="demo"),
            {"LOG_LEVEL": "debug", "OPENAI_API_KEY": secret},
        )
        self.assertTrue(lease.consumed)
        self.assertNotIn(secret, repr(lease))
        with self.assertRaises(PermissionError):
            lease.materialize_once(server_name="demo")

    def test_missing_environment_value_fails_closed_without_raw_source_error(self):
        descriptor, evaluation = _approved_env_server()
        source = _DictSecretSource({("demo", "LOG_LEVEL"): "debug"})

        with self.assertRaises(LookupError) as ctx:
            MCPEnvironmentResolver(source).resolve(descriptor, evaluation)

        self.assertNotIn("debug", str(ctx.exception))
        self.assertNotIn("must-be-discarded", str(ctx.exception))

    def test_supervisor_accepts_only_matching_fresh_resolved_environment(self):
        descriptor, evaluation = _approved_env_server()
        source = _DictSecretSource({
            ("demo", "OPENAI_API_KEY"): "secret",
            ("demo", "LOG_LEVEL"): "debug",
        })
        lease = MCPEnvironmentResolver(source).resolve(descriptor, evaluation)
        transport = _SupervisorTransport()
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("/usr/bin/node",),
                allowed_provenance_ids=("sha256:demo",),
            ),
            transport=transport,
        )

        snapshot = supervisor.start(descriptor, evaluation, environment_lease=lease)

        self.assertEqual(snapshot.state, MCPProcessState.READY)
        self.assertEqual(len(transport.plans), 1)
        self.assertIs(transport.plans[0].environment_lease, lease)
        self.assertNotIn("secret", repr(transport.plans[0]))

    def test_stdio_transport_materializes_lease_only_at_spawn_and_consumes_it(self):
        descriptor, evaluation = _approved_env_server()
        secret = "runtime-only-secret"
        lease = MCPEnvironmentResolver(_DictSecretSource({
            ("demo", "OPENAI_API_KEY"): secret,
            ("demo", "LOG_LEVEL"): "debug",
        })).resolve(descriptor, evaluation)
        supervisor_transport = _SupervisorTransport()
        supervisor = MCPProcessSupervisor(
            policy=MCPProcessPolicy(
                allowed_commands=("/usr/bin/node",),
                allowed_provenance_ids=("sha256:demo",),
            ),
            transport=supervisor_transport,
        )
        self.assertEqual(
            supervisor.start(descriptor, evaluation, environment_lease=lease).state,
            MCPProcessState.READY,
        )
        plan = supervisor_transport.plans[0]

        response = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","result":'
            b'{"supportedVersions":["2026-07-28"]}}\n'
        )
        process = _FakeProcess(response)
        factory = _Factory(process)
        transport = MCPStdioProcessTransport(
            negotiator=MCPProtocolNegotiator(
                client_name="SEIS",
                client_version="0.1.0",
                discovery_timeout_ms=100,
            ),
            process_factory=factory,
        )

        result = transport.start(plan)

        self.assertTrue(result.ready)
        self.assertTrue(lease.consumed)
        self.assertEqual(len(factory.calls), 1)
        child_env = factory.calls[0][1]["env"]
        self.assertEqual(child_env["OPENAI_API_KEY"], secret)
        self.assertEqual(child_env["LOG_LEVEL"], "debug")
        self.assertNotIn(secret, repr(plan))
        self.assertNotIn(secret, repr(transport.snapshot()))

    def test_direct_nonempty_transport_environment_injection_is_rejected(self):
        with self.assertRaises(ValueError):
            MCPStdioProcessTransport(
                negotiator=MCPProtocolNegotiator(
                    client_name="SEIS",
                    client_version="0.1.0",
                    discovery_timeout_ms=100,
                ),
                environment={"BYPASS_SECRET": "not-reviewed"},
            )


if __name__ == "__main__":
    unittest.main()
