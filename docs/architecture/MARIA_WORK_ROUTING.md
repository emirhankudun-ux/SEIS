# MARIA Multi-Step Work Routing

Status: draft planning boundary for `feature/maria-intelligence-fabric-v1`.

## Purpose

`MultiStepWorkRouter` turns a bounded dependency graph into a deterministic route plan while preserving the central SEIS trust rule: **thinking and external execution are different authorities**.

The planner performs no model inference and invokes no tool. It only decides which verified model or tool *would* be eligible for each step.

## Route chain

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
WorkRoutePlan (metadata only)
```

## Invariants

- A plan must contain at least one step.
- The plan has an explicit maximum step count (default 32).
- Step identifiers are unique and non-empty.
- Dependencies must refer to known steps.
- Self-dependencies and dependency cycles are rejected.
- Input order is preserved when multiple steps are simultaneously eligible.
- Execution routes never fall back to a model.
- Model routes never acquire external execution authority.
- Tool project-scope restrictions remain enforced by `CapabilityRegistry`.
- Sensitive cognition retains the existing local-first privacy bias in `ModelRouter` when an eligible local model exists.
- Route planning is side-effect free: no prompt, network call, subprocess, MCP invocation, file mutation, repository mutation, deployment, or external action occurs.

## Why this exists

MARIA needs to support requests such as:

```text
1. reason about a repository problem
2. inspect the repository with a verified tool
3. reason about the evidence
4. prepare a proposed modification
5. execute only after the separate permission boundary approves it
```

Without a separate work planner, a system can accidentally blur "the model knows how to use Git" with "the model has permission to modify Git". `MultiStepWorkRouter` keeps those domains explicit before any future execution orchestrator is introduced.

## Current scope

`WorkStepRequest` contains:

- stable `step_id`;
- a `CapabilityRequest`;
- dependency IDs.

`WorkRoutePlan` contains topologically ordered `WorkRouteStep` records and a `requires_execution` summary bit. A `WorkRouteStep` contains only the original request, dependency metadata, and the `RouteDecision` selected by `UnifiedCapabilityRouter`.

No hidden prompt, model output, credential, tool parameter, permission token, or execution result is part of this planning contract.

## Next safe layer

A future execution orchestrator may consume this plan only if it keeps the existing boundaries intact:

1. cognition steps must call an explicitly selected provider/model adapter;
2. execution steps must obtain fresh tool health and per-action permission evidence;
3. MCP steps must obtain a fresh short-lived `MCPInvocationPlan` and use the single-use executor;
4. each completed step should produce redacted evidence for dependent steps;
5. retries must be explicit and idempotency-aware rather than automatic;
6. plan execution must stop on failed dependencies instead of silently skipping trust checks.

Until those contracts exist, `MultiStepWorkRouter` remains planning-only by design.
