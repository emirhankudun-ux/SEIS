# MARIA Intelligence Fabric v1

## Status

Active draft foundation on `feature/maria-intelligence-fabric-v1`.

The branch now implements verified provider/model discovery metadata, bounded local-runtime discovery for LM Studio and Ollama, evidence-backed model routing, repository federation foundations, redacted MCP config import, trust/approval evaluation, bounded MCP process supervision, MCP protocol negotiation/framing, a bounded local stdio transport, one-shot environment resolution, and a permission-gated short-lived single-use MCP invocation path.

Nothing in this branch automatically calls a real external MCP method, installs packages, resolves cloud credentials, performs model inference/downloads, mutates GitHub/Unreal/Blender, automates GUIs, deploys, publishes, bills, or creates uncontrolled background agents.

## Purpose

MARIA is the human-facing intelligence of SEIS. The Intelligence Fabric is the provider + tool boundary that lets MARIA combine multiple AI providers and integrations without hard-wiring the product to one vendor or treating discovery as execution authority.

Initial logical provider families are:

- OpenAI
- Codex
- DeepSeek
- Qwen
- Gemini
- Abacus AI
- Ollama
- LM Studio

Provider entries are routing metadata, not authenticated connections or permanent model rankings.

## Architecture boundary

```text
MARIA
  |
  +-- Project Context / Continuation
  |
  +-- Intelligence Fabric
  |     +-- Provider Registry
  |     +-- Provider Discovery Adapter
  |     +-- Local Runtime Probe
  |     +-- Local Discovery Coordinator
  |     +-- Local Health Evidence Ledger
  |     +-- Local Runtime Status Snapshot
  |     +-- Model Registry / Router / Route Explanation
  |     |
  |     +-- MCP Config Import Preview
  |     +-- MCP Gateway (trust + server approval)
  |     +-- Capability Registry / Unified Capability Router
  |     +-- MCP Environment Resolver (one-shot lease)
  |     +-- MCP Process Supervisor
  |     +-- MCP Protocol Negotiator + Stdio Frame Codec
  |     +-- MCP Stdio Process Transport
  |     +-- MCP Invocation Guard
  |     +-- MCP Invocation Executor
  |
  +-- Permission Engine (per action)
  +-- Verification / Redacted Evidence
```

The core rule is simple: **observation, routing, approval, process launch, and external execution are separate trust domains.** Passing one boundary never implicitly grants the next.

## Provider and model discovery

`ProviderRegistry` exposes stable provider identities, broad routing capabilities, locality, and explicit connection state. It performs no network calls and does not select a permanent winner.

`ProviderDiscoveryAdapter` converts already-redacted verified discovery facts into routable `ModelSpec` values. It fails closed:

1. unknown providers are rejected;
2. unverified facts remain discovery-only;
3. unreachable endpoints are unavailable;
4. reachable cloud endpoints without confirmed auth are `auth-required`;
5. only verified reachable auth-ready facts become routable models;
6. local models retain local privacy metadata;
7. credentials, tokens, headers, prompts, and raw discovery payloads have no field in routing metadata.

## Local runtime discovery

`LocalRuntimeProbe` permits only bounded metadata access to already-running LM Studio and Ollama services on literal loopback. It does not accept arbitrary hosts, redirects, credentials, unbounded responses, runtime launch, model download, or inference.

`LMStudioV1DiscoverySource` consumes LM Studio's native model metadata and only advertises capabilities explicitly exposed by the runtime.

`OllamaTagsDiscoverySource` produces inventory candidates; `OllamaShowDiscoverySource` enriches a named model using explicit Ollama metadata. Coding, vision, reasoning, or tool-use capabilities are never inferred from model names.

`LocalDiscoveryCoordinator` binds inventory, show-probes, health evidence, provenance, and minimum evidence thresholds. A model is withheld from routing until discovery/parsing/health evidence is mature enough to support the claim.

`LocalRuntimeSnapshotBuilder` exposes frozen redacted UI-safe status facts. `ModelRouter.explain_select()` returns inspectable route evidence without leaking provider payloads or credentials.

## MCP import and gateway

`MCPConfigImporter` creates a disabled review preview. It validates server shape, command/args, transport and environment keys, retains only environment **key names**, discards imported values, identifies secret-like keys, and flags shell-wrapper/manual-review launchers.

`MCPGateway` then consumes separately obtained redacted health/schema/provenance facts. A server remains disabled until trust conditions pass and explicit server enablement is recorded. Every discovered method preserves its own `ActionClass` for the `PermissionEngine`.

There are therefore independent approval boundaries:

1. server trust/enablement;
2. process-launch policy;
3. per-action permission;
4. fresh invocation authorization.

Server approval is never blanket mutation authority.

## Unified capability routing

