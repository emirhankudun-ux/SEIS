# MARIA × SEIS Permission Audit Envelope v1

Status: shared descriptive interoperability contract; no live execution authority.

## Decision

The current Python MARIA Runtime v18 permission boundary and the existing JavaScript execution-journal foundation must exchange one small, versioned audit payload instead of growing two competing journal implementations.

`permission_decision_audit_envelope(...)` serializes an immutable `PermissionDecision` into `maria.permission-audit.v1`. The same shape is defined by `schemas/maria-permission-audit-envelope-v1.schema.json` so non-Python consumers can validate the boundary without importing runtime internals.

The envelope contains the evaluated action class, exact permission target, allow/deny result, approval requirement, policy reason, reversibility metadata and the exact resolved-target evidence snapshot when one was supplied. Evidence timestamps are normalized to canonical UTC with a `Z` suffix so hosts do not have to compare locale-specific renderings.

`packages/maria-runtime/js/permissionAuditEnvelope.js` is the first cross-runtime consumer. It validates the exact v1 shape, rejects unknown fields and action classes, rejects accessor-backed records, rejects non-canonical timestamps and returns an isolated frozen copy. It does not re-authorize a denied record or infer authority from `allowed: true`.

## Existing journal reconciliation

The open platform foundation already contains `maria-seis-v2/src/core/executionJournal.js` and `journalContract.js`. That journal provides bounded in-memory/persistent records, secret-key redaction, synchronous acknowledgement and fail-closed live-execution audit gating. Those capabilities should be preserved rather than reimplemented in the Python runtime.

This envelope is the narrow compatibility seam between the two layers. A future host may include the validated envelope inside an existing journal record, but this contract does not modify the legacy branch, start an execution, write storage or acknowledge a journal commit.

## Authority boundary

The envelope is descriptive only. It is not an approval receipt, capability token, adapter authentication result, proof of resource existence, proof of provider identity, execution receipt or verification of an external side effect.

Serializing or validating an allowed decision does not make a later action authorized. Every effect boundary must run permission evaluation again with the current exact target and fresh evidence required by policy.

Consumers must not infer broader permissions from the schema version or from `allowed: true` outside the decision's original evaluation context.

## Persistence and privacy boundary

Serialization is not equivalent to safe logging. `target` and `targetEvidence.source` can reveal repository names, resource identifiers, file locations or other private context even when their keys do not match a generic secret-redaction expression.

Therefore the schema declares `x-seis-persistence: host-classified`. Before durable persistence, telemetry or cross-device sync, the host must apply its own classification/minimization policy and redact or tokenize sensitive identifiers where required. The serializer and JavaScript validator perform no persistence and no lossy redaction because doing so would make the audit snapshot ambiguous.

## Determinism and versioning

For an unchanged `PermissionDecision`, serialization is deterministic and returns a fresh mapping each time. The serializer does not mutate the decision or its evidence. The JavaScript consumer likewise returns an isolated frozen copy rather than retaining caller-owned mutable objects.

Canonical `observedAt` values are the exact UTC form emitted by Python `datetime.isoformat()` after UTC normalization: `YYYY-MM-DDTHH:MM:SSZ` when microseconds are zero, or exactly six fractional digits when microseconds are present. The JavaScript boundary rejects alternate offsets, year zero, `24:00:00`, impossible Gregorian dates such as February 30, and shortened fractional forms such as `.1Z`. This avoids accepting timestamps that JavaScript `Date.parse()` would silently normalize into a different instant. The shared schema narrows the lexical shape; the JavaScript validator additionally performs calendar-validity checks because JSON Schema `format` support can be annotation-only depending on the consumer.

`maria.permission-audit.v1` is a semantic boundary. Consumers validate supported schema versions explicitly and fail closed rather than silently reinterpret a future incompatible envelope. Additive or breaking changes must be reflected in the shared schema and focused compatibility tests.

## Current limitation

There is still no live GitHub, MCP, filesystem, computer-control, model-provider, Unreal or Blender mutation adapter in this runtime slice. The existing JavaScript journal lives on the separate open platform-foundation branch, which is large and currently not suitable for wholesale integration merely to obtain this boundary.

The current branch validates both sides of the envelope boundary, but it does not yet prove that the legacy execution journal can carry this exact envelope while preserving its acknowledgement, redaction and bounded-retention semantics.

## Next safe step

Build a narrow journal-interop fixture that embeds a validated `maria.permission-audit.v1` payload in the existing execution-journal record contract and proves fail-closed acknowledgement plus privacy classification behavior. Prefer extracting only the needed journal seam from the platform foundation instead of importing or rewriting the entire branch. Keep the interop test side-effect-free until the complete record lifecycle is proven.
