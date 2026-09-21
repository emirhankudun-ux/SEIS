# Alpha.10 — adapter session ownership

Date: 2026-09-13. PR #226, branch `maria-seis-v4-platform`.
Baseline: `de67abb84817b0bc1613b64598538fdd362c10ac`.
Scope: existing `HostAdapterManager`, not a new provider or runtime.

## Defect and acceptance boundary

A pending connect/health completion could restore `ready` after disconnect.
Disconnect also left the old session executable until cleanup finished, and
parallel connects could allocate sessions whose cleanup identity was lost.
A late execution result could be returned as successful after replacement,
even when a provider reused the same session ID. Cleanup exceptions were
silently converted into an apparently clean unconfigured state.

The manager now tracks one lifecycle owner per registered adapter. Starting
disconnect synchronously revokes readiness and increments a private generation
before signalling the pending handshake or invoking adapter cleanup. Late
connect/health completions retain cleanup identity but cannot restore readiness.
An execution completing against an ended generation returns
`unavailable / adapter-session-ended`, not a result from the replacement session.

## Explicit connection contract

- While connect or disconnect is pending, another connect rejects with
  `adapter lifecycle busy`. Calls are not queued or silently coalesced across
  potentially different caller contexts.
- An already-owned session requires explicit disconnect before reconnect,
  including a session whose health failed or whose ID is null. The rejection is
  `adapter session requires disconnect`. A failed handshake that returned no
  session remains explicitly retryable; hidden resources never returned by an
  adapter are outside the manager's ownership contract.
- Concurrent disconnect calls share one teardown task. Reconnection is refused
  until that task settles, preventing adapter-wide cleanup from crossing a new
  session boundary. Different registered adapters remain independent.
- Disconnect cooperatively aborts pending connect/health through a host-owned
  signal and waits for that operation to settle before cleaning the retained
  session. A late returned session is cleaned, not forgotten. A pending
  `disconnecting` state has no readiness or verified capabilities.
- A thrown cleanup preserves session ownership, returns `failed` with the
  normalized `disconnect-failed` reason, and permits an explicit disconnect
  retry. It cannot silently enable a replacement connection.
- Caller aborts are forwarded during the handshake and rechecked after awaits;
  settled handshakes detach the listener. Context-access failures are contained
  without stranding the lifecycle or exposing private exception text.
- Health requires literal `ok: true`; truthy strings, numbers, objects and
  promises cannot grant readiness. Existing declared-capability filtering stays.

Sequential successful connect/execute/disconnect keeps its existing shape.
The explicit rejection of overlapping/owned connects and the transient
`disconnecting` state are deliberate compatibility changes. Hosts that formerly
used connect as an implicit refresh must now disconnect explicitly or use the
separate provider-readiness path. No automatic reconnect or retry is added.

## Verification

The first 16 new tests ran against unchanged production code: 14 failed and
two passed. Three additional controls cover throwing context access, listener
removal, and the real HTTP adapter path. The context-access test caught and
reproduced a defect in the first implementation before correction. The HTTP
test also failed against a temporary copy of the exact baseline manager.

The HTTP fixture sends an incomplete response during native-Ollama-shaped
health discovery. Disconnect aborts that response, cleans its actual adapter
session, and permits a fresh handshake and transport-only completion. This is
a real loopback connection but a protocol fixture, not a running Ollama model.

Local Linux / Node 22.22.1 results:
- New session-ownership suite: 19 passed, repeated five times.
- Complete package `npm test`: 318 passed; no failed/skipped/cancelled tests.
- `mcp:check`, `recovery:check`, `local-model:check`: passed, existing fixture scopes.
- Four compiled mutations in temporary copies were detected: stale execution
  generation, retained readiness during cleanup, parallel handshake admission,
  and truthy health acceptance. Production source was not mutated.
- Changed-JS syntax, root foundation and whitespace checks passed.

The existing Ubuntu/macOS workflow discovers the new test file. Only an
inspected run for the exact published head can establish hosted CI success.
Browser/native/device checks are separate; use the PR checkpoint for their
actual run status rather than inheriting previous results.

## Limits, safety and next handoff

An adapter ignoring abort and never settling can keep its registration in
`disconnecting`; the manager deliberately does not manufacture closure or start
a competing connection. Concrete adapters retain their own request deadlines.
There is no new generic timeout, automatic reaper or arbitrary process kill.
Previously dispatched execution may continue its own side effects: suppressing
its stale return is not transactional rollback, cancellation of remote work,
resource-closure attestation or process isolation. Trusted adapter cleanup
fulfilment is still the disconnect contract, not independent physical proof.

No dependency, provider definition, execution permission, credential, native
UI/portrait/orb, persistent schema, Python routing/cache stack, main branch or
release changed. The existing PR merge conflict is not resolved here. Review
this stricter lifecycle admission before integration; provider replacement
identity, enforceable untrusted-plugin isolation and real-model/native-device
acceptance remain separate work. Rollback is a focused code/test/doc revert,
not deletion of user files or audit data.

Reference for cooperative abort and listener lifecycle:
https://nodejs.org/download/release/latest-jod/docs/api/globals.html#class-abortsignal
