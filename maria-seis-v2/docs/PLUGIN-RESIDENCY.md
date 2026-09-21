# Lazy plugin residency and safe unload

Status: implemented host-library candidate on PR #226, not a released installer.
Date: 2026-09-13. Baseline: `c7c25ed35e46d0faa37d442d4bbe578f43bba28d`.

## Decision and scope

Keep a wide catalog without starting every plugin. Extend the existing v2 host,
not a second registry: `register` and `list` retain their lazy behavior, while
new residency accounting limits simultaneously initialized/loading instances.
Metadata registrations, resident instances and per-call authorization are
separate. Nothing here detects installed apps on a user's machine or imports
connected ChatGPT apps into SEIS.

`createPluginHost({resourceProfile, maxResidentPlugins, timeoutMs})` accepts:

| Profile | Default resident-slot limit |
| --- | ---: |
| `lite` | 4 |
| `standard` (default) | 8 |
| `workstation` | 16 |

These are configurable count policies, not measured RAM/CPU limits or hardware
requirements. A positive safe-integer `maxResidentPlugins` overrides the profile
limit. Registration count is not limited by this setting. Loading reservations,
idle instances, active instances and pending/failed cleanup retain their slots.
A full budget returns `unavailable / plugin-residency-limit` before another
factory starts. It does not evict an active plugin, queue retries or grant access.

## Host API

Existing two-argument registration remains valid. To opt into safe unload, a
trusted host supplies a lifecycle callback as the third argument:

```js
const host = createPluginHost({resourceProfile: 'standard'});
host.register(manifest, factory, {
  dispose: async (instance, {signal}) => {
    // Close only resources this instance owns. Fulfillment acknowledges cleanup.
    await instance.close({signal});
  }
});
const result = await host.invoke(manifest.id, 'inspect', input, {
  grantedPermissions: ['project.read']
});
// Consume/copy any result data before releasing resources it may reference.
await host.unloadIdle();
```

The callback receives the instance plus frozen `apiVersion`/`signal` metadata,
not the private registry entry as `this`. It must be trusted, idempotent enough
for an explicit retry, and honor cooperative cancellation where possible.
A missing disposer returns `plugin-unload-unsupported`; dropping references
alone is never represented as verified resource cleanup. Existing plugins can
remain registered and invoked without adding a disposer, subject to the cap.

- `getResidency(id)` returns a frozen snapshot or null: `registered`, `loading`,
  `active`, `idle`, `unloading`, `cleanup-required`, or `quarantined`.
- `residencyStats()` reports registered/resident counts, the configured limit,
  profile and active execution count; it exposes no instance/factory handles.
- `unload(id)` releases an idle managed instance only after its cleanup callback
  fulfills; its manifest and factory remain registered for a later authorized
  invocation. Active/loading work returns `plugin-busy` instead.
- `unloadIdle()` performs a host-requested sequential sweep of a fixed snapshot.
  It skips busy, unmanaged, already-unloading and quarantined entries. One failed
  disposer does not prevent independent idle entries from being processed.

There is no background polling timer, automatic OS-pressure detection or silent
LRU eviction. Hosts call the sweep after consuming task results or at their own
maintenance boundary. Integrating that boundary into a native mission host is
separate work; the browser app is not silently switched to live plugin execution.

## Cancellation, failure and ownership

A cancelled or timed-out caller does not prove its plugin stopped. Capability
promises remain counted until actual settlement, so cleanup cannot race work
still using an instance. Concurrent callers share the existing initialization
promise but keep independent permissions, inputs and cancellation contexts.

Concurrent unload calls share one cleanup. Its wait uses the existing host
`timeoutMs`; on timeout the cleanup signal is aborted and the caller receives
`plugin-unload-timeout`. The pending instance retains its slot until the real
cleanup promise settles. An uncooperative callback can keep that slot occupied;
the host does not fabricate closure or launch a competing instance.

Cleanup rejection retains the instance in `quarantined` with a normalized
`plugin-unload-failed` result. Calls cannot execute it. Idle sweeps do not retry
quarantined cleanup automatically; an explicit `unload(id)` may retry. Late
managed factory results after cancellation are retained as cleanup-only, never
published for invocation, and can be released through the same lifecycle.
Legacy unmanaged abandoned-factory semantics remain unchanged.

## Verification and runnable acceptance

```sh
npm --prefix maria-seis-v2 run plugins:check
npm --prefix maria-seis-v2 test
```

The acceptance command uses the real host with **200 controlled registrations**
per profile. It verifies zero factories at registration, capacity of 4/8/16,
rejection before the next factory starts, idle cleanup back to zero resident
instances, all 200 metadata records retained, and successful cold reload.
It also verifies that denied requests do not load anything. These are test
plugins, not 200 installed third-party integrations or a memory benchmark.

Test-first evidence: the initial 19 cases failed against unchanged production
code. A follow-up test exposed disposer `this` binding to private host state;
it failed before the callback was detached. The command-level test failed
before the acceptance script existed. Existing regression suites are preserved.
See the PR checkpoint for exact-head totals, hosted CI and review status.

## Limits, compatibility and next work

The new standard eight-slot default is an intentional admission change. Hosts
that need more must explicitly select a profile or limit; known resource owners
must provide disposal callbacks before reliable idle reclamation is possible.
This is trusted same-process lifecycle management, not process isolation or an
installer. A callback's fulfillment is not independent proof that OS/network
resources closed. Detached side effects may outlive a returned promise.

Releasing instance references does not evict imported code, factory closures or
runtime module caches and does not guarantee immediate RSS reduction. No actual
Mac RAM, model-weight, GPU, battery, startup or installer-size result is claimed.
A single plugin may use substantial memory; a count cap is not a byte governor.

No API keys, user files, paid services, automatic plugin installs/updates, added
product dependencies, new execution grants, UI/portrait/orb changes or native
release are involved. Dependency deduplication, signature/license checks,
recommended packs, per-process enforcement and native lifecycle integration
remain separate acceptance gates. The pre-existing PR merge conflict remains.
Rollback is a focused revert of host residency, its tests/check and docs; no
persistent user data migration or deletion is required.
