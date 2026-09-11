# Next bounded milestones

## Current checkpoint — alpha.3

Truthful simulation/live separation, fail-closed demo policy, cancellation, bounded execution, isolated observers, conflict-aware facts, strict plugin metadata, provider lifecycle states, safe preference persistence, permission-enforced plugin hosting and bounded execution journaling.

## Next highest-value milestone

Connect one real local-model adapter through a trusted host. Verify availability with a real health check, obtain model capabilities rather than guessing, return an attributable response and handle disconnect/cancellation. Keep the existing UI and independently test the full request path. Do not claim it is present today.

## Alpha.3 completed scope

- provider lifecycle contract and health state transitions;
- safe allowlisted preference persistence;
- Plugin Host v2 API compatibility and permission grants;
- bounded plugin timeouts and crash isolation;
- orchestrator execution journal with redaction;
- 64 Node tests;
- 17 offline Chromium acceptance checks.

## Subsequent gates

1. Real provider adapter interface with explicit connection handshake.
2. MCP capability discovery and authenticated tool registry.
3. Server-side OpenAI adapter; never browser-side credentials.
4. Local model adapter with measured capability metadata.
5. Native Apple host and OS permissions with scoped, reversible actions.
6. Real voice and explicit capture indicators; no fake listening states.
7. Unreal/Blender adapters validated against an installed engine and real project.
8. Durable project memory with provenance, deletion and export.
9. Stoppable scheduling, recovery and deployment hardening.

Prefer one verified end-to-end capability over many ready-looking but unconnected catalogs. Testing remains part of implementation, not only a final percentage of a time budget.
