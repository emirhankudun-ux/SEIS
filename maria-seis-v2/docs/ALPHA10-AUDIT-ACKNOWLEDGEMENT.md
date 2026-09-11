# Alpha.10 follow-up: synchronous audit acknowledgement

Date: 2026-09-11. Base: `3c5d6c3098d4893f102be1bbad22e54e1560d0b5`.
Scope: the existing `maria-seis-v2` journal/orchestrator boundary on PR #226.
This is a bounded fix, not a new release, a complete platform acceptance, or a
replacement for the independent Python Voice Host candidate.

## Root cause and contract

The journal v1 API is synchronous. Previously, calling a writer without a
synchronous exception was treated as a successful commit, even when it returned
a pending/rejected Promise or explicit `false`. The persistent journal could
advance its in-memory state before asynchronous persistence settled. In addition,
completion/stopped events were emitted before the terminal journal attempt, so
observers could see completion while the stored state was still `running`.

`assertSynchronousJournalResult` now rejects asynchronous return values and
explicit failure acknowledgements. Legacy synchronous void-returning writers
remain compatible. It recognizes genuine native Promises, including cross-realm
ones and those with an overridden or missing `then`, and attaches a native
rejection handler without exposing the rejection text. Generic thenables are
rejected without invoking `then`: adopting a lazy thenable could itself start
unwanted deferred I/O. Throwing accessors fail through the existing error boundary.

The guard applies to persistent storage reads/writes and the orchestrator's
`begin`/`complete` or legacy `append` calls. A failed live begin never invokes the
runtime. A failed live terminal acknowledgement yields public `unverified` with
`auditRecorded: false`, without retry, replay or later promotion. Persistent
in-memory state does not advance on failed writes.

## Observability ordering

`LIVE_EXECUTION_FINISHED` and `SIMULATION_FINISHED` now follow the terminal audit
attempt and carry `status` and `auditRecorded`. `EXECUTION_STOPPED` also follows
its audit attempt and carries `auditRecorded`. A failed terminal write emits
`JOURNAL_FAILED` first. The live audit-failure message no longer asserts that an
otherwise malformed/unverified receipt was verified.

Transport verification remains separate from audit acknowledgement. A receipt's
`verification.verifiedTransport` may be true while the public result is
`unverified` because the audit failed. Event consumers must use the public
`status` and `auditRecorded`, not infer completion from transport evidence alone.
Simulation remains simulation when its best-effort journal fails.

## Test-first verification

The first 25 added cases ran on the unchanged current core: 24 failed for the
intended acknowledgement/ordering defects and one compatibility case passed.
After the first fix they passed. Further review reproduced two additional
failures involving lazy thenable adoption and an overridden native `then`, then
three failures involving native Promises with hidden `then`. Those regressions
were fixed before final verification.

Final selected-scope result: **108 passed, 0 failed/skipped/cancelled**:
67 existing tests and 41 new tests. The new tests include strict-unhandled-
rejection child processes, late fulfilment, cancellation, observer isolation,
real file-store reloads, and a real child process that writes a running marker
and exits with code 23. Explicit fixture reconciliation is exercised; automatic
resume remains disabled. Model receipts in these tests are fixtures, not AI.

Seventeen upstream files forming the selected dependency closure were verified
against their Git blob SHAs at the base commit. The final tests also passed in a
clean extraction containing only that closure and this patch. This is **not** a
full repository checkout, a full alpha.10 package suite, or GitHub CI evidence.
The initial acquisition used an older archive only as a byte source; unverified
older files are excluded from the final fixture and from these results.

From `maria-seis-v2` on a full checkout, reproduce the selected scope with:

```sh
node --test tests/execution.test.mjs tests/reliability.test.mjs \
  tests/journal-capacity.test.mjs tests/recovery-journal.test.mjs \
  tests/audit-contract.test.mjs tests/audit-persistence-e2e.test.mjs
```

Full `npm test`, host MCP/model acceptance commands, browser acceptance and
native-platform checks remain separate required gates; they were not rerun for
this patch. Existing historical results are not relabeled as fresh results.

## Safety limits and deferred work

This contract guard is not a sandbox. Host callbacks must be trusted and
synchronous; a blocking callback cannot be preempted by this guard. It cannot
cancel I/O already started by a rejected adapter, undo its side effects, prove
`fsync`/power-loss durability, or defend arbitrary hostile Promise subclasses.
Do not automatically retry a rejected asynchronous writer. General record-schema
hardening, authorized clearing of active history, multi-writer coordination and
stronger file-store durability remain independent work.

No permissions, provider readiness, native control, microphone/camera access,
cloud calls, package dependencies, automatic recovery or agency features are
added. No real LM Studio/Ollama/Claude inference or third-party MCP connection is
claimed. The uploaded Python error/telemetry blocks were reviewed separately;
they were not executed as full modules or merged wholesale into the platform.

Rollback is a normal revert of this bounded change. Future asynchronous journal
support needs an explicit versioned, bounded, awaited lifecycle and independent
reconciliation rules rather than treating an arbitrary Promise as success.

## Publication reconciliation

Before publication the branch advanced to
`dba439752376b644d7ca030064ea4507935bd580`. The GitHub compare showed only
three MCP-content-related paths changed; none belongs to this patch or its
17-file verified test dependency closure. Publication is based on that newer
commit and preserves its MCP changes. The 108 selected tests were rerun after
this reconciliation; the concurrent MCP suite was not rerun in this scope.
