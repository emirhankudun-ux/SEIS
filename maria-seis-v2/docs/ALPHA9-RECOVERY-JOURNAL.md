# Alpha.9 — durable execution journal and crash-recovery gate

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226. Parent checkpoint: `be324d8e76ac65b8a2c3bde0707a962525a374b3` (alpha.8). Scope: the `maria-seis-v2` package only.

## Goal

Make live execution safer around host crashes and audit failures without pretending interrupted external work can be resumed safely. The new contract records an in-progress marker before live execution, persists only redacted audit data, detects interrupted runs after reload, and requires explicit reconciliation. Recovery candidates are never automatically replayed.

## Implementation

- `src/core/executionJournal.js`
  - keeps the existing bounded in-memory journal;
  - adds `begin` / `complete` lifecycle methods;
  - adds `createPersistentExecutionJournal` with strict corruption handling;
  - redacts secret-shaped keys before any persistence write;
  - commits persistent state before advancing the in-memory audit view.
- `src/core/recovery.js`
  - finds runs whose latest durable state is still `running`;
  - returns immutable recovery candidates with `resumeAllowed: false`.
- `host/fileJournalStore.mjs`
  - synchronous host-only bounded storage;
  - atomic temp-file + rename writes;
  - mode `0600` for new files on supporting platforms;
  - refuses an existing symlink or non-regular target;
  - caps journal bytes.
- `src/core/orchestrator.js`
  - records audit start after provider selection and before execution;
  - live mode fails closed if audit start cannot be recorded;
  - terminal completion replaces the running marker when supported;
  - if terminal audit persistence fails after a verified live result, public status is downgraded to `unverified` and reconciliation is required.
- `host/recoveryCrashProbe.mjs` / `host/checkRecovery.mjs`
  - real child process writes a durable `running` record then exits with code 23 before completion;
  - parent reload detects exactly one interrupted run;
  - no automatic resume occurs;
  - parent records an explicit reconciled terminal error and verifies a second reload has no remaining interrupted run.

## Security boundaries

- User commands are not persisted by this recovery marker path.
- Secret-shaped fields are redacted before serialized storage is produced.
- Corrupt history does not silently reset; journal construction fails closed.
- A discovered interrupted run is not proof that no external side effect occurred. It means the terminal audit record is missing and reconciliation is required.
- `resumeAllowed` is always false in this checkpoint. Side-effect replay needs a future idempotency/reconciliation contract per adapter before any resumable workflow can be considered.
- The file store is a trusted-host primitive, not a sandbox. Directory trust, process identity, OS permissions, disk encryption and multi-process locking remain host/deployment responsibilities.

## Verification

The feature was developed test-first. New tests cover redaction-before-persistence, reload, persistence failure rollback, corrupt storage, recovery scanning, live fail-closed audit start, terminal-audit downgrade, atomic file persistence, symlink refusal and a real subprocess interruption/reload/reconciliation path.

Fresh verification: **161/161 Node tests passed**, the real read-only MCP check returned `verified`, the real interruption/reload/reconciliation check returned `verified`, and **17/17 offline Chromium acceptance checks passed across seven viewport sizes**. Existing MCP and browser checks were rerun as regression gates. No real local model, third-party MCP server, native automation, Unreal or Blender process is claimed connected by this checkpoint.
