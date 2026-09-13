# Alpha.10 follow-up — plugin cancellation lifecycle

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226. Parent checkpoint: `beba6f14e4130b29573b1cd1df2a11eca4470962`.

## Problem

The v2 plugin host bounded a capability call only after plugin factory initialization had completed. A plugin factory that never settled could therefore hang outside the configured timeout. Capability timeout also stopped waiting at the host boundary without delivering an abort signal to cooperative plugin code, and an external abort signal was not raced by the host.

That is a lifecycle and permission-boundary problem: cancellation must be a host contract, not merely an optional convention inside an individual capability.

## Bounded fix

Each invocation now creates a host-owned `AbortController` before plugin initialization starts. One timeout budget per invocation covers factory waiting plus capability execution. Since the 2026-09-13 concurrency follow-up below, initialization has a separate shared signal: cancelling one caller must not cancel other callers waiting for the same factory.

An authorized caller may provide an external `AbortSignal`. A pre-aborted signal returns `plugin-cancelled` without starting initialization; an in-flight abort is linked to the host controller and resolves the host call as `cancelled`. Malformed cancellation-signal objects fail closed.

The existing manifest compatibility, declared-capability and granted-permission checks remain ahead of plugin initialization.

## Historical single-caller test-first evidence

Three focused regressions were written against the unchanged host and failed for the intended reasons:

- a never-settling factory exceeded the configured plugin timeout;
- a timed-out capability did not receive an aborted signal;
- external cancellation did not bound a running invocation.

After the lifecycle fix:

- focused cancellation suite: **3/3 passed**;
- broad compatibility regression on the packaged alpha.8 baseline with this plugin-host change: **155/155 Node tests passed**, zero failed/skipped/cancelled.

The exact alpha.10 full suite was not reconstructed locally in this environment before publication of this commit. CI on the new branch head remains the authoritative exact-tree gate when a workflow is available.

## Truthfulness boundary

This is **cooperative same-process cancellation**, not a sandbox and not process termination. A buggy or hostile plugin that ignores the supplied abort signal may continue its own asynchronous side effects after the host stops awaiting it. Strong containment for untrusted plugins still requires process isolation or another enforceable execution boundary. No external plugin, real model, native computer-control, voice, vision, Unreal or Blender capability is claimed as verified by this change.

## 2026-09-13: shared initialization ownership

Follow-up baseline: `6ad7d07bb33b4a2ff0e3dcabe8ad75a2e59bd0c8`, PR #226.
Addresses review finding `3999099687` in the existing plugin host.

Concurrent authorized invocations previously each observed `instance === null`
and ran the same factory. The host now stores one initialization promise per
registered plugin. Callers share only initialization, not input, capabilities,
granted-permission arrays, invocation signals or results. Every invocation must
pass the existing manifest, capability and permission gates before joining.

The factory receives only frozen manifest permissions, API version and its
host-owned shared initialization signal. Each caller still has its own total
time budget across waiting and capability work; finishing initialization does
not restart that timer. Cancelling or timing out a waiter releases only its
interest. The factory is aborted when the last waiter leaves before settlement.
A cancelled queued factory/capability is checked again before user code runs.

An abandoned factory remains registered until its actual returned promise
settles. New invocations get `unavailable / plugin-initialization-pending`
instead of starting a second factory. No retry is queued automatically. A late
instance is discarded; after settlement a later explicit invocation can retry.
A factory that rejects normally is also retryable. A factory that never settles
leaves this plugin unavailable; there is no automatic reset that duplicates its
work. Recovering such an uncooperative plugin requires a trusted host lifecycle
outside this change. Settled factories may still have detached side effects:
this is not a sandbox, transactional rollback or process containment.

Capability work may still run concurrently on the shared instance; the plugin
must be designed for that. Cancelling a capability does not poison the shared
factory signal or authorize another capability. Listener registration failures
are contained before initialization, listener cleanup cannot strand a completed
call, and plugin exception text cannot impersonate a host timeout/cancellation.

### Evidence

The first complete 15-test regression run on unchanged production code had
12 assertion failures and 3 passes. Three additional controls cover error-reason
ownership and the unchanged total timeout budget; the final suite is 18 tests.
The existing three cancellation regressions are unchanged. A companion provider
refresh suite adds 14 tests; see [provider cancellation](ALPHA10-PROVIDER-PROBE-CANCELLATION.md).

Local Linux / Node 22.22.1 verification on the proposed complete tree:
- New concurrency suites: 32 passed; repeated successfully 10 times.
- Full `npm test`: 299 passed, zero failed/skipped/cancelled.
- `mcp:check`, `recovery:check`, `local-model:check`: passed, fixture scopes only.
- Existing offline Chromium suite: 17 passed; no UI/layout/assets changed.
- Six compiled behavioral mutations were detected in isolated copies: duplicate
  initialization, aborting other waiters, late instance publication, queued
  cancelled dispatch, cancellation as health failure, and refreshed TTL on cancel.

Run `node --test tests/plugin-initialization.test.mjs tests/plugin-cancellation.test.mjs`
from `maria-seis-v2`. The existing Ubuntu/macOS package workflow discovers the
new tests automatically; verify the exact published head before claiming CI.
No product dependency, workflow permission, provider credential, execution
approval, external plugin, native app, real-model inference or release changed.
The existing PR merge conflict and manager reconnect/disconnect races are not
resolved by this patch. Revert the concurrency code, tests and related docs as a
focused rollback; no persistent schema or user-data migration was introduced.

Reference: Node's AbortSignal is cooperative notification and must be checked
before registering listeners; completed listeners should be removed:
https://nodejs.org/docs/latest-v22.x/api/globals.html#class-abortsignal
