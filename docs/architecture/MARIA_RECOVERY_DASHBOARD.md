# MARIA Recovery Dashboard v1

## Purpose

The recovery dashboard provides one bounded, read-only project snapshot over durable recovery candidates. It composes existing recovery primitives instead of adding another recovery or execution engine.

The implementation is `maria_runtime.recovery_dashboard.RecoveryDashboardBuilder`.

## Composition

The dashboard delegates candidate enumeration to `DurableWorkCheckpointStore.discover()` and delegates per-candidate state to `RecoveryCandidateInspector.inspect()`.

This preserves the existing boundaries:

- durable checkpoint files remain validated by the hardened store;
- schema-v1/v2 handling remains owned by durable recovery;
- anchor presence and current-context drift remain owned by the candidate inspector/reconciler;
- discovery limits remain owned by the bounded catalog;
- execution authorization remains outside the dashboard.

## Public-safe snapshot

A `RecoveryDashboardSnapshot` contains only:

- project identifier;
- ordered `RecoveryCandidateView` rows;
- total visible candidate count;
- aggregate counts for replan-required, drift-detected, evidence-required, anchor-missing, aligned-replan-required, and complete states.

It contains no checkpoint body, recovery anchor, prompt, model/tool result, parameters, credentials, authorization token, arbitrary workspace payload, or raw exception text.

`execution_authorized` is always `False`.

## Ordering and bounds

Rows are deterministic by work identifier. The caller-provided `limit` and `include_complete` options are forwarded to `DurableWorkCheckpointStore.discover()`; the dashboard does not weaken its hard file ceiling or requested-result ceiling.

If a trusted concurrent cleanup removes a record after discovery but before inspection, a resulting `not-found` observation is omitted rather than presented as resumable evidence.

## Read-only guarantee

Snapshot construction does not write, repair, migrate, delete, resume, replay, or otherwise mutate durable checkpoints. The focused contract verifies that checkpoint bytes remain unchanged after dashboard construction.

## Safety boundary

A dashboard row with `aligned-replan-required` is not a resume signal. It only means the bounded checkpoint-time identity fields currently align with verified context. A fresh plan plus current routing, permission, MCP/tool, and per-attempt authorization remain mandatory before any execution.

No automatic resume, rollback, deployment, provider invocation, credential access, permission expansion, paid compute, or external account mutation belongs in this layer.

## Verification

Focused contract: `test/maria-recovery-dashboard.test.py`.

The contract is test-first: the first branch commit references the intentionally absent dashboard module so hosted MARIA regression CI can demonstrate the RED state before implementation.
