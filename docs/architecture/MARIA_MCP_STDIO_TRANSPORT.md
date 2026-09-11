# MARIA MCP Stdio Transport

Status: draft implementation boundary for `feature/maria-intelligence-fabric-v1`.

## Purpose

`MCPStdioProcessTransport` is the concrete bounded local process transport behind `MCPProcessSupervisor`. It executes only an already-reviewed `MCPProcessLaunchPlan`; it does not decide whether a descriptor is trusted, approved, or permitted to run.

## Security invariants

- `shell=False` is mandatory.
- The executable path must be absolute before process creation.
- The exact argv from the reviewed launch plan is passed directly to the child.
- The transport does not perform PATH lookup, package installation, runtime download, command rewriting, or secret lookup.
- Direct non-empty environment injection into the transport constructor is rejected.
- Child environment defaults to an empty mapping rather than inheriting the parent process environment.
- A reviewed `MCPResolvedEnvironmentLease`, when present on the launch plan, is materialized exactly once immediately before process creation and only for the matching server identity.
- Environment values are never retained in transport fields, snapshots, logs, or normalized exceptions.
- stdin/stdout/stderr are binary pipes; raw stdout/stderr are never retained in snapshots or exception messages.
- stdout framing is newline-delimited JSON-RPC 2.0 through `MCPStdioFrameCodec` with explicit byte limits.
- stderr is drained concurrently and counted only up to `limit + 1`, preventing both pipe deadlock and secret retention.
- Startup read timeouts fail closed. The transport does not spawn a replacement child outside the supervisor attempt budget.
- Shutdown is explicit: close stdin, bounded wait, terminate, bounded wait, kill, bounded wait.

## Environment handoff

The environment trust path is intentionally separate from process transport:

`MCPConfigImporter (key names only) → approved MCPGatewayEvaluation → MCPEnvironmentResolver → one-shot MCPResolvedEnvironmentLease → MCPProcessSupervisor exact-key check → MCPProcessLaunchPlan → MCPStdioProcessTransport spawn`

The importer discards configuration values. The resolver uses an injected `MCPSecretSource` and may only resolve keys declared by the reviewed descriptor. The supervisor refuses missing, consumed, mismatched, or undeclared environment leases. The stdio transport is the only layer that materializes the lease and it does so at the child-spawn boundary.

Python cannot guarantee physical zeroization of immutable string values. The implementation therefore promises minimal in-memory retention and redacted evidence, not cryptographic zeroization.

## Startup protocol

1. Validate the reviewed absolute argv.
2. Materialize the matching one-shot environment lease if the launch plan carries one; otherwise use `{}`.
3. Launch reviewed argv with `shell=False`.
4. Start the bounded stderr drainer.
5. Send the modern `server/discover` probe from `MCPProtocolNegotiator`.
6. If a valid modern discovery result is returned, record the negotiated modern protocol version and mark startup ready.
7. If the server returns an ordinary legacy-style JSON-RPC method error, issue the negotiated legacy `initialize` request on the same child.
8. Validate `protocolVersion`, `capabilities`, and `serverInfo`, then send `notifications/initialized`.
9. Reject startup if stdout/stderr/startup latency exceeds the launch-plan limits or if the child exits during startup.

A transport-level probe timeout fails closed instead of attempting legacy fallback on a second reader or silently launching another child.

## Evidence model

`MCPStdioTransportSnapshot` stores only normalized evidence:

- server name,
- running state,
- negotiated protocol era/version,
- stdout/stderr byte counts,
- shutdown state,
- normalized failure code.

No raw environment value, server payload, stderr text, exception text, prompt content, credential, or tool result is persisted.

## Invocation integration

The transport implements the request contract consumed by `MCPInvocationExecutor`. Once startup negotiation is complete, an already-approved short-lived `MCPInvocationPlan` may issue exactly one bounded correlated request through the executor. The executor performs no automatic retries and consumes its authorization plan on the first transport attempt.

## Still not enabled automatically

This transport does **not** by itself authorize arbitrary MCP tool execution, cloud provider calls, OAuth, package-manager launchers, repository mutation, Unreal/Blender mutation, GUI automation, deployment, or unattended external side effects. A real external invocation still requires all upstream trust, process, permission, freshness, and executor boundaries to pass.
