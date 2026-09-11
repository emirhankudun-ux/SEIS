# MARIA MCP Process Supervisor

## Status

Bounded supervisor-core + protocol-negotiation slice for the MARIA × SEIS Intelligence Fabric. The process policy, lifecycle, redacted evidence, attempt budget, circuit-breaker contracts, and MCP protocol-era planner are implemented. A concrete subprocess transport, environment/secret resolver, MCP stdio framing loop, and MCP method executor are still deliberately absent.

## Purpose

`MCPProcessSupervisor` is the execution seam between a fully approved `MCPGatewayEvaluation` and a future concrete local MCP process transport. It prevents a reviewed MCP descriptor from turning directly into unrestricted process authority.

The supervisor accepts only:

- an imported `MCPServerDescriptor`;
- an already-approved `MCPGatewayEvaluation`;
- an exact executable allowlist;
- an exact normalized provenance allowlist;
- explicit startup/output/argument limits;
- an explicitly injected transport adapter.

It never resolves credentials or environment values by itself.

## Trust chain

```text
MCP config import preview
        ↓
redacted descriptor
        ↓
MCP discovery fact
        ↓
MCP gateway trust + explicit server approval
        ↓
MCP process supervisor preflight
        ↓
exact command allowlist
exact provenance allowlist
argument/output/time bounds
attempt budget + circuit breaker
        ↓
protocol-era negotiation plan
        ↓
injected process transport
```

A later per-method invocation still requires `MCPInvocationGuard` and a fresh `PermissionEngine` decision. Process approval is therefore not tool-call approval.

## MCP protocol-era negotiation

The transport boundary must not assume that every MCP server starts with `initialize`.

MCP `2026-07-28` is the modern stateless era. For stdio compatibility, a client that supports both modern and legacy servers should first issue `server/discover` with the preferred modern protocol version in the request `_meta` envelope. A valid discovery result keeps the connection in the modern era. A modern protocol-version error can advertise another supported modern version. Ordinary probe errors or a bounded probe timeout may fall back to the legacy initialize lifecycle.

`MCPProtocolNegotiator` now models this without launching a process:

- preferred modern revision: `2026-07-28`;
- preferred legacy revision: `2025-11-25`;
- default discovery timeout: 5 seconds;
- modern discovery request includes protocol version, client identity, and client capabilities in `_meta`;
- a confirmed modern server with no mutually supported modern version fails closed instead of silently downgrading;
- timeout or an ordinary legacy-style JSON-RPC error may fall back to the latest configured legacy version;
- legacy `initialize` requests are generated separately and do not reuse the modern `_meta` envelope.

The server's self-reported identity is treated as display/debug metadata only. It is not used as a trust or provenance signal.

Protocol references used for this contract:

- https://modelcontextprotocol.io/specification/draft/server/discover
- https://modelcontextprotocol.io/specification/draft/basic/transports/stdio

## Fail-closed launch rules

The supervisor refuses to touch its transport when any of these conditions apply:

- gateway evaluation is not `AVAILABLE`;
- the gateway still reports blockers;
- gateway/server identities disagree;
- the descriptor still requires manual review;
- the command is not an exact allowlist entry;
- normalized provenance identity is missing or not allowlisted;
- the same supervisor instance is reused for a different server;
- environment keys require a resolver that this slice does not provide;
- argument count, byte size, or control-character rules fail;
- the bounded attempt budget is exhausted;
- the circuit breaker is open.

Dynamic package-manager launchers such as `npx`, `pnpx`, `bunx`, `uvx`, and `pipx` are disabled by default even if their executable name appears in the command allowlist. This avoids silently downloading or executing package-manager-selected code. A future higher-level policy may opt in only after provenance and package-resolution rules are defined.

PATH lookup is also disabled by default. A descriptor such as `node server.mjs` is blocked unless a higher-level reviewed policy explicitly permits PATH resolution; the normal safe route uses an exact absolute executable path such as `/usr/bin/node` plus provenance checks.

## Redacted lifecycle evidence

`MCPProcessStartResult` accepts only normalized startup facts:

- process started;
- readiness reached;
- schema remained valid;
- startup latency;
- stdout byte count;
- stderr byte count.

Raw stdout, raw stderr, exception text, credentials, environment values, prompts, and MCP responses have no field in the supervisor snapshot.

Transport exceptions are collapsed to `transport-failure`. Output-limit and schema/readiness failures are represented only by normalized blocker identifiers.

## Time and output bounds

Every launch plan carries explicit:

- startup timeout;
- maximum stdout bytes;
- maximum stderr bytes;
- argument count limit;
- per-argument byte limit.

A transport adapter is expected to enforce these during process I/O. The supervisor independently rejects returned evidence that exceeds the declared policy, so an adapter cannot report an over-limit launch as healthy.

The upcoming stdio adapter must also enforce newline-delimited JSON-RPC framing and reject an over-limit frame before buffering unbounded output.

## Circuit breaker

The supervisor tracks a bounded attempt count and consecutive failures. When `circuit_failure_threshold` is reached it enters `circuit-open` and refuses further transport activity.

Reset requires a separate explicit approval call. Resetting clears the bounded attempt/failure counters and returns the supervisor to `stopped`; it does not automatically relaunch the server.

There is intentionally no uncontrolled retry loop or timer-driven background restart in this slice.

## What this slice does not do

This implementation does **not**:

- call `subprocess.Popen` or launch a real process by itself;
- resolve environment values or secrets;
- install packages;
- permit shell wrappers;
- download MCP packages;
- implement the live MCP JSON-RPC framing loop;
- execute `server/discover`, `initialize`, `tools/list`, or tool calls;
- persist raw process logs;
- auto-reset circuits;
- run in the background;
- mutate Unreal, Blender, Git, files, cloud resources, or external services.

The new protocol layer only builds and validates negotiation decisions; it does not gain process or tool execution authority.

## Verification

`test/maria-mcp-process-supervisor.test.py` covers:

1. approved exact command/provenance launch planning;
2. no-transport behavior for unapproved gateway state;
3. dynamic package-manager and unresolved-environment denial;
4. schema/output-limit failure normalization without raw-output retention;
5. circuit opening after bounded failures plus explicit reset approval.

`test/maria-mcp-process-path-policy.test.py` separately proves that bare PATH-resolved executable names are denied by default.

`test/maria-mcp-protocol-negotiation.test.py` covers:

1. current `server/discover` request metadata for MCP `2026-07-28`;
2. modern discovery success without legacy fallback;
3. modern version-error negotiation without `initialize` downgrade;
4. timeout/ordinary error fallback to the `2025-11-25` legacy lifecycle;
5. fail-closed behavior when a confirmed modern server has no mutually supported modern version;
6. explicit legacy `initialize` request construction.

The protocol test was introduced before `maria_runtime.mcp_protocol` and produced the expected hosted failure. The implementation then turned the same CI gate green without weakening the test.

## Next safe slice

Add a concrete local stdio transport with `shell=False`, exact reviewed executable paths, bounded newline-delimited JSON-RPC frames, explicit child shutdown/termination, and the `MCPProtocolNegotiator` as its lifecycle planner. The adapter should probe `server/discover` first and only use the legacy `initialize` lifecycle when the negotiation decision explicitly selects it. Keep `tools/call` separate until the executor can consume a ready `MCPInvocationPlan`, re-check process health, apply per-call permission, and record redacted invocation evidence.
