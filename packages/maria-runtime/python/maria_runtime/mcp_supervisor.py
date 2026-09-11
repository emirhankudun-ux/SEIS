from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import ntpath
import posixpath
from typing import Protocol

from .mcp_config import MCPServerDescriptor
from .mcp_gateway import MCPGatewayEvaluation
from .registry import ToolStatus


_DYNAMIC_PACKAGE_MANAGERS = {
    "npx",
    "pnpx",
    "bunx",
    "uvx",
    "pipx",
}


class MCPProcessState(str, Enum):
    STOPPED = "stopped"
    READY = "ready"
    DEGRADED = "degraded"
    BLOCKED = "blocked"
    CIRCUIT_OPEN = "circuit-open"


@dataclass(frozen=True)
class MCPProcessPolicy:
    """Fail-closed process launch policy for one supervised MCP boundary.

    The policy deliberately requires exact executable and provenance allowlists.
    PATH lookup, dynamic package-manager launch, and environment resolution are
    disabled by default because each can introduce executable or secret state
    outside the reviewed descriptor/provenance boundary.
    """

    allowed_commands: tuple[str, ...]
    allowed_provenance_ids: tuple[str, ...]
    startup_timeout_ms: int = 5_000
    max_stdout_bytes: int = 64 * 1024
    max_stderr_bytes: int = 32 * 1024
    max_args: int = 64
    max_arg_bytes: int = 4_096
    circuit_failure_threshold: int = 2
    max_attempts: int = 3
    allow_path_lookup: bool = False
    allow_dynamic_package_manager: bool = False

    def __post_init__(self) -> None:
        if not self.allowed_commands or any(not command.strip() for command in self.allowed_commands):
            raise ValueError("allowed_commands must contain non-empty exact command entries")
        if len(set(self.allowed_commands)) != len(self.allowed_commands):
            raise ValueError("allowed_commands cannot contain duplicates")
        if not self.allowed_provenance_ids or any(
            not provenance.strip() for provenance in self.allowed_provenance_ids
        ):
            raise ValueError("allowed_provenance_ids must contain non-empty entries")
        if len(set(self.allowed_provenance_ids)) != len(self.allowed_provenance_ids):
            raise ValueError("allowed_provenance_ids cannot contain duplicates")
        if self.startup_timeout_ms <= 0:
            raise ValueError("startup_timeout_ms must be positive")
        if self.max_stdout_bytes <= 0 or self.max_stderr_bytes <= 0:
            raise ValueError("output byte limits must be positive")
        if self.max_args <= 0 or self.max_arg_bytes <= 0:
            raise ValueError("argument limits must be positive")
        if self.circuit_failure_threshold <= 0:
            raise ValueError("circuit_failure_threshold must be positive")
        if self.max_attempts <= 0:
            raise ValueError("max_attempts must be positive")


@dataclass(frozen=True)
class MCPProcessLaunchPlan:
    server_name: str
    argv: tuple[str, ...]
    provenance_id: str
    startup_timeout_ms: int
    max_stdout_bytes: int
    max_stderr_bytes: int


@dataclass(frozen=True)
class MCPProcessStartResult:
    """Normalized process-start evidence returned by a transport adapter.

    Raw stdout/stderr and exception text are intentionally excluded. A concrete
    transport may enforce the byte/time limits more aggressively, while this
    supervisor independently rejects evidence that exceeds the declared policy.
    """

    started: bool
    ready: bool
    schema_valid: bool
    startup_latency_ms: int
    stdout_bytes: int
    stderr_bytes: int

    def __post_init__(self) -> None:
        if self.startup_latency_ms < 0:
            raise ValueError("startup_latency_ms cannot be negative")
        if self.stdout_bytes < 0 or self.stderr_bytes < 0:
            raise ValueError("output byte counts cannot be negative")


@dataclass(frozen=True)
class MCPProcessSnapshot:
    state: MCPProcessState
    server_name: str | None
    attempt_count: int
    consecutive_failures: int
    blockers: tuple[str, ...]
    latest_startup_latency_ms: int | None = None


class MCPProcessTransport(Protocol):
    def start(self, plan: MCPProcessLaunchPlan) -> MCPProcessStartResult:
        ...