`UnifiedCapabilityRouter` keeps cognition and execution separate.

- Cognitive work is routed through verified model metadata and `ModelRouter`.
- Real external execution is routed only through verified `ToolSpec` capabilities.

A language model cannot satisfy an execution request simply because it advertises a similarly named capability. Project support constraints also remain explicit.

## MCP process supervision

`MCPProcessSupervisor` accepts only reviewed descriptors and approved gateway evaluations under an explicit `MCPProcessPolicy`.

The supervisor enforces:

- exact executable allowlists;
- exact provenance allowlists;
- PATH lookup disabled by default;
- dynamic package-manager launchers disabled by default;
- startup/output/argument bounds;
- bounded attempt budget;
- circuit breaker with explicit reset approval;
- normalized lifecycle evidence without raw stdout/stderr/exception text.

Environment-bearing descriptors are blocked until an exact matching resolved environment lease is supplied.

## Secret and environment boundary

Imported MCP environment values are never trusted or retained. `MCPEnvironmentResolver` resolves only the key names declared by the reviewed descriptor and only after the MCP server is approved.

The resolver returns an `MCPResolvedEnvironmentLease`:

- scoped to one MCP server;
- containing exactly the reviewed key set;
- redacted in `repr`/lifecycle evidence;
- materializable only once;
- marked consumed after materialization;
- rejected when reused, mismatched, missing, or supplied for undeclared keys.

The current implementation defines a generic `MCPSecretSource` protocol. A future macOS adapter should resolve values from Keychain or an equivalent OS credential store. The repository does not contain secret values.

Python cannot guarantee physical zeroization of immutable strings, so the runtime deliberately claims **minimal retention**, not cryptographic zeroization.

## Bounded stdio transport

`MCPStdioProcessTransport` executes only an already-reviewed absolute executable/argv launch plan with `shell=False`, binary pipes, closed inherited file descriptors, and bounded startup/output behavior.

Direct non-empty environment injection into the transport is rejected. The child environment defaults to `{}`. When a reviewed launch plan carries an environment lease, the transport materializes it exactly once immediately before spawning the child. Environment values are never copied into transport snapshots or retained evidence.

The transport negotiates MCP protocol state, performs bounded correlated JSON-RPC exchange, drains stderr without retaining content, and shuts down through explicit wait → terminate → kill escalation. Timeouts fail closed; no replacement child or retry is launched automatically.

## Invocation freshness and replay resistance

`MCPInvocationGuard` performs a fresh `PermissionEngine` check for every MCP method/target. It returns an `MCPInvocationPlan` only for the exact discovered capability and includes an in-memory lifecycle identity:

- high-entropy `plan_id`;
- monotonic issue time;
- monotonic expiry;
- default lifetime 30 seconds;
- hard maximum lifetime 300 seconds.

`MCPInvocationExecutor` independently validates the plan, transport/server identity, child health, lifecycle timestamps, request ID, timeout, and response bound.

Immediately before transport execution it atomically claims the plan. The same plan cannot be replayed. Success, transport failure, JSON-RPC error, or malformed response all consume the authorization attempt. Any retry requires a fresh permission decision and new plan.

Consumed identifiers are retained only until their short expiry and then pruned, bounding replay-state memory.

## Evidence rules

Retainable execution evidence may include only normalized lifecycle facts such as:

- tool identity;
- capability/method;
- action class;
- permission allowed state;
- request ID;
- success/failure category;
- response byte count;
- duration;
- numeric JSON-RPC error code when available.

It must not persist:

- request parameters;
- permission targets;
- raw tool results;
- secret values;
- server error messages/data;
- stdout/stderr content;
- exception text;
- hidden prompts or model output.

## Current safety boundary

This branch now contains a real bounded local stdio process transport and a real permission-gated invocation executor, but **nothing invokes them automatically** and tests use injected/fake processes/transports. No real external MCP method is called by the test suite.

Still deliberately excluded:

- automatic package installation;
- arbitrary executable launch;
- cloud-provider authentication/execution;
- automatic model loading/download/inference;
- real GitHub/Unreal/Blender mutations;
- GUI automation;
- deployment/publication/billing;
- uncontrolled autonomous background agents.

## Next slices

1. OS-native secret-source adapter contract and macOS Keychain integration without secret-bearing logs.
2. Verified local-model capability enrichment where runtime metadata is insufficient, without model-name heuristics.
3. Multi-step work routing that composes model reasoning with one or more permission-gated tool routes without collapsing trust domains.
4. SwiftUI Integration Center for provider/MCP/runtime status, imports, approvals, health evidence, route explanations, and secure secret-state indicators.
5. Cloud provider discovery/auth adapters preserving the same redacted evidence model.
6. End-to-end integration tests using a purpose-built harmless local MCP fixture before any real project integration is enabled.
