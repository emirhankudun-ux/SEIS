# Alpha.10 follow-up: provider probe cancellation isolation

## Scope

This bounded hardening keeps the existing provider-supervisor architecture and health-readiness contract. It changes only cancellation ownership for deduplicated provider health probes; it does not add a provider, model, permission, retry policy, browser capability, or live execution path.

Provider probes remain health/readiness checks. A successful probe may make only declared capabilities routable for the configured health TTL. It is not evidence of model intelligence, semantic answer correctness, or an external side effect.

## Problem

`createProviderSupervisor().probe(id, {signal})` deduplicated concurrent probes by returning one shared in-flight promise. That coupled caller cancellation to shared work:

- a joined caller could cancel its own signal yet still receive the shared `ready` result;
- when the first caller owned the signal used by the shared adapter probe, cancelling that caller could cancel the probe for every joined caller.

This made cancellation identity inconsistent with provider readiness and could cause one consumer to affect another consumer's health check.

## Contract

The supervisor now separates **shared probe execution** from **per-caller waiting**:

- concurrent callers share one supervisor-side in-flight entry per provider;
- an adapter that ignores cancellation may outlive that entry and overlap a later probe; this is logical deduplication, not physical single-flight containment;
- every caller gets an independent waiter;
- cancelling one waiter returns `probe-cancelled` only to that caller while other waiters remain;
- the shared host-owned `AbortController` is aborted only when the last active waiter cancels;
- a pre-aborted signal returns `probe-cancelled` without invoking the adapter;
- malformed cancellation-signal objects fail closed before adapter invocation;
- cancellation-listener registration/cleanup failures cannot silently promote a provider to healthy;
- the adapter call checks the host-owned signal again immediately before invocation, closing the registration-failure race;
- timeout, capability declaration, TTL and error-redaction remain enforced; the 2026-09-13 follow-up below distinguishes caller cancellation from actual provider failure.

## Historical waiter-isolation verification

TDD regressions were added around the existing provider-supervisor suite.

On the unchanged supervisor, the first two new isolation tests failed as intended: a cancelled joined waiter received `ready`, and cancellation by the first waiter cancelled the shared probe for a second caller. Later adversarial tests also reproduced malformed/throwing cancellation-listener failures before they were hardened.

Fresh focused verification after the final change:

```text
node --check src/core/providerSupervisor.js
node --test tests/provider-supervisor.test.mjs
```

Result: **14/14 passed**, zero failed/skipped/cancelled. The focused suite contains the seven unchanged provider-supervisor tests plus seven cancellation/validation regressions. A further stress loop ran the same 14-test file **50/50 times successfully**.

This run did not reconstruct or execute the complete alpha.10 repository test suite or browser acceptance suite, so the focused evidence must not be presented as full-package CI.

## Security and truthfulness boundary

Cancellation remains cooperative at the adapter boundary. If an adapter ignores the `AbortSignal`, the supervisor cannot forcibly terminate arbitrary in-process work. However, a cancelled shared probe cannot be accepted as fresh healthy readiness because the supervisor checks the host-owned signal before accepting its result.

No real LM Studio, Ollama, cloud model, third-party MCP server, microphone, screen capture, native macOS control, Unreal or Blender connection was exercised by this change. No new external capability is claimed.

## Rollback

Revert the provider-supervisor implementation and its added cancellation tests/document together. No persisted schema, provider definition, or public browser state migration is introduced.

## 2026-09-13: cancellation is not a health observation

Follow-up baseline: `6ad7d07bb33b4a2ff0e3dcabe8ad75a2e59bd0c8`, PR #226.
Addresses review finding `3999099684` without adding a lifecycle restore API.

Previously the supervisor called `failHealth` when the last refresh waiter
cancelled. That discarded a valid observation and made a healthy provider
unroutable. It also left cancelled initial probes in a changed lifecycle state.
The supervisor now commits lifecycle changes only for an actual success or
failure. While a probe is pending, `get()` / `routingSnapshot()` describe the
last observed state, not a synthetic `connecting` health observation.

`probe-cancelled` leaves lifecycle, capabilities, runtime metadata and the last
successful observation time untouched. This does NOT extend the health TTL:
expiry during cancellation still makes the record unroutable. No prior health
means cancellation cannot create readiness. An unhealthy result, timeout,
undeclared capability or actual probe exception still revokes readiness. A late
result from a cancelled probe cannot publish over a subsequent refresh.

The initial 13-test suite ran before this supervisor change: seven assertions
failed, six passed. The final 14-test suite adds the explicit pending-observation
contract. Tests cover ready/unconfigured/disabled/failed/degraded snapshots,
TTL expiry, all-waiter cancellation, late results, registration failure and all
four actual failure classes. The original 14 supervisor tests remain unchanged.

Run `node --test tests/provider-refresh-cancellation.test.mjs tests/provider-supervisor.test.mjs`
from `maria-seis-v2`. Full-package/host/browser and six mutation results are
recorded in [the companion checkpoint](ALPHA10-PLUGIN-CANCELLATION.md#2026-09-13-shared-initialization-ownership).
These are controlled protocol/component tests, not real provider-health claims.

This preserves observations; it does not attest endpoint locality, extend an
approval, or prove adapter-replacement identity. Supervisor probe deduplication
remains logical: a provider probe that ignores cancellation may overlap later
physical work, unlike the plugin initialization guard described separately.
The generic lifecycle module, provider definitions, routes and execution
permissions are not changed. No auto-retry, new provider or native integration
is added. Rollback is a focused revert of the supervisor/tests/docs changes.
