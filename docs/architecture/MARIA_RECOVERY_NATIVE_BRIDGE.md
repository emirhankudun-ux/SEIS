# MARIA Recovery Native Bridge v1

## Purpose

`maria_runtime.recovery_native_bridge` is a narrow presentation adapter between the validated MARIA recovery dashboard wire contract and future native desktop clients such as SwiftUI.

The adapter does not own recovery state and does not execute recovery work. It accepts an immutable `RecoveryDashboardWireSnapshot` and produces immutable platform-neutral presentation records with stable status labels, severities, public-safe detail fields, and summary counters.

## Presentation mapping

Wire schema v1 dispositions map to presentation metadata as follows:

| Disposition | Status label | Severity | Re-plan required |
| --- | --- | --- | --- |
| `anchor-missing` | `Recovery anchor missing` | `warning` | yes |
| `evidence-required` | `Current evidence required` | `warning` | yes |
| `drift-detected` | `Context drift detected` | `critical` | yes |
| `aligned-replan-required` | `Aligned; re-plan required` | `info` | yes |
| `complete` | `Complete` | `success` | no |

`disposition` remains available as the stable machine/localization key. Native clients may localize the display label, but they must not reinterpret severity or authorization semantics.

## Public-safe details

Only already-redacted wire metadata is carried forward. `detail_fields` is populated from:

- `drift_fields` for `drift-detected` rows;
- `missing_context` for `evidence-required` rows;
- an empty tuple for all other states.

The bridge may expose `work_id`, durable schema version, next step identifier, summary counters, and the bounded detail-field names already accepted by the wire contract. It does not expose checkpoint bodies, recovery anchors, prompts, model/tool output, credentials, permission decisions, arbitrary workspace content, callbacks, commands, or execution tokens.

## Fail-closed validation

Even though the normal source is the strict wire decoder, the adapter validates typed snapshots again because Python dataclasses can be constructed directly in-process. It rejects:

- unknown or boolean wire schema versions;
- unsupported dispositions;
- invalid project/work identifiers;
- rows belonging to a different project;
- unsorted or duplicate work identifiers;
- invalid durable schema versions;
- missing next-step identifiers for incomplete candidates;
- next-step identifiers on complete candidates;
- drift/evidence detail fields that do not match the row disposition;
- duplicate or unbounded detail-field names;
- summary counters inconsistent with the actual rows.

This validation is not a second recovery engine. It protects the presentation boundary from forged or stale in-memory metadata.

## No action surface

`RecoveryNativeSnapshot` and `RecoveryNativeRow` are frozen presentation records. Both expose `execution_authorized == False`. They intentionally have no `action`, `resume`, `can_resume`, command callback, provider handle, credential handle, or permission-grant field.

A native UI may display that a candidate requires re-planning, but it must not convert that presentation state into execution. Any future resume workflow must remain a separate explicitly authorized runtime path that performs fresh planning, routing, permission, MCP/tool, and per-attempt authorization checks.

## Platform boundary

The runtime remains platform-neutral. SwiftUI, AppKit, web, or another client consumes the adapter output; those clients do not become sources of recovery truth or authorization by rendering it.

## Verification

Focused contract: `test/maria-recovery-native-bridge.test.py`.

The contract was introduced test-first. The initial stacked commit imports the absent bridge module so hosted MARIA regression CI can prove the requirement red before implementation. The implementation then restores the contract without widening persistence or execution authority.
