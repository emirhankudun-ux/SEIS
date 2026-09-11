# MARIA Durable Work Recovery v1

## Purpose

MARIA already has `WorkPlanCheckpoint`, a redacted in-memory summary of work-step evidence. This slice adds durable persistence for that existing evidence so an interrupted session can be discovered after process restart without persisting transient model/tool results.

The implementation is `maria_runtime.work_recovery.DurableWorkCheckpointStore`.

## What is persisted

Only fields already present in `WorkPlanCheckpoint` and `WorkStepExecutionEvidence` are persisted:

- step identifier;
- route kind and target name;
- normalized step state;
- bounded attempt count;
- dependency identifiers;
- bounded normalized failure category;
- aggregate step counts;
- completion flag and next cancelled step identifier.

The envelope adds a schema version, project identifier, work identifier, and save timestamp.

## What is deliberately not persisted

The durable checkpoint contains no:

- transient step result;
- prompt or model response;
- tool parameters or raw tool/provider output;
- permission target or authorization decision;
- credential or secret;
- arbitrary file backup payload.

A failure category must be a bounded identifier. Free-form exception strings are rejected rather than stored because they can contain credentials or private payloads.

## Atomicity and corruption handling

Writes are performed to a temporary file in the target directory, flushed and `fsync`'d, then moved into place with `os.replace`. The directory is best-effort `fsync`'d where supported. Temporary files are removed on failed writes.

Reads are fail-closed. The loader checks:

- project/work identifiers before path construction;
- regular-file status and maximum byte size before JSON parsing;
- UTF-8 JSON validity;
- exact envelope/body/step schemas;
- schema version and identity match;
- bounded step count and fields;
- aggregate count consistency;
- completion/next-step consistency.

A corrupt or incompatible checkpoint raises `CheckpointCorruptError`; it is never silently treated as trusted recovery state.

## Recovery semantics

`assess()` is advisory only:

- `NOT_FOUND`: no checkpoint exists;
- `COMPLETE`: the persisted work checkpoint is complete;
- `REPLAN_REQUIRED`: the checkpoint is incomplete/cancelled and identifies the next cancelled step.

`RecoveryAssessment.execution_authorized` is always `False`.

A recovery candidate therefore **must not** directly replay an old model/tool call. MARIA must re-plan from current repository/context state and use the existing routing, permission, MCP, and per-attempt authorization paths again.

## Source-intake relationship

The archived MARIA/SEIS Python intake contained a useful crash-recovery prototype with atomic temporary-file writes. This implementation keeps that idea but does not copy its monolithic runtime or automatic startup rollback behavior. Automatic rollback can mutate user files based on stale state and therefore remains outside this trust boundary.

## Verification

Focused contract: `test/maria-work-checkpoint-recovery.test.py`.

The contract was committed before implementation. Hosted CI first failed because `maria_runtime.work_recovery` did not exist. The implementation was then added and the MARIA regression job passed the focused recovery tests together with the existing MARIA script suite.
