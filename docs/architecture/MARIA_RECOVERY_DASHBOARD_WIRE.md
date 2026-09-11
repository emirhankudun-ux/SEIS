# MARIA Recovery Dashboard Wire Contract v1

## Purpose

`maria_runtime.recovery_dashboard_wire` defines the compact read-only JSON contract between the MARIA recovery dashboard runtime and a future native desktop/SwiftUI presentation layer.

The wire contract serializes only the already-public-safe `RecoveryDashboardSnapshot` view. It is not a checkpoint transport, resume token, authorization object, or persistence format.

## Schema

Wire schema version `1` contains:

- dashboard `project_id`;
- aggregate recovery counters;
- public-safe candidate rows;
- each row's work identifier, candidate disposition, durable schema version, next step identifier, bounded drift-field names, and bounded missing-context names;
- explicit `execution_authorized: false` at both dashboard and row level.

It deliberately contains no checkpoint body, recovery anchor, prompt, model response, tool parameters/output, credentials, permission decisions, arbitrary workspace data, or execution token.

## Encoding

`RecoveryDashboardWireCodec.encode()` emits deterministic compact UTF-8 JSON with sorted keys, no non-finite numeric values, and a hard 64 KiB payload ceiling. The source snapshot is revalidated before serialization so an internally inconsistent host-created dashboard cannot be exported.

## Decoding and trust boundary

`decode()` is fail-closed. It rejects:

- payloads outside the byte bound;
- invalid UTF-8 or JSON;
- duplicate object keys;
- `NaN`, `Infinity`, and `-Infinity`;
- unknown schema versions;
- missing or extra envelope/row fields;
- any attempt to set `execution_authorized` true;
- unknown dispositions;
- invalid or unbounded identifiers;
- duplicate/unbounded drift or missing-context names;
- invalid durable schema versions;
- rows belonging to a different project;
- aggregate counters inconsistent with the actual rows.

Decoded objects are immutable wire snapshots and rows. Their `execution_authorized` property is always `False`.

## Native UI relationship

A future SwiftUI bridge may decode this contract into presentation models, but the bridge must not infer that `aligned-replan-required` means resume is authorized. It means only that the bounded recovery identity checks found no drift. A fresh work plan and current routing, permission, MCP/tool, and per-attempt authorization are still required before execution.

The native UI should treat unknown future schema versions as unsupported rather than guessing field meaning.

## Safety boundary

This module performs no checkpoint writes, migration write-back, replay, rollback, resume, provider call, credential access, permission expansion, paid compute, deployment, or external mutation. Serialization and deserialization are presentation-only transformations.

## Verification

Focused contract: `test/maria-recovery-dashboard-wire.test.py`.

The contract is test-first: the first stacked commit referenced the absent wire module so hosted MARIA regression CI could prove the requirement was red before implementation.
