# MARIA Multi-Step Work Routing & Execution

Status: implemented bounded planning + execution boundary on `feature/maria-intelligence-fabric-v1`.

## Purpose

MARIA needs to decompose one request into cognition and tool steps without confusing model competence with external authority. `MultiStepWorkRouter` creates a deterministic, side-effect-free route plan. `WorkPlanExecutor` then executes that already-routed plan through explicitly supplied bounded model/tool runners while preserving dependency, retry, cancellation, permission, context-budget, and evidence boundaries.

The central rule remains: **thinking and external execution are different authorities**.

## Route and execution chain

```text
WorkStepRequest[]
       ↓
validate ids / dependencies / max step count
       ↓
deterministic topological order
       ↓
UnifiedCapabilityRouter
       ├── cognition → ModelRouter → verified ModelSpec
       └── execution → CapabilityRegistry → verified ToolSpec
       ↓
WorkRoutePlan
       ↓
WorkPlanExecutor preflight
       ├── route/request authority consistency
       ├── dependency ordering
       ├── bounded attempt budget
       └── retry/idempotency contracts
       ↓
cancellation check before step / retry attempt
       ↓
per-step runner
       ├── model step → ModelWorkStepRunner
       |                   ├── route/model/capability revalidation
       |                   ├── context + output token bounds
       |                   └── explicit provider adapter
       └── MCP tool step → MCPWorkStepRunner
                            ├── live approval provider per attempt when needed
                            ├── fresh MCPInvocationGuard.plan()
                            └── single-use MCPInvocationExecutor
       ↓
redacted WorkPlanCheckpoint
```

## Planning invariants

- A plan must contain at least one step.
- The planner has an explicit maximum step count (default 32).
- Step identifiers are unique and non-empty.
- Dependencies must refer to known steps.
- Self-dependencies and dependency cycles are rejected.
- Input order is preserved when multiple steps are simultaneously eligible.
- Execution routes never fall back to a model.
- Model routes never acquire external execution authority.
- Tool project-scope restrictions remain enforced by `CapabilityRegistry`.
- Sensitive cognition retains the existing local-first privacy bias in `ModelRouter` when an eligible local model exists.
- Route planning remains side-effect free.

## Bounded execution invariants

`WorkPlanExecutor` consumes a pre-routed `WorkRoutePlan`; it does not reroute work and does not invent authority.

Before invoking any runner it validates:

- unique step identities;
- known and already-ordered dependencies;
- route capability equals request capability;
- `execution_required` exactly matches a tool route;
- `requires_execution` agrees with the actual routed steps;
- execution policies refer only to known steps;
- each step has at most 3 attempts;
- the total configured attempt budget remains bounded.

A failed or blocked dependency blocks every dependent step without invoking that step's runner. This prevents a later tool call or model step from running on missing or invalid upstream evidence.

## Cooperative cancellation and checkpoints

`WorkPlanExecutor.execute()` accepts an optional in-memory `cancel_requested` callback. It is checked before each step and again before every retry attempt.

Cancellation is fail-closed:

- `True` marks the current and remaining work `CANCELLED` without starting a new attempt;
- callback exceptions become normalized `cancellation-source-failure` evidence without retaining exception text;
- non-boolean callback output becomes `cancellation-source-invalid`;
- already completed successful steps remain successful;
- cancellation between retries preserves the number of already completed attempts and prevents the next attempt;
- cancellation is distinct from dependency failure and does not masquerade as `BLOCKED`.

`WorkPlanExecutionResult.checkpoint()` returns a `WorkPlanCheckpoint` that contains only `WorkStepExecutionEvidence`, state counts, completion state, and the first cancelled step as `next_step_id`. It deliberately excludes transient model/tool results, prompts, parameters, dependency payloads, secrets, permission targets, and raw exceptions.

This is a redacted **status/checkpoint summary**, not crash-resumable raw-state persistence. A future durable-resume design must define safe rehydration separately rather than serializing transient work payloads.

## Retry and idempotency policy

Retries are opt-in rather than automatic.

- Model steps may retry only when the bounded model adapter returns one of the explicitly recognized transient failure categories and the step policy allows another attempt.
- Tool steps with more than one attempt require `idempotent=True` and a stable `idempotency_key` during preflight.
- For MCP work, `MCPWorkStepRunner` adds a second enforcement layer: the idempotency key must be explicitly bound to a concrete MCP method parameter. If no parameter binding exists, retry fails closed before invocation.
- Only a normalized MCP transport failure is retryable by the MCP runner. JSON-RPC/application failures are not automatically retried.

