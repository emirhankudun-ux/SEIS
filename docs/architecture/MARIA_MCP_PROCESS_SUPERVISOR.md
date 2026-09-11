# MARIA MCP Process Supervisor

## Status

Active bounded MCP execution foundation on `feature/maria-intelligence-fabric-v1`.

Implemented layers now include process policy/lifecycle, exact executable and provenance allowlists, attempt budgets, circuit breaking, protocol negotiation, newline-delimited JSON-RPC framing, a concrete bounded stdio process transport, one-shot environment resolution, short-lived invocation plans, and a permission-gated invocation executor.

These layers remain opt-in boundaries. The runtime does not automatically launch or call real project MCP integrations.

## Purpose

`MCPProcessSupervisor` is the policy seam between an approved `MCPGatewayEvaluation` and a concrete MCP process transport. Its job is to prevent a reviewed descriptor from turning directly into unrestricted local process authority.

The supervisor accepts only:

- an imported `MCPServerDescriptor`;
- an already-approved `MCPGatewayEvaluation`;
- exact executable/provenance allowlists;
- explicit startup/output/argument limits;
- an explicitly injected transport adapter;
- when environment keys are declared, a fresh exact-match `MCPResolvedEnvironmentLease`.

The supervisor does not look up secret values itself.

## Trust chain

```text
MCP config import preview
        ↓
redacted descriptor (key names only)
        ↓
verified discovery fact
        ↓
MCP gateway trust + explicit server approval
        ↓
optional secure environment resolver
        ↓
one-shot environment lease
        ↓
MCP process supervisor preflight
        ↓
exact command/provenance allowlists
argument/output/time bounds
attempt budget + circuit breaker
        ↓
MCP stdio process transport
        ↓
protocol negotiation + bounded framing
        ↓
fresh per-call permission + short-lived invocation plan
        ↓
single-use invocation executor
```

Process approval is never equivalent to method approval.

## Fail-closed launch rules

The supervisor refuses transport activity when any of these conditions apply:

- gateway evaluation is not `AVAILABLE`;
- gateway blockers remain;
- gateway/server identities disagree;
- descriptor still requires manual review;
- executable is not an exact allowlist entry;
- provenance identity is missing or not exact-allowlisted;
- the same supervisor is reused for a different server;
- bare PATH lookup is not explicitly allowed;
- a dynamic package-manager launcher is not explicitly allowed;
- an environment-bearing descriptor has no resolved lease;
- the lease is consumed, server-mismatched, or its key set differs from the reviewed descriptor;
- an undeclared environment is supplied;
- argument count/byte/control-character limits fail;
- attempt budget is exhausted;
- circuit is open.

Dynamic package-manager launchers such as `npx`, `pnpx`, `bunx`, `uvx`, and `pipx` remain disabled by default even when present in the command allowlist. The normal safe route is a reviewed absolute executable path.

## Environment lease

Environment configuration follows a separate trust boundary. Imported JSON values are discarded; only key names survive review.

`MCPEnvironmentResolver` obtains values from an injected `MCPSecretSource` only after the server is approved. It returns `MCPResolvedEnvironmentLease`, a one-shot in-memory object scoped to one server and exact reviewed key set.

The supervisor validates the lease but does not materialize it. The concrete stdio transport materializes it exactly once at process spawn. Reuse is rejected.

No secret/environment values are represented in supervisor snapshots or normalized lifecycle evidence.

## Protocol negotiation and framing

`MCPProtocolNegotiator` supports the modern discovery lifecycle and bounded legacy fallback. `MCPStdioFrameCodec` provides one-message-per-line UTF-8 JSON-RPC 2.0 framing with explicit byte limits and normalized redacted failures.

The concrete stdio transport:

- uses `shell=False`;
- requires an absolute executable path;
- passes exact reviewed argv;
- defaults child environment to `{}`;
- rejects direct non-empty environment injection;
- performs bounded startup/protocol negotiation;
- drains stderr without retaining text;
- tracks only byte counts and normalized failure state;
- fails closed on time/output/protocol limits;
- shuts down through bounded wait → terminate → kill escalation.

## Redacted lifecycle evidence

`MCPProcessStartResult` and `MCPProcessSnapshot` retain only normalized process facts such as readiness, schema validity, startup latency, byte counts, attempt count, consecutive failures, state, and blocker identifiers.

They do not retain raw stdout/stderr, JSON-RPC payloads, exception text, credentials, environment values, prompts, or tool results.

## Circuit breaker

The supervisor tracks bounded attempts and consecutive failures. Reaching `circuit_failure_threshold` enters `circuit-open` and prevents further transport attempts.

Circuit reset requires explicit approval and does not relaunch the server automatically. There is no timer-driven retry loop or uncontrolled background restart.

## Invocation boundary

A ready supervised process still cannot be called without a fresh method authorization.

`MCPInvocationGuard` performs the exact discovered-method lookup and fresh `PermissionEngine` evaluation. Its plan is short-lived and carries a high-entropy ID plus monotonic expiry.

`MCPInvocationExecutor` checks transport/server identity and process health, then atomically consumes that plan before one request attempt. Retries require a new permission decision and new plan.

## Verification

The branch has dedicated tests for:

- approved exact command/provenance launch planning;
- unapproved gateway denial;
- PATH and dynamic-package-manager denial;
- environment-resolution requirement and exact lease matching;
- output/schema failure normalization;
- bounded circuit breaking and explicit reset;
- protocol-era negotiation;
- newline-delimited bounded JSON-RPC framing;
- concrete stdio launch/shutdown/request behavior;
- one-shot secret/environment resolution;
- short-lived replay-resistant invocation plans;
- single-use permission-gated invocation execution.

The newest freshness and environment slices were introduced test-first: hosted CI failed at the new missing contracts before implementation, then passed after the production boundaries were added.

## Still deliberately excluded

The implementation does not automatically install/download MCP packages, enable arbitrary shell wrappers, resolve secrets from repository configuration, call cloud providers, mutate Unreal/Blender/Git/files, automate GUIs, deploy, publish, bill, or run uncontrolled autonomous background agents.

The next safe progression is an OS-native `MCPSecretSource` adapter (macOS Keychain preferred) plus an intentionally harmless local fixture server for end-to-end transport/permission tests before enabling any real project MCP integration.
