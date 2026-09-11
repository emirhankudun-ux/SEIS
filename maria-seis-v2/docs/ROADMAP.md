# Next bounded milestones

## Current checkpoint — alpha.4

Truthful simulation/live separation, fail-closed permission policy, cancellation, bounded execution, isolated observers, conflict-aware facts, strict plugin metadata, provider supervision, host-adapter lifecycle and attributed live-receipt verification.

## Completed alpha.4 scope

- provider lifecycle contract and health state transitions;
- safe preference persistence;
- permission-enforced Plugin Host v2;
- bounded plugin timeouts and crash isolation;
- execution journal with redaction;
- provider supervisor with bounded probe timeout, capability anti-escalation, health TTL, cancellation and per-provider probe deduplication;
- host adapter API v2 (`connect`, `health`, `execute`, `disconnect`);
- capability-gated execution through `createHostAdapterManager`;
- dependency-injected `LiveRuntimeAdapter`;
- attributed live receipt verification and journal evidence;
- fresh combined regression suite: **80 Node tests**;
- offline Chromium acceptance: **17 checks**.

## Next highest-value milestone

Connect **one real local-model adapter** through a trusted host. Reuse the provider supervisor for fresh readiness evidence and the host-adapter manager for execution. The adapter must expose actual health/model identity, verified capabilities, cancellation, attributable responses and explicit evidence. Do not add a second live provider until the first path is reproducible end to end.

## Subsequent gates

1. MCP capability discovery + authenticated tool execution through the same host contract.
2. Server-side OpenAI adapter with no browser-side secrets.
3. Native Apple host and scoped macOS permissions with reversible actions.
4. Real voice with explicit capture indicators and interruption.
5. Unreal/Blender adapters validated against installed versions and a real project.
6. Durable memory with provenance, deletion and export.
7. Stoppable scheduling, crash recovery and deployment hardening.

Prefer one verified end-to-end capability over many ready-looking but unconnected catalogs. Testing remains part of implementation, not only a final percentage of a time budget.
