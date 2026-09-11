# MARIA × SEIS Permission Evidence Audit Contract

Status: bounded auditability layer; no live execution authority.

## Decision

`PermissionDecision` retains the exact `ResolvedTargetEvidence` object supplied to `PermissionEngine.evaluate(...)`.

The retention rule applies to every evaluated outcome:

- a fresh verified target-evidence snapshot retained on an allowed approval-required action;
- the same supplied snapshot retained when owner approval is absent;
- stale, future, unverified or mismatched evidence retained on the denied decision that rejected it;
- evidence retained on low-risk read/safe-execute decisions when a host supplies it;
- `None` retained when no evidence was supplied.

This does not alter the authorization policy established by the target-evidence boundary. Approval-required actions still need exact boolean approval plus fresh verified exact-target evidence before they may be allowed.

## Why retain denied evidence

Audit, recovery and verification must be able to explain both successful and rejected decisions without reconstructing security-sensitive context from mutable host state. A stale or otherwise invalid evidence record is useful precisely because the denial must be attributable to the snapshot that was evaluated.

The decision therefore records evidence as immutable descriptive context, not as a capability token. Retaining an evidence object must never make a later request eligible for authorization. Every future effect boundary must perform a fresh permission evaluation.

## Privacy and persistence boundary

This runtime contract keeps evidence in the in-memory decision only. It does not persist, serialize, upload or emit telemetry.

Future execution-journal or approval-receipt adapters must classify target and source identifiers before durable logging, minimize unnecessary resource names, redact secrets and private path components when appropriate, and preserve enough stable identity to correlate the decision with the host-owned resolution event.

## Current limitation

There is still no live GitHub, MCP, filesystem, computer-control, model-provider, Unreal or Blender mutation adapter in this runtime slice. `ResolvedTargetEvidence` remains an adapter-owned typed claim rather than cryptographic proof of resource existence or source authenticity.

## Next safe step

Build a provider-independent execution-journal record that consumes immutable `PermissionDecision` values and records decision/evidence provenance without performing an effect. Only after that record is tested should a read-only real adapter be considered for resource resolution.
