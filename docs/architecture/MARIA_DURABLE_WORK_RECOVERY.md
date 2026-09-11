# MARIA Durable Work Recovery v2

## Purpose

MARIA already has `WorkPlanCheckpoint`, a redacted in-memory summary of work-step evidence. Durable recovery persists that existing evidence so an interrupted session can be discovered after process restart without persisting transient model/tool results.

Schema v2 also persists an optional bounded `RecoveryAnchor`. This lets restart-time reconciliation compare checkpoint-time project/repository identity with current verified context instead of reconstructing old identity from whatever happens to be current now.

The implementation is `maria_runtime.work_recovery.DurableWorkCheckpointStore`.

## Versioned durable record

`DurableRecoveryRecord` exposes three fields only:

- `checkpoint`: the validated `WorkPlanCheckpoint`;
- `recovery_anchor`: the validated `RecoveryAnchor`, or `None` when no anchor was persisted;
- `schema_version`: the version read from disk.

`DurableRecoveryRecord.execution_authorized` is always `False`.

The existing `load(project_id, work_id)` API remains backward compatible and still returns only `WorkPlanCheckpoint | None`. Callers that need checkpoint-time identity evidence use `load_record()` explicitly.

## Schema migration

Schema v2 adds one envelope field: `recovery_anchor`.

New writes use schema version 2. `recovery_anchor` may be `null` so existing save callers can migrate without being forced to invent checkpoint-time identity they do not have. When supplied, the anchor project must match the durable checkpoint project identifier.

The v2 anchor contains exactly:

- `project`;
- `active_goal`;
- `current_repo`;
- `current_branch`;
- optional `repository_revision`.

No prompt, credential, permission, tool argument, model response, raw output, arbitrary workspace content, or execution token is added to the envelope.

Legacy schema-v1 checkpoints remain readable. A v1 record has no recovery anchor; the loader returns `recovery_anchor=None` rather than inventing one from current context. Loading a v1 record performs no write-back or automatic migration on disk.

Unknown schema versions fail closed.

## What is persisted

Checkpoint evidence remains limited to fields already present in `WorkPlanCheckpoint` and `WorkStepExecutionEvidence`:

- step identifier;
- route kind and target name;
- normalized step state;
- bounded attempt count;
- dependency identifiers;
- bounded normalized failure category;
- aggregate step counts;
- completion flag and next cancelled step identifier.

The envelope adds a schema version, project identifier, work identifier, save timestamp, and the optional bounded recovery anchor.

## What is deliberately not persisted

The durable checkpoint contains no:

- transient step result;
- prompt or model response;
- tool parameters or raw tool/provider output;
- permission target or authorization decision;
- credential or secret;
- arbitrary file backup payload;
- automatic resume token.

A failure category must be a bounded identifier. Free-form exception strings are rejected rather than stored because they can contain credentials or private payloads.

## Atomicity and corruption handling

Writes are performed to a temporary file in the target directory, flushed and `fsync`'d, then moved into place with `os.replace`. The directory is best-effort `fsync`'d where supported. Temporary files are removed on failed writes.

Reads are fail-closed. The loader checks:

- project/work identifiers before path construction;
- configured root and project-directory storage shape;
- symbolic-link aliases on the project directory and checkpoint file;
- regular-file status and maximum byte size before JSON parsing;
- a no-follow final file open on hosts that provide `O_NOFOLLOW`;
- strict UTF-8 JSON validity, including rejection of duplicate object keys and `NaN`, `Infinity`, and `-Infinity`;
- finite positive save timestamps;
- exact version-specific envelope schemas;
- schema version and identity match;
- exact recovery-anchor fields when an anchor is present;
- non-empty bounded anchor identities and project binding;
- bounded step count and fields;
- aggregate count consistency;
- dependency ordering and state/evidence invariants from the integrated recovery validator;
- completion/next-step consistency.

Saving likewise rejects a symbolic-link checkpoint root or project directory instead of writing through an alias outside the configured recovery root. JSON emission uses `allow_nan=False` so the store never intentionally writes non-standard non-finite JSON values.

A corrupt or incompatible checkpoint raises `CheckpointCorruptError`; it is never silently treated as trusted recovery state.