This prevents a timeout from silently becoming a duplicated repository, file, Unreal, Blender, deployment, or other external mutation.

## Fresh MCP authorization and approval per attempt

`MCPWorkStepRunner` deliberately does **not** accept a pre-built `MCPInvocationPlan` and does not store a durable high-risk approval bit.

Every `run()` call:

1. validates the routed tool identity and capability against the reviewed MCP gateway evaluation;
2. builds invocation parameters for that attempt;
3. injects the stable idempotency key only when an explicit tool-parameter binding exists;
4. re-reads an optional live `approval_provider` for the current attempt; absence, provider failure, invalid output, or a withdrawn approval fails closed for approval-required actions;
5. calls `MCPInvocationGuard.plan()` again for a fresh permission decision and short-lived plan;
6. creates a fresh correlated request ID;
7. passes the plan to `MCPInvocationExecutor`, which independently validates plan freshness, single-use state, server identity, health, request correlation, and byte bounds.

A permission denial is normalized before the executor is called. A consumed or stale invocation plan cannot be reused by the work orchestrator because the orchestrator never stores one. A retry also cannot inherit an approval from a previous attempt.

## Bounded model cognition per attempt

`ModelWorkStepRunner` is the corresponding concrete cognition boundary. It accepts only MODEL routes and one explicit `ModelWorkStepBinding` for the already-selected model.

Before invoking the provider adapter it revalidates:

- routed model identity;
- model availability;
- canonical required capability;
- declared input-context estimate;
- binding output-token limit;
- total estimated input + output budget against the model context window.

The provider adapter receives a transient `ModelWorkInput` and explicit timeout/output bounds. After invocation, reported output-token and total context usage are checked again. Adapter exceptions are normalized without retaining exception text, and arbitrary provider-declared retryability cannot bypass the fixed transient-failure allowlist.

The runner performs no provider discovery, credential lookup, runtime launch, model download, or network setup by itself; those remain explicit adapter responsibilities under their own trust boundaries.

## Result and evidence boundary

`WorkStepRunResult` and `WorkStepExecutionResult` may carry transient in-memory results needed by dependent steps, but their result payloads are excluded from `repr` to prevent routine logging/diagnostics from exposing model or tool output.

`WorkStepExecutionEvidence` is the retainable record and deliberately excludes:

- prompts;
- dependency payloads;
- request/tool parameters;
- permission targets;
- model output;
- raw tool output;
- credentials or secrets;
- exception strings.

Retainable evidence contains only normalized execution facts such as step ID, route kind, selected target identity, state, attempt count, dependency IDs, and a normalized failure category.

## Current work bindings

`MCPWorkStepBinding` carries runtime policy metadata, a parameter factory, an optional per-attempt approval provider, and optional concrete idempotency-parameter name rather than precomputed parameters or a cached approval. Sensitive factories/targets are excluded from representation.

`ModelWorkStepBinding` carries the verified `ModelSpec`, an explicit provider adapter, a hidden input factory, and bounded timeout/output settings. Prompt/input payloads and model outputs remain transient and hidden from retained evidence.

These are orchestration boundaries, not autonomous integration/provider registries. Real GitHub, Unreal, Blender, deployment, billing, destructive, cloud-provider, or other high-impact actions remain subject to their existing trust, process, health, credential, and per-action permission boundaries.

## Current exclusions

This slice does not:

- auto-create or approve work plans;
- install or start arbitrary MCP packages;
- bypass per-action permission checks;
- cache authorization or high-risk approval across retries;
- automatically retry non-idempotent tool operations;
- persist raw intermediate results;
- execute uncontrolled background work;
- provide crash-resumable durable work-payload persistence;
- automatically configure or authenticate cloud/local provider adapters;
- automatically load/download models.

## Next safe layers

1. Add explicit provider adapter implementations behind `ModelWorkAdapter`, beginning with already-verified local runtimes and preserving timeout/context/evidence boundaries.
2. Surface provider/MCP/runtime/work-plan status, cancellation, blockers, approvals, route explanations, Keychain state, and redacted checkpoints in the existing macOS/SwiftUI architecture after its current app boundaries are confirmed.
3. Define a durable resume manifest only for data that can be reconstructed safely; never persist raw transient prompts/results merely to resume a plan.
4. Add carefully selected real MCP integration pilots only after the same fresh-per-attempt authorization, live-approval, cancellation, redaction, and idempotency contracts remain green.
