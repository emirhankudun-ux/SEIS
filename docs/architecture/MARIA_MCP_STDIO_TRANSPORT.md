# MARIA MCP Stdio Transport

Status: draft implementation boundary for `feature/maria-intelligence-fabric-v1`.

## Purpose

`MCPStdioProcessTransport` is the first concrete local process transport behind the existing `MCPProcessSupervisor` policy boundary. It executes only an already-reviewed `MCPProcessLaunchPlan`; it does not decide whether an MCP descriptor is trusted, approved, or allowed to run.

## Security invariants

- `shell=False` is mandatory.
- The executable path must be absolute before process creation.
- The exact argv from the reviewed launch plan is passed directly to the child.
- The transport does not perform PATH lookup, package installation, runtime download, credential resolution, or command rewriting.
- Child environment defaults to an empty mapping rather than inheriting the parent process environment.
- stdin/stdout/stderr are binary pipes; raw stdout/stderr are never retained in snapshots or exception messages.
- stdout framing is newline-delimited JSON-RPC 2.0 through `MCPStdioFrameCodec` with explicit byte limits.
- stderr is drained concurrently and counted only up to `limit + 1`, preventing both pipe deadlock and secret retention.
- Startup read timeouts fail closed. The transport does not spawn a replacement child outside the supervisor attempt budget.
- Shutdown is explicit: close stdin, bounded wait, terminate, bounded wait, kill, bounded wait.

## Startup protocol

1. Launch reviewed argv with `shell=False`.
2. Start the bounded stderr drainer.
3. Send the modern `server/discover` probe from `MCPProtocolNegotiator`.
4. If a valid modern discovery result is returned, record the negotiated modern protocol version and mark startup ready.
5. If the server returns an ordinary legacy-style JSON-RPC method error, issue the negotiated legacy `initialize` request on the same child.
6. Validate `protocolVersion`, `capabilities`, and `serverInfo`, then send `notifications/initialized`.
7. Reject startup if stdout/stderr/startup latency exceeds the launch-plan limits or if the child exits during startup.

A transport-level probe timeout currently fails closed instead of attempting legacy fallback on the same stream. This avoids racing an abandoned reader against a second reader and avoids silently launching another child outside `MCPProcessSupervisor` accounting.

## Evidence model

`MCPStdioTransportSnapshot` stores only normalized evidence:

- server name,
- running state,
- negotiated protocol era/version,
- stdout/stderr byte counts,
- shutdown state,
- normalized failure code.

No raw server payload, stderr text, exception text, prompt content, credentials, or tool output is persisted.

## Not enabled by this slice

This transport does **not** enable arbitrary MCP tool execution, cloud provider calls, OAuth, secret injection, package-manager launchers, repository mutation, Unreal/Blender mutation, GUI automation, deployment, or unattended external side effects.

The next layer should be an MCP executor that consumes only an approved `MCPInvocationPlan`, verifies the supervised process is still healthy, re-runs per-call permission checks, correlates request/response IDs, enforces per-call byte/time limits, and records redacted invocation evidence.
