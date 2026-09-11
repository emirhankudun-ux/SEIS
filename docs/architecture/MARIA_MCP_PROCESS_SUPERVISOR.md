# MARIA MCP Process Supervisor

## Status

Bounded supervisor-core slice for the MARIA × SEIS Intelligence Fabric. The policy, lifecycle, redacted evidence, attempt budget, and circuit-breaker contracts are implemented. A concrete subprocess transport, environment/secret resolver, MCP stdio framing loop, and MCP method executor are still deliberately absent.

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
injected process transport
```

A later per-method invocation still requires `MCPInvocationGuard` and a fresh `PermissionEngine` decision. Process approval is therefore not tool-call approval.

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
- implement MCP JSON-RPC framing;
- perform `initialize`, `tools/list`, or tool calls;
- persist raw process logs;
- auto-reset circuits;
- run in the background;
- mutate Unreal, Blender, Git, files, cloud resources, or external services.

Those capabilities require separate reviewed adapters and permissions.

## Verification

`test/maria-mcp-process-supervisor.test.py` covers:

1. approved exact command/provenance launch planning;
2. no-transport behavior for unapproved gateway state;
3. dynamic package-manager and unresolved-environment denial;
4. schema/output-limit failure normalization without raw-output retention;
5. circuit opening after bounded failures plus explicit reset approval.

The test was introduced before the module and produced the expected hosted `ModuleNotFoundError`; the implementation then turned the same CI gate green without weakening the test.

## Next safe slice

Add a concrete local stdio transport with no shell, no redirects/network side effects, bounded process I/O, explicit child termination, and MCP `initialize`/schema discovery only. Keep tool invocation separate until the executor can consume a ready `MCPInvocationPlan`, re-check process health, apply per-call permission, and record redacted invocation evidence.
