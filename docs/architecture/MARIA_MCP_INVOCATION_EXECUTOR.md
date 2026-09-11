# MARIA MCP Invocation Executor

Status: draft implementation boundary for `feature/maria-intelligence-fabric-v1`.

## Purpose

`MCPInvocationExecutor` is the execution boundary between an already-approved `MCPInvocationPlan` and a healthy MCP request transport. It does not discover capabilities, approve servers, decide action classes, or grant permissions. Those decisions remain upstream in `MCPGateway`, `PermissionEngine`, and `MCPInvocationGuard`.

## Required chain

A call is eligible only through this chain:

`MCP config/import → verified discovery → approved gateway evaluation → fresh permission decision → ready MCPInvocationPlan → healthy matching transport → MCPInvocationExecutor`

The executor refuses to touch a transport when the plan is not ready, the permission decision is not allowed, the action class has been altered, the tool identity does not match the running server, or the transport has stopped/unresolved failure evidence.

## Per-call invariants

- No automatic retries. Repeating an MCP method can duplicate mutations or external side effects.
- Request IDs must be explicit and responses must correlate to the same ID.
- JSON-RPC must remain version `2.0`.
- Per-call timeout and response-byte limits are mandatory.
- The concrete stdio transport injects negotiated modern MCP protocol metadata and prevents callers from overriding protected metadata keys.
- Transport timeouts fail closed and shut down the child so an abandoned stdout reader cannot race a later request.
- Raw parameters, permission targets, tool results, server error messages, server error data, stderr, and exception text are not persisted in invocation evidence.
- JSON-RPC failures retain only a normalized failure code plus numeric server error code when available.

## Result and evidence

`MCPInvocationResult` may return a successful tool result to the immediate caller. The separately retainable `MCPInvocationEvidence` contains only normalized metadata:

- tool identity,
- capability/method,
- action class,
- whether permission was allowed,
- request ID,
- success/failure,
- encoded response byte count,
- duration,
- normalized failure category,
- numeric JSON-RPC error code when present.

This separation prevents audit/lifecycle logs from becoming a copy of tool output or secret-bearing server responses.

## Concrete stdio integration

`MCPStdioProcessTransport.request()` now implements the executor transport contract for an already-started and negotiated local child. Modern connections receive the negotiated protocol/client `_meta`; legacy connections use the negotiated legacy session. The method uses the existing bounded correlated exchange and performs no retry.

## Still deliberately excluded

This slice does not automatically call any MCP server and does not grant approval for mutating methods. It does not resolve secrets, install packages, launch unapproved executables, call cloud providers, mutate GitHub, alter Unreal/Blender projects, automate GUIs, deploy, publish, bill, or create uncontrolled background agents.

The next safe layer is an explicit secret-resolution boundary for approved MCP descriptors plus invocation-plan freshness/expiry so a previously approved mutating plan cannot be retained indefinitely and replayed later.