class MCPProcessSupervisor:
    """Bounded lifecycle/circuit-breaker core for reviewed MCP processes.

    The supervisor does not implement subprocess spawning, environment/secret
    resolution, package installation, or schema discovery. A concrete transport
    must be injected explicitly. This keeps process authority separate from the
    policy/gateway layer while still defining exact launch bounds and redacted
    lifecycle evidence.
    """

    def __init__(self, *, policy: MCPProcessPolicy, transport: MCPProcessTransport) -> None:
        self._policy = policy
        self._transport = transport
        self._server_name: str | None = None
        self._attempt_count = 0
        self._consecutive_failures = 0
        self._state = MCPProcessState.STOPPED
        self._latest_startup_latency_ms: int | None = None

    def snapshot(self, *, blockers: tuple[str, ...] = ()) -> MCPProcessSnapshot:
        return MCPProcessSnapshot(
            state=self._state,
            server_name=self._server_name,
            attempt_count=self._attempt_count,
            consecutive_failures=self._consecutive_failures,
            blockers=blockers,
            latest_startup_latency_ms=self._latest_startup_latency_ms,
        )

    def start(
        self,
        descriptor: MCPServerDescriptor,
        evaluation: MCPGatewayEvaluation,
    ) -> MCPProcessSnapshot:
        blockers = self._preflight_blockers(descriptor, evaluation)
        if blockers:
            if self._state is not MCPProcessState.CIRCUIT_OPEN:
                self._state = MCPProcessState.BLOCKED
            return self.snapshot(blockers=tuple(blockers))

        self._server_name = descriptor.name
        plan = MCPProcessLaunchPlan(
            server_name=descriptor.name,
            argv=(descriptor.command, *descriptor.args),
            provenance_id=evaluation.provenance_id,
            startup_timeout_ms=self._policy.startup_timeout_ms,
            max_stdout_bytes=self._policy.max_stdout_bytes,
            max_stderr_bytes=self._policy.max_stderr_bytes,
        )
        self._attempt_count += 1

        try:
            result = self._transport.start(plan)
        except Exception:
            return self._record_failure(("transport-failure",), startup_latency_ms=None)

        failures: list[str] = []
        if not result.started:
            failures.append("process-not-started")
        if not result.ready:
            failures.append("readiness-failed")
        if not result.schema_valid:
            failures.append("schema-invalid")
        if result.startup_latency_ms > self._policy.startup_timeout_ms:
            failures.append("startup-timeout")
        if result.stdout_bytes > self._policy.max_stdout_bytes:
            failures.append("stdout-limit-exceeded")
        if result.stderr_bytes > self._policy.max_stderr_bytes:
            failures.append("stderr-limit-exceeded")

        if failures:
            return self._record_failure(
                tuple(failures),
                startup_latency_ms=result.startup_latency_ms,
            )

        self._state = MCPProcessState.READY
        self._consecutive_failures = 0
        self._latest_startup_latency_ms = result.startup_latency_ms
        return self.snapshot()

    def reset_circuit(self, *, approved: bool) -> MCPProcessSnapshot:
        if not approved:
            raise PermissionError("explicit approval is required to reset MCP process circuit")
        self._state = MCPProcessState.STOPPED
        self._attempt_count = 0
        self._consecutive_failures = 0
        self._latest_startup_latency_ms = None
        return self.snapshot()

    def _record_failure(
        self,
        blockers: tuple[str, ...],
        *,
        startup_latency_ms: int | None,
    ) -> MCPProcessSnapshot:
        self._consecutive_failures += 1
        self._latest_startup_latency_ms = startup_latency_ms
        if self._consecutive_failures >= self._policy.circuit_failure_threshold:
            self._state = MCPProcessState.CIRCUIT_OPEN
        else:
            self._state = MCPProcessState.DEGRADED
        return self.snapshot(blockers=blockers)

    def _preflight_blockers(
        self,
        descriptor: MCPServerDescriptor,
        evaluation: MCPGatewayEvaluation,
    ) -> list[str]:
        blockers: list[str] = []

        if self._state is MCPProcessState.CIRCUIT_OPEN:
            blockers.append("circuit-open")
            return blockers
        if self._attempt_count >= self._policy.max_attempts:
            blockers.append("attempt-budget-exhausted")
            return blockers
        if self._server_name is not None and self._server_name != descriptor.name:
            blockers.append("supervisor-server-mismatch")
        if evaluation.tool.name != f"mcp:{descriptor.name}":
            blockers.append("gateway-server-mismatch")
        if evaluation.tool.status is not ToolStatus.AVAILABLE:
            blockers.append("gateway-not-approved")
        if evaluation.blockers:
            blockers.append("gateway-has-blockers")
        if descriptor.requires_review:
            blockers.append("descriptor-requires-review")
        if descriptor.command not in self._policy.allowed_commands:
            blockers.append("command-not-allowlisted")
        if not evaluation.provenance_id:
            blockers.append("provenance-id-missing")
        elif evaluation.provenance_id not in self._policy.allowed_provenance_ids:
            blockers.append("provenance-not-allowlisted")

        command_is_absolute = posixpath.isabs(descriptor.command) or ntpath.isabs(descriptor.command)
        if not command_is_absolute and not self._policy.allow_path_lookup:
            blockers.append("path-lookup-disabled")

        executable = descriptor.command.replace("\\", "/").rsplit("/", 1)[-1].lower()
        if executable in _DYNAMIC_PACKAGE_MANAGERS and not self._policy.allow_dynamic_package_manager:
            blockers.append("dynamic-package-manager-disabled")

        if descriptor.env_keys:
            blockers.append("environment-resolution-required")
        if len(descriptor.args) > self._policy.max_args:
            blockers.append("argument-count-exceeded")
        for arg in descriptor.args:
            if "\x00" in arg or "\n" in arg or "\r" in arg:
                blockers.append("argument-control-character")
                break
            if len(arg.encode("utf-8")) > self._policy.max_arg_bytes:
                blockers.append("argument-size-exceeded")
                break

        return blockers
