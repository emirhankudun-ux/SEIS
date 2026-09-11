# MARIA Recovery Reconciliation v1

## Purpose

Durable work checkpoints preserve redacted execution evidence across process restarts, but checkpoint existence alone does not prove that the surrounding project state is still the same. This slice adds a small fail-closed reconciliation layer that compares a checkpoint-time identity anchor with current verified project context before interrupted work is treated as a continuation candidate.

The implementation is `maria_runtime.recovery_reconciliation`.

## Recovery anchor

`RecoveryAnchor` contains only bounded project/workspace identity fields:

- project;
- active goal;
- current repository;
- current branch;
- optional repository revision.

It deliberately does not contain prompts, model responses, tool arguments, raw outputs, credentials, permission decisions, arbitrary workspace content, or execution tokens.

The optional repository revision is compared only when the checkpoint-time anchor recorded one. This allows hosts that can prove a Git/head revision to get stronger drift detection without making weak or unavailable revision evidence look authoritative.

## Current evidence

`RecoveryReconciler` reads current facts through the existing `ProjectContextEngine` resolution policy. The current active goal, repository, and branch must resolve to verified, non-empty string facts. If the anchor contains a repository revision, the current revision must also resolve to verified evidence.

Unverified or missing current facts never count as a match.

## Outcomes

Reconciliation returns one of four advisory states:

- `COMPLETE`: the checkpoint is already complete and is not a recovery candidate;
- `EVIDENCE_REQUIRED`: required current verified context is missing;
- `DRIFT_DETECTED`: one or more anchored identity fields changed;
- `ALIGNED_REPLAN_REQUIRED`: the checked identity fields still match, but interrupted work must still be re-planned.

`RecoveryReconciliationAssessment.execution_authorized` is always `False`.

An aligned result therefore does **not** mean “resume now.” It means only that this bounded comparison did not detect identity drift. MARIA must still rebuild the current work plan and traverse the normal routing, permission, MCP/tool authorization, and execution boundaries.

## Integration with durable recovery

This integration branch combines reconciliation with the bounded recovery catalog and stricter durable graph/state invariants. Catalog discovery can identify incomplete checkpoints after restart; durable validation can reject structurally impossible evidence; reconciliation can then compare a separately retained checkpoint-time anchor against current verified project state.

These layers remain intentionally separate so discovery, validation, context drift detection, and execution authority cannot silently collapse into one implicit “resume” path.

## What counts as drift

The first version intentionally compares only fields that identify the work context:

- active goal;
- repository;
- branch;
- repository revision, when anchored.

Fields such as `next_safe_action`, current blocker, UI state, or last verification text are not used as drift keys because they are expected to change during normal progress and would create false-positive drift.

## Trust boundary

This module performs no filesystem I/O, Git operation, provider call, tool execution, rollback, replay, deployment, or account mutation. Trusted host code is responsible for capturing the checkpoint-time `RecoveryAnchor` from authoritative evidence and retaining/binding it to the corresponding checkpoint record.

Persisting that anchor inside the durable checkpoint envelope remains a separate follow-up so the hardened checkpoint schema is not silently widened without migration and corruption tests.

## Verification

Focused contract: `test/maria-recovery-reconciliation.test.py`.

The reconciliation contract was originally committed test-first on its isolated branch, where hosted MARIA regression CI failed while `maria_runtime.recovery_reconciliation` was absent. This integration branch replays the already-bounded implementation on top of catalog discovery and durable invariant hardening, with the full MARIA regression suite used to detect integration conflicts.