### Filesystem trust boundary

The symlink checks protect against pre-existing filesystem aliases and the final checkpoint-file open is no-follow where the operating system supports it. This store is **not** a hostile multi-user filesystem sandbox: the configured recovery root must remain private to the trusted SEIS/MARIA host account. A principal that can concurrently replace directories inside that root already has filesystem authority outside this checkpoint contract.

## Recovery discovery

`discover(project_id)` provides a bounded, read-only catalog of durable recovery evidence after restart.

By default it returns only checkpoints that require re-planning. Completed records remain hidden unless `include_complete=True` is explicitly requested. Results are ordered deterministically by work identifier, contain only project/work identity plus advisory recovery state, and expose `execution_authorized=False` just like `RecoveryAssessment`.

Discovery is deliberately fail-closed:

- only direct `*.json` checkpoint candidates are considered;
- each filename must encode a valid work identifier;
- every candidate is reloaded through the same strict checkpoint parser and filesystem checks;
- both schema v1 and v2 records are validated through their exact envelope contracts;
- the project directory has a fixed trusted candidate-file ceiling;
- the caller supplies a bounded result `limit`;
- exceeding that result limit raises instead of returning a partial catalog;
- unrelated non-JSON files are ignored and no cleanup is performed.

If a trusted concurrent cleanup removes a candidate between directory enumeration and loading, that vanished record is skipped because absence is not resumable evidence. Discovery never repairs, deletes, rewrites, resumes, or executes a checkpoint.

## Recovery reconciliation

A v2 record with a persisted `RecoveryAnchor` can be passed to the separate `RecoveryReconciler`. The reconciler compares the checkpoint-time active goal, repository, branch, and optional revision with current verified project context.

A matching anchor still does **not** authorize resume. The best aligned outcome remains `ALIGNED_REPLAN_REQUIRED`: MARIA must build a fresh plan and pass current routing, permission, MCP/tool, and per-attempt authorization gates again.

A v1 record or anchorless v2 record provides no checkpoint-time identity evidence. Callers must treat the missing anchor as an evidence gap rather than synthesizing historical state from current facts.

## Recovery semantics

`assess()` is advisory only:

- `NOT_FOUND`: no checkpoint exists;
- `COMPLETE`: the persisted work checkpoint is complete;
- `REPLAN_REQUIRED`: the checkpoint is incomplete/cancelled and identifies the next cancelled step.

`RecoveryAssessment.execution_authorized`, `RecoveryCatalogEntry.execution_authorized`, and `DurableRecoveryRecord.execution_authorized` are always `False`.

A recovery candidate therefore **must not** directly replay an old model/tool call. MARIA must re-plan from current repository/context state and use the existing routing, permission, MCP, and per-attempt authorization paths again.

## Source-intake relationship

The archived MARIA/SEIS Python intake contained a useful crash-recovery prototype with atomic temporary-file writes. This implementation keeps that idea but does not copy its monolithic runtime or automatic startup rollback behavior. Automatic rollback can mutate user files based on stale state and therefore remains outside this trust boundary.

## Verification

Focused contracts include:

- `test/maria-work-checkpoint-recovery.test.py`;
- `test/maria-recovery-catalog.test.py`;
- `test/maria-recovery-invariants.test.py`;
- `test/maria-recovery-reconciliation.test.py`;
- `test/maria-recovery-anchor-persistence.test.py`.

The schema-v2 migration was specified test-first. Hosted MARIA regression CI was red while `DurableRecoveryRecord`, `load_record()`, and anchor-aware v2 persistence were absent. The implementation then added v2 writes, v1 reads, strict anchor parsing, and the public record API without weakening catalog discovery, durable invariants, or the no-execution-authority boundary.

The combined recovery contract now covers round-trip redaction, atomic writes, bounded identifiers and size, corruption/schema failure, duplicate-key rejection, non-finite timestamp rejection, symbolic-link rejection, semantic graph/state integrity, bounded deterministic catalog discovery, checkpoint/context drift reconciliation, v1 compatibility, v2 anchor persistence, recovery dispositions, and the invariant that persisted recovery evidence never authorizes execution.
