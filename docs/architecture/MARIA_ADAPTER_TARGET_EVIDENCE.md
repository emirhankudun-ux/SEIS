# MARIA × SEIS Adapter Target Evidence Contract

Status: bounded runtime safety contract; no live execution authority.

## Purpose

Future MARIA × SEIS adapters must not ask the permission layer to authorize a free-form label and then act on a differently resolved resource. `AdapterTargetEvidence` binds four pieces of host-owned evidence before permission evaluation:

- the adapter identity that performed resolution;
- the exact target requested by the caller;
- the exact resource identity resolved by the adapter;
- the provenance of that resolution plus its observation time.

`PermissionEngine.evaluate_resolved(...)` validates that evidence is exact and fresh, then evaluates policy against the resolved resource identity. The resulting `PermissionDecision` carries the same evidence snapshot for later audit/recovery work.

## Fail-closed rules

Adapter id, requested target, resolved target and provenance must be exact non-empty strings with no leading/trailing whitespace or ASCII control characters. They are recorded without trimming or normalization.

`observed_at` and an injected/evaluated `now` must be timezone-aware `datetime` values. Evidence from the future is rejected. Evidence older than the explicit `max_age` window is rejected. `max_age` must be a positive `timedelta`.

The default freshness window is five minutes. Hosts may choose a smaller action-specific window. A larger window is policy, not proof that the underlying resource is still unchanged.

## Authority boundary

Target evidence is descriptive safety evidence only. It does not authenticate an adapter, prove that the resource still exists, grant permission, satisfy owner approval, make an action reversible, or perform an external side effect.

A mutating action with valid target evidence still receives the same explicit-approval decision as any other mutation. Live adapters remain responsible for:

1. resolving the target from their own authoritative API or host state;
2. creating evidence only from that result;
3. evaluating permission immediately before the effect boundary;
4. re-resolving when the evidence is stale or the resource version changes;
5. recording provider/resource version identifiers when available;
6. refusing execution when fresh resolution or required approval is unavailable.

## Current limitation

The runtime now defines and tests the binding contract but does not yet ship a live GitHub, MCP, model-provider, filesystem, computer-control, Unreal or Blender mutation adapter. Therefore this work must not be presented as live execution readiness.

The next safe integration is one read-only adapter that resolves a stable resource identity and emits `AdapterTargetEvidence`, followed by a verifier that proves stale/mismatched evidence is never reused for a later mutation.
