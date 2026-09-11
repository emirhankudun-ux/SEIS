from __future__ import annotations

import io
import subprocess
import sys
import time
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.mcp_protocol import MCPProtocolNegotiator
from maria_runtime.mcp_stdio_transport import (
    MCPStdioProcessTransport,
    MCPStdioShutdownState,
)
from maria_runtime.mcp_supervisor import MCPProcessLaunchPlan


class _InputSink(io.BytesIO):
    def close(self) -> None:
        # Keep bytes inspectable after transport shutdown in tests.
        self.flush()


class _BlockingStdout:
    def __init__(self, delay_seconds: float) -> None:
        self.delay_seconds = delay_seconds
        self.closed = False

    def readline(self, limit=-1):
        time.sleep(self.delay_seconds)
        return b""

    def close(self):
        self.closed = True


class _FakeProcess:
    def __init__(
        self,
        *,
        stdout: bytes | None = b"",
        stderr: bytes = b"",
        wait_timeouts: int = 0,
        stdout_stream=None,
    ) -> None:
        self.stdin = _InputSink()
        self.stdout = stdout_stream if stdout_stream is not None else io.BytesIO(stdout or b"")
        self.stderr = io.BytesIO(stderr)
        self.returncode = None
        self._wait_timeouts = wait_timeouts
        self.terminate_calls = 0
        self.kill_calls = 0

    def poll(self):
        return self.returncode

    def wait(self, timeout=None):
        if self._wait_timeouts > 0:
            self._wait_timeouts -= 1
            raise subprocess.TimeoutExpired(cmd="redacted", timeout=timeout)
        self.returncode = 0
        return 0

    def terminate(self):
        self.terminate_calls += 1

    def kill(self):
        self.kill_calls += 1
        self.returncode = -9


class _Factory:
    def __init__(self, process: _FakeProcess) -> None:
        self.process = process
        self.calls = []

    def __call__(self, argv, **kwargs):
        self.calls.append((tuple(argv), kwargs))
        return self.process


class MCPStdioProcessTransportTests(unittest.TestCase):
    def setUp(self) -> None:
        self.plan = MCPProcessLaunchPlan(
            server_name="demo",
            argv=("/usr/bin/node", "/opt/seis/demo-mcp.js"),
            provenance_id="repo:demo@abc123",
            startup_timeout_ms=500,
            max_stdout_bytes=8_192,
            max_stderr_bytes=2_048,
        )
        self.negotiator = MCPProtocolNegotiator(
            client_name="SEIS",
            client_version="0.1.0",
            discovery_timeout_ms=100,
        )

    def test_launches_without_shell_or_inherited_environment_and_completes_modern_probe(self):
        response = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","result":'
            b'{"supportedVersions":["2026-07-28"]}}\n'
        )
        process = _FakeProcess(stdout=response)
        factory = _Factory(process)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=factory,
            environment={},
        )

        result = transport.start(self.plan)

        self.assertTrue(result.started)
        self.assertTrue(result.ready)
        self.assertTrue(result.schema_valid)
        self.assertEqual(len(factory.calls), 1)
        argv, kwargs = factory.calls[0]
        self.assertEqual(argv, self.plan.argv)
        self.assertIs(kwargs["stdin"], subprocess.PIPE)
        self.assertIs(kwargs["stdout"], subprocess.PIPE)
        self.assertIs(kwargs["stderr"], subprocess.PIPE)
        self.assertFalse(kwargs["shell"])
        self.assertEqual(kwargs["env"], {})
        self.assertFalse(kwargs["text"])
        self.assertIn(b'"method":"server/discover"', process.stdin.getvalue())
        self.assertTrue(transport.is_running)

    def test_legacy_probe_error_falls_back_to_initialize_on_same_child(self):
        responses = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","error":{"code":-32601,"message":"unknown"}}\n'
            b'{"jsonrpc":"2.0","id":"seis-initialize-1","result":'
            b'{"protocolVersion":"2025-11-25","capabilities":{},"serverInfo":{"name":"demo","version":"1"}}}\n'
        )
        process = _FakeProcess(stdout=responses)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=_Factory(process),
            environment={},
        )

        result = transport.start(self.plan)

        self.assertTrue(result.ready)
        sent = process.stdin.getvalue()
        self.assertIn(b'"method":"server/discover"', sent)
        self.assertIn(b'"method":"initialize"', sent)

    def test_probe_timeout_fails_closed_without_spawning_a_second_child(self):
        process = _FakeProcess(stdout_stream=_BlockingStdout(delay_seconds=0.2))
        factory = _Factory(process)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=factory,
            environment={},
            shutdown_timeout_ms=10,
        )

        result = transport.start(self.plan)

        self.assertTrue(result.started)
        self.assertFalse(result.ready)
        self.assertEqual(len(factory.calls), 1)
        self.assertEqual(transport.snapshot().failure, "probe-timeout")
        self.assertFalse(transport.is_running)

    def test_oversized_stderr_fails_closed_without_retaining_stderr_content(self):
        secret = b"SUPER_SECRET_TOKEN" * 256
        response = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","result":'
            b'{"supportedVersions":["2026-07-28"]}}\n'
        )
        process = _FakeProcess(stdout=response, stderr=secret)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=_Factory(process),
            environment={},
        )

        result = transport.start(self.plan)

        self.assertTrue(result.started)
        self.assertFalse(result.ready)
        self.assertGreater(result.stderr_bytes, self.plan.max_stderr_bytes)
        self.assertNotIn("SUPER_SECRET_TOKEN", repr(transport.snapshot()))
        self.assertFalse(transport.is_running)

    def test_shutdown_escalates_from_wait_to_terminate_without_shell_side_effects(self):
        response = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","result":'
            b'{"supportedVersions":["2026-07-28"]}}\n'
        )
        process = _FakeProcess(stdout=response, wait_timeouts=1)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=_Factory(process),
            environment={},
            shutdown_timeout_ms=10,
            terminate_timeout_ms=10,
        )
        self.assertTrue(transport.start(self.plan).ready)

        snapshot = transport.shutdown()

        self.assertEqual(snapshot.state, MCPStdioShutdownState.TERMINATED)
        self.assertEqual(process.terminate_calls, 1)
        self.assertEqual(process.kill_calls, 0)
        self.assertFalse(transport.is_running)

    def test_shutdown_kills_child_when_terminate_does_not_finish(self):
        response = (
            b'{"jsonrpc":"2.0","id":"seis-discover-1","result":'
            b'{"supportedVersions":["2026-07-28"]}}\n'
        )
        process = _FakeProcess(stdout=response, wait_timeouts=2)
        transport = MCPStdioProcessTransport(
            negotiator=self.negotiator,
            process_factory=_Factory(process),
            environment={},
            shutdown_timeout_ms=10,
            terminate_timeout_ms=10,
            kill_timeout_ms=10,
        )
        self.assertTrue(transport.start(self.plan).ready)

        snapshot = transport.shutdown()

        self.assertEqual(snapshot.state, MCPStdioShutdownState.KILLED)
        self.assertEqual(process.terminate_calls, 1)
        self.assertEqual(process.kill_calls, 1)
        self.assertFalse(transport.is_running)


if __name__ == "__main__":
    unittest.main()
