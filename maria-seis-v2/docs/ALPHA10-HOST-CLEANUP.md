# Alpha.10 — host cleanup and review reconciliation

Date: 2026-09-13. PR: #226, branch `maria-seis-v4-platform`.
Baseline: `df2b7a8743b1b496210faac8ec34da18eccb698e`.
Scope: existing host lifecycle and truthful reports, not another runtime.

## Reproduced and corrected

1. `HostAdapterManager.connect()` kept the session only in a local variable
   until health completed. A thrown health probe therefore lost the identity
   needed by `disconnect()`. The manager now retains that identity immediately,
   while status remains `connecting`, health stays unverified and capabilities
   stay empty. A failed probe stays failed; retention grants no execution.
2. The reference-process parent sent SIGTERM before registering its exit
   observer and returned `closed:false` immediately on SIGKILL. Its losing timer
   also survived successful exit. Cleanup now observes before signalling,
   clears both timers/listeners, and waits for actual exit after escalation.
   The existing 1,500 ms TERM grace remains; a separate 1,500 ms observation
   window follows KILL. No exit evidence still means `closed:false`. Signal
   errors are contained without returning their private diagnostics.
3. Cleanup failure previously overwrote even a failed host check with
   `unverified`. Local-model, MCP and recovery checks now downgrade only a
   previously `verified` result. Primary failure/cancellation reasons survive;
   successful work without successful cleanup still cannot pass the check.

The parent change is complementary to the prior reference **server** shutdown
fix. The server's own active-connection closure is retained unchanged. The
parent signals only the child it created, not an Ollama/LM Studio process or a
process discovered by PID/name. An exit report is not process-tree containment
or evidence about arbitrary descendant/remote processes.

## Test evidence

Before production edits, the two focused files ran 17 tests: **10 failed and
7 passed**. Failures reproduced lost sessions, live losing timers, synchronous
exit races, premature forced-cleanup results and overwritten primary failures.
After the correction all 17 passed. Two more controls cover cancellation-reason
retention and real forced-child exit, giving 19 focused tests (14 new and five
unchanged). The new real-child test also failed against a temporary copy of the
exact baseline before passing with the corrected parent.

The fault-injection tests replace only OS spawn/fs and synthetic-provider
boundaries while exercising the actual exported check functions. Some injected
shutdown timers are shortened in tests; production budgets are unchanged except
for the documented post-KILL observation window. A separate test uses a real
loopback reference process with a no-op SIGTERM handler, the real 1,500 ms grace,
real HTTP discovery/completion/cancellation, and observes actual SIGKILL exit.
It does not start or stop an external AI model.

Local Linux / Node 22.22.1 verification:

- `node --test tests/host-cleanup.test.mjs tests/adapter-contract.test.mjs`: 19 passed.
- `npm test`: 267 passed, zero failed/skipped/cancelled; smoke/core/platform passed.
- `npm run mcp:check`, `npm run recovery:check`, `npm run local-model:check`: passed.
- Existing offline Chromium acceptance: 17 passed. No UI assets/layout changed.
- Foundation, JavaScript syntax and whitespace checks: passed.
- Four compiled mutations in temporary copies were detected: removed session
  retention, missing losing-timer cleanup, premature post-KILL result and
  overwritten primary failure. Working production source was not mutated.

The existing `MARIA Platform Core` workflow includes all `tests/*.test.mjs` and
runs the package on Ubuntu/macOS. Its **exact published head** must be checked;
these local results are not a substitute for hosted or native verification.

## Related review documentation corrections

The contributor's local-server command now binds to loopback and states its
package working directory. `DELIVERY.json` labels its 253-test baseline as a
historical exact-commit record, and the verification index separates the old
alpha.4 snapshot from current work. The provider-probe document now explicitly
limits deduplication to the supervisor's in-flight entry: an uncooperative
adapter can outlive it and overlap a later probe.

## Remaining boundaries and next work

Code review also reported concurrent plugin-factory initialization and cancelled
provider-refresh semantics. They are not silently marked fixed by this patch.
Manager reconnection/disconnection concurrency, process-tree isolation, real
model inference, target-device RAM, native Apple acceptance and PR merge-conflict
resolution remain separate work. The existing main/other PR branches, Python
routing/cache stack, permissions, dependencies and public UI are unchanged.

Retaining a failed session enables the existing caller-controlled disconnect;
it is not an automatic resource reaper. Protocol fixtures and passing tests
cannot establish semantic model correctness, user approval or production readiness.
Rollback is a focused revert of this follow-up, not deletion of user data.

References for the reviewed primitives:
- Node child-process exit and signal semantics:
  https://nodejs.org/docs/latest-v22.x/api/child_process.html
- Python local-server binding defaults:
  https://docs.python.org/3.11/library/http.server.html
