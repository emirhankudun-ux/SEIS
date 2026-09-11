# Next bounded milestones

## Current checkpoint — alpha.4

Truthful simulation/live separation, fail-closed demo policy, cancellation, bounded execution, isolated observers, conflict-aware facts, strict plugin metadata and regression/browser checks.

## Next highest-value milestone

Connect one real local-model adapter through a trusted host **using the alpha.4 provider supervisor**. The supervisor now covers bounded handshake/health evidence, capability discovery, expiry and failure isolation; the missing piece is a real host adapter plus attributable execution/verification. Keep the existing UI and independently test the full request path. Do not claim it is present today.

## Subsequent gates

1. Native Apple host and OS permissions with scoped, reversible actions.
2. Real voice and explicit capture indicators; no fake listening states.
3. MCP discovery, authenticated tools, per-action authorization and actual outcome checks.
4. Unreal/Blender adapters validated against an installed engine and real project.
5. Durable memory with provenance, deletion and export.
6. Stoppable scheduling, recovery and deployment hardening.

Prefer one verified end-to-end capability over many ready-looking but unconnected catalogs. Testing remains part of implementation, not only a final percentage of a time budget.


### Alpha.4 completed scope
- provider lifecycle contract and health state transitions
- safe preference persistence
- permission-enforced Plugin Host v2
- bounded plugin timeouts and crash isolation
- orchestrator execution journal
- expanded regression suite (71 Node tests)
- provider supervisor with bounded probe timeout, capability anti-escalation, health TTL, cancellation and per-provider probe deduplication
- offline Chromium acceptance (17 checks)

### Next highest-value work
1. connect a real local-model adapter to the provider supervisor through a trusted host;
2. MCP capability discovery adapter;
3. server-side OpenAI adapter (no browser secrets);
4. local-model adapter;
5. native macOS permission bridge after the web contract is stable.
