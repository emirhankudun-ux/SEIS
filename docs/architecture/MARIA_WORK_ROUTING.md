# MARIA Multi-Step Work Routing & Execution

Status: implemented bounded planning + execution boundary on `feature/maria-intelligence-fabric-v1`.

## Purpose

MARIA needs to decompose one request into cognition and tool steps without confusing model competence with external authority. `MultiStepWorkRouter` creates a deterministic, side-effect-free route plan. `WorkPlanExecutor` can then execute that already-routed plan through explicitly supplied model/tool runners while preserving dependency, retry, permission, and evidence boundaries.

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
per-step runner
       ├── model step → explicit model runner
       └── MCP tool step → MCPWorkStepRunner
                            ↓
                       fresh MCPInvocationGuard.plan()
                            ↓
                       single-use MCPInvocationExecutor
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

A failed or blocked dependency blocks every dependent step without invoking that step's runner. This prevents a later tool call from running on missing or invalid upstream evidence.

## Retry and idempotency policy

Retries are opt-in rather than automatic.

- Model steps may retry only when the runner explicitly marks the failure retryable and the step policy allows another attempt.
- Tool steps with more than one attempt require `idempotent=True` and a stable `idempotency_key` during preflight.
- For MCP work, `MCPWorkStepRunner` adds a second enforcement layer: the idempotency key must be explicitly bound to a concrete MCP method parameter. If no parameter binding exists, retry fails closed before invocation.
- Only a normalized MCP transport failure is retryable by the MCP runner. JSON-RPC/application failures are not automatically retried.

This prevents a timeout from silently becoming a duplicated repository, file, Unreal, Blender, deployment, or other external mutation.

## Fresh MCP authorization per attempt

`MCPWorkStepRunner` deliberately does **not** accept a pre-built `MCPInvocationPlan`.

Every `run()` call:

1. validates the routed tool identity and capability against the approved MCP gateway evaluation;
2. builds invocation parameters for that attempt;
3. injects the stable idempotency key only when an explicit tool-parameter binding exists;
4. calls `MCPInvocationGuard.plan()` again for a fresh permission decision and short-lived plan;
5. creates a fresh correlated request ID;
6. passes the plan to `MCPInvocationExecutor`, which independently validates plan freshness, single-use state, server identity, live transport health, response correlation, and byte bounds.

A permission denial is normalized before the executor is called. A consumed or stale invocation plan cannot be reused by the work orchestrator because the orchestrator never stores one.

## Result and evidence boundary

`WorkStepRunResult` is transient and may carry the in-memory result needed by dependent steps.

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

## Current MCP work binding

`MCPWorkStepBinding` carries runtime policy metadata and a parameter factory rather than precomputed parameters. Permission targets and parameter-factory internals are excluded from its representation. It binds one routed work step to one already-reviewed `MCPGatewayEvaluation` and can optionally define the concrete parameter name used for an idempotency key.

This is an orchestration boundary, not an autonomous integration registry. Real GitHub, Unreal, Blender, deployment, billing, destructive, or other high-impact actions are still subject to their existing server approval, process policy, live health, and per-action permission boundaries.

## Current exclusions

This slice does not:

- auto-create or approve work plans;
- install or start arbitrary MCP packages;
- bypass per-action permission checks;
- cache authorization across retries;
- automatically retry non-idempotent tool operations;
- persist raw intermediate results;
- execute uncontrolled background work;
- provide crash-resumable durable checkpoints yet;
- provide a concrete cloud/local model inference runner yet.

## Next safe layers

1. Add an explicit bounded model-step runner that consumes the selected `ModelSpec`, enforces context/output limits, and records redacted provider evidence.
2. Add in-memory cancellation plus checkpoint summaries so a longer plan can stop safely between steps without persisting raw payloads.
3. Surface work-plan status, blockers, approvals, and route explanations in the SwiftUI Integration Center.
4. Add carefully selected real MCP integration pilots only after the same fresh-per-attempt authorization and idempotency contracts remain green.
