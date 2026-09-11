from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import os
import queue
import subprocess
import threading
import time
from typing import Any, BinaryIO, Callable, Mapping

from .mcp_protocol import MCPProtocolEra, MCPProtocolNegotiator
from .mcp_stdio import MCPStdioFrameCodec, MCPStdioFrameError
from .mcp_supervisor import MCPProcessLaunchPlan, MCPProcessStartResult


class MCPStdioShutdownState(str, Enum):
    NOT_RUNNING = "not-running"
    RUNNING = "running"
    EXITED = "exited"
    TERMINATED = "terminated"
    KILLED = "killed"
    FAILED = "failed"


@dataclass(frozen=True)
class MCPStdioTransportSnapshot:
    server_name: str | None
    running: bool
    protocol_era: str | None
    protocol_version: str | None
    stdout_bytes: int
    stderr_bytes: int
    shutdown_state: MCPStdioShutdownState
    failure: str | None


ProcessFactory = Callable[..., Any]


class MCPStdioProcessTransport:
    """Concrete, bounded local stdio transport for an already-reviewed MCP plan.

    The supervisor remains responsible for deciding *whether* a descriptor may
    launch. This transport only executes the exact argv from that plan. It never
    invokes a shell, never performs PATH lookup itself, never installs packages,
    never resolves credentials, and defaults to an empty child environment.

    Startup performs the modern ``server/discover`` probe first. A normal JSON-
    RPC method error may fall back to legacy ``initialize`` on the same child.
    A transport-level read timeout fails closed instead of starting a second
    reader or silently spawning another child outside the supervisor attempt
    budget. Raw stdout/stderr are never retained in snapshots or exceptions.
    """

    def __init__(
        self,
        *,
        negotiator: MCPProtocolNegotiator,
        codec: MCPStdioFrameCodec | None = None,
        process_factory: ProcessFactory = subprocess.Popen,
        environment: Mapping[str, str] | None = None,
        shutdown_timeout_ms: int = 500,
        terminate_timeout_ms: int = 500,
        kill_timeout_ms: int = 500,
        max_unmatched_frames: int = 8,
    ) -> None:
        for name, value in (
            ("shutdown_timeout_ms", shutdown_timeout_ms),
            ("terminate_timeout_ms", terminate_timeout_ms),
            ("kill_timeout_ms", kill_timeout_ms),
            ("max_unmatched_frames", max_unmatched_frames),
        ):
            if value <= 0:
                raise ValueError(f"{name} must be positive")

        self._negotiator = negotiator
        self._codec = codec or MCPStdioFrameCodec()
        self._process_factory = process_factory
        self._environment = dict(environment or {})
        self._shutdown_timeout_ms = shutdown_timeout_ms
        self._terminate_timeout_ms = terminate_timeout_ms
        self._kill_timeout_ms = kill_timeout_ms
        self._max_unmatched_frames = max_unmatched_frames

        self._process: Any | None = None
        self._server_name: str | None = None
        self._protocol_era: str | None = None
        self._protocol_version: str | None = None
        self._stdout_bytes = 0
        self._stderr_bytes = 0
        self._stderr_limit = 0
        self._stderr_thread: threading.Thread | None = None
        self._stderr_done = threading.Event()
        self._shutdown_state = MCPStdioShutdownState.NOT_RUNNING
        self._failure: str | None = None

    @property
    def is_running(self) -> bool:
        process = self._process
        return process is not None and process.poll() is None

    def snapshot(self) -> MCPStdioTransportSnapshot:
        return MCPStdioTransportSnapshot(
            server_name=self._server_name,
            running=self.is_running,
            protocol_era=self._protocol_era,
            protocol_version=self._protocol_version,
            stdout_bytes=self._stdout_bytes,
            stderr_bytes=self._stderr_bytes,
            shutdown_state=self._shutdown_state,
            failure=self._failure,
        )

    def start(self, plan: MCPProcessLaunchPlan) -> MCPProcessStartResult:
        if self.is_running:
            raise RuntimeError("MCP stdio transport already has a running child")
        if not plan.argv or not plan.argv[0]:
            raise ValueError("launch plan argv must contain an executable")
        if not os.path.isabs(plan.argv[0]):
            raise ValueError("stdio transport requires an absolute executable path")

        self._reset_evidence(plan)
        started_at = time.monotonic()

        try:
            process = self._process_factory(
                plan.argv,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=False,
                close_fds=True,
                env=dict(self._environment),
                text=False,
                bufsize=0,
            )
        except Exception:
            self._failure = "launch-failed"
            self._shutdown_state = MCPStdioShutdownState.FAILED
            return self._result(
                started=False,
                ready=False,
                schema_valid=False,
                started_at=started_at,
            )

        self._process = process
        self._shutdown_state = MCPStdioShutdownState.RUNNING
        self._start_stderr_drainer(process.stderr, plan.max_stderr_bytes)

        ready = False
        schema_valid = False
        try:
            probe = self._negotiator.discovery_probe()
            response = self._exchange(
                probe.request,
                timeout_ms=min(plan.startup_timeout_ms, probe.timeout_ms),
                max_stdout_bytes=plan.max_stdout_bytes,
            )
            if response is None:
                self._failure = "probe-timeout"
                return self._fail_and_stop(started_at=started_at)

            decision = self._negotiator.decide_after_probe(response)
            self._protocol_era = decision.era.value
            self._protocol_version = decision.protocol_version

            if decision.era is MCPProtocolEra.MODERN:
                # A real discover result proves schema-aware modern readiness.
                ready = isinstance(response.get("result"), Mapping)
                schema_valid = ready
                if not ready:
                    self._failure = "modern-discovery-not-ready"
            else:
                initialize = self._negotiator.legacy_initialize_request(
                    protocol_version=decision.protocol_version,
                )
                legacy_response = self._exchange(
                    initialize,
                    timeout_ms=plan.startup_timeout_ms,
                    max_stdout_bytes=plan.max_stdout_bytes,
                )
                ready, schema_valid = self._validate_legacy_initialize(
                    legacy_response,
                    expected_version=decision.protocol_version,
                )
                if ready:
                    self._write_message(
                        {
                            "jsonrpc": "2.0",
                            "method": "notifications/initialized",
                        }
                    )
                else:
                    self._failure = "legacy-initialize-invalid"
        except (MCPStdioFrameError, LookupError, ValueError, OSError):
            self._failure = "startup-protocol-failure"
            return self._fail_and_stop(started_at=started_at)
        except Exception:
            self._failure = "startup-transport-failure"
            return self._fail_and_stop(started_at=started_at)

        self._settle_stderr_counter()
        latency_ms = self._elapsed_ms(started_at)
        if self._stderr_bytes > plan.max_stderr_bytes:
            self._failure = "stderr-limit-exceeded"
            ready = False
        if self._stdout_bytes > plan.max_stdout_bytes:
            self._failure = "stdout-limit-exceeded"
            ready = False
        if latency_ms > plan.startup_timeout_ms:
            self._failure = "startup-timeout"
            ready = False
        if process.poll() is not None:
            self._failure = "process-exited-during-startup"
            ready = False

        if not ready or not schema_valid:
            self.shutdown()

        return MCPProcessStartResult(
            started=True,
            ready=ready,
            schema_valid=schema_valid,
            startup_latency_ms=latency_ms,
            stdout_bytes=self._stdout_bytes,
            stderr_bytes=self._stderr_bytes,
        )

    def shutdown(self) -> MCPStdioTransportSnapshot:
        process = self._process
        if process is None:
            self._shutdown_state = MCPStdioShutdownState.NOT_RUNNING
            return self.snapshot()

        stdin = getattr(process, "stdin", None)
        if stdin is not None:
            try:
                stdin.close()
            except Exception:
                pass

        if process.poll() is not None:
            self._shutdown_state = MCPStdioShutdownState.EXITED
            self._finish_shutdown_streams(process)
            return self.snapshot()

        try:
            process.wait(timeout=self._shutdown_timeout_ms / 1000.0)
            self._shutdown_state = MCPStdioShutdownState.EXITED
            self._finish_shutdown_streams(process)
            return self.snapshot()
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            self._failure = self._failure or "shutdown-wait-failed"

        try:
            process.terminate()
            process.wait(timeout=self._terminate_timeout_ms / 1000.0)
            self._shutdown_state = MCPStdioShutdownState.TERMINATED
            self._finish_shutdown_streams(process)
            return self.snapshot()
        except subprocess.TimeoutExpired:
            pass
        except Exception:
            self._failure = self._failure or "terminate-failed"

        try:
            process.kill()
            process.wait(timeout=self._kill_timeout_ms / 1000.0)
            self._shutdown_state = MCPStdioShutdownState.KILLED
        except Exception:
            self._shutdown_state = MCPStdioShutdownState.FAILED
            self._failure = self._failure or "kill-failed"

        self._finish_shutdown_streams(process)
        return self.snapshot()

    def _exchange(
        self,
        request: Mapping[str, Any],
        *,
        timeout_ms: int,
        max_stdout_bytes: int,
    ) -> dict[str, Any] | None:
        request_id = request.get("id")
        if request_id is None:
            raise ValueError("request must have an id")
        self._write_message(request)

        deadline = time.monotonic() + (timeout_ms / 1000.0)
        unmatched = 0
        while unmatched <= self._max_unmatched_frames:
            remaining_ms = max(1, int((deadline - time.monotonic()) * 1000))
            if time.monotonic() >= deadline:
                return None
            frame = self._read_line(
                timeout_ms=remaining_ms,
                remaining_stdout_bytes=max_stdout_bytes - self._stdout_bytes,
            )
            if frame is None:
                return None
            message = self._codec.decode_line(frame)
            if message.get("id") == request_id:
                return message
            unmatched += 1
        raise ValueError("too many unmatched MCP frames during startup")

    def _write_message(self, message: Mapping[str, Any]) -> None:
        process = self._process
        stream = getattr(process, "stdin", None) if process is not None else None
        if stream is None:
            raise OSError("MCP child stdin unavailable")
        frame = self._codec.encode(message)
        stream.write(frame)
        stream.flush()

    def _read_line(self, *, timeout_ms: int, remaining_stdout_bytes: int) -> bytes | None:
        if remaining_stdout_bytes <= 0:
            raise MCPStdioFrameError.__mro__[1]("stdout limit exhausted")
        process = self._process
        stream: BinaryIO | None = getattr(process, "stdout", None) if process is not None else None
        if stream is None:
            raise OSError("MCP child stdout unavailable")

        read_limit = min(self._codec.max_frame_bytes, remaining_stdout_bytes) + 1
        result: queue.Queue[tuple[str, Any]] = queue.Queue(maxsize=1)

        def reader() -> None:
            try:
                result.put(("ok", stream.readline(read_limit)))
            except Exception:
                result.put(("error", None))

        thread = threading.Thread(target=reader, name="seis-mcp-stdout", daemon=True)
        thread.start()
        try:
            kind, value = result.get(timeout=timeout_ms / 1000.0)
        except queue.Empty:
            return None
        if kind != "ok" or not isinstance(value, bytes):
            raise OSError("MCP child stdout read failed")
        if not value:
            raise OSError("MCP child stdout reached EOF")
        self._stdout_bytes += len(value)
        if self._stdout_bytes > remaining_stdout_bytes + (self._stdout_bytes - len(value)):
            raise ValueError("stdout limit exceeded")
        return value

    def _start_stderr_drainer(self, stream: BinaryIO | None, limit: int) -> None:
        self._stderr_limit = limit
        self._stderr_done.clear()
        if stream is None:
            self._stderr_done.set()
            return

        def drain() -> None:
            try:
                while True:
                    chunk = stream.read(4096)
                    if not chunk:
                        break
                    if self._stderr_bytes <= limit:
                        self._stderr_bytes = min(limit + 1, self._stderr_bytes + len(chunk))
            except Exception:
                if self._stderr_bytes <= limit:
                    self._stderr_bytes = limit + 1
            finally:
                self._stderr_done.set()

        self._stderr_thread = threading.Thread(
            target=drain,
            name="seis-mcp-stderr",
            daemon=True,
        )
        self._stderr_thread.start()

    def _settle_stderr_counter(self) -> None:
        thread = self._stderr_thread
        if thread is not None:
            thread.join(timeout=0.01)

    @staticmethod
    def _validate_legacy_initialize(
        response: Mapping[str, Any] | None,
        *,
        expected_version: str,
    ) -> tuple[bool, bool]:
        if not isinstance(response, Mapping):
            return False, False
        result = response.get("result")
        if not isinstance(result, Mapping):
            return False, False
        protocol_version = result.get("protocolVersion")
        capabilities = result.get("capabilities")
        server_info = result.get("serverInfo")
        schema_valid = (
            protocol_version == expected_version
            and isinstance(capabilities, Mapping)
            and isinstance(server_info, Mapping)
        )
        return schema_valid, schema_valid

    def _fail_and_stop(self, *, started_at: float) -> MCPProcessStartResult:
        latency_ms = self._elapsed_ms(started_at)
        self._settle_stderr_counter()
        self.shutdown()
        return MCPProcessStartResult(
            started=True,
            ready=False,
            schema_valid=False,
            startup_latency_ms=latency_ms,
            stdout_bytes=self._stdout_bytes,
            stderr_bytes=self._stderr_bytes,
        )

    def _result(
        self,
        *,
        started: bool,
        ready: bool,
        schema_valid: bool,
        started_at: float,
    ) -> MCPProcessStartResult:
        return MCPProcessStartResult(
            started=started,
            ready=ready,
            schema_valid=schema_valid,
            startup_latency_ms=self._elapsed_ms(started_at),
            stdout_bytes=self._stdout_bytes,
            stderr_bytes=self._stderr_bytes,
        )

    def _reset_evidence(self, plan: MCPProcessLaunchPlan) -> None:
        self._server_name = plan.server_name
        self._protocol_era = None
        self._protocol_version = None
        self._stdout_bytes = 0
        self._stderr_bytes = 0
        self._stderr_limit = plan.max_stderr_bytes
        self._stderr_thread = None
        self._stderr_done.clear()
        self._shutdown_state = MCPStdioShutdownState.NOT_RUNNING
        self._failure = None
        self._process = None

    def _finish_shutdown_streams(self, process: Any) -> None:
        for name in ("stdout", "stderr"):
            stream = getattr(process, name, None)
            if stream is not None:
                try:
                    stream.close()
                except Exception:
                    pass
        self._settle_stderr_counter()

    @staticmethod
    def _elapsed_ms(started_at: float) -> int:
        return max(0, int((time.monotonic() - started_at) * 1000))
