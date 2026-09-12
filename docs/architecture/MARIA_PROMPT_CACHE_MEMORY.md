# MARIA prompt cache memory contract

Status: implemented in the proposed RAM-hardening branch; not a released native
memory governor. Related foundation: [MARIA Runtime v18](MARIA_RUNTIME_V18.md).

## Root cause and scope

At inspected main `550c54c460347528bec4fef18c6cdb7650dc991e`, `PromptCache`
limited the number of responses to 32 but unconditionally deep-copied each
response. Entry count alone did not bound retained payload size. Request-key
serialization also allocated the entire request without an admission limit.

This change hardens that existing optional Python runtime component. It does
not introduce another cache, change Maria's identity or UI, load a model,
enable tools, contact a provider, authorize execution, write private data, or
alter the open native/permission/platform PR stacks.

Repository inspection found the cache export and its foundation test, but no
live-provider or native-shell caller on this main baseline. Therefore these
results do **not** demonstrate reduced whole-application RAM, model memory,
GPU memory, orb cost, swap usage, or improved performance on a 24 GB Mac.

## Public contract

`PromptCache(max_size=32, *, max_bytes=8*1024*1024,
max_entry_bytes=None, max_request_bytes=1024*1024)` keeps its existing
`get`, `put`, complete-request SHA-256 identity, copy isolation and LRU behavior.
`put` still returns `None`; a skipped entry is an ordinary cache miss.

| Setting | Default | Meaning |
| --- | --- | --- |
| `max_size` | 32 | Maximum retained entries |
| `max_bytes` | 8 MiB | Sum of estimated entry costs |
| `max_entry_bytes` | Smaller of 1 MiB and `max_bytes` | Maximum admitted response plus digest-key estimate |
| `max_request_bytes` | 1 MiB | Request object estimate AND encoded JSON admission ceiling |

Budgets require exact integers (not booleans, strings or floats). `max_size`
must be positive. Byte limits may be zero to disable caching. Explicit entry
limits are clamped to the total budget. Public configuration properties are
read-only: create a replacement cache to change the budget.

`clear()` releases cached references and resets retained accounting to zero;
lifetime hit/miss/skip/eviction counters remain available. A future host can
invoke it on a validated memory-pressure signal. **No automatic OS pressure
watcher or hardware-profile integration is claimed here.**

## Admission, eviction and concurrency

- Preflight accepts exact built-in plain data only: strings, bytes,
  bytearrays, integers, floats, booleans, null, lists, tuples and dictionaries.
  Unsupported objects/subclasses bypass without executing their size/copy hooks.
- Nested payloads are recursively estimated. Traversal stops after depth 32 or
  16,384 visited values. Cyclic, too-deep or overly wide structures bypass.
  Shared references are conservatively counted repeatedly; admitted copies
  preserve their internal aliasing.
- Oversized responses are rejected before `deepcopy`. An admitted copy is
  measured again because copied-container allocation overhead can differ.
- Replacing a key removes the old cached response even when the new response
  is not admitted. Unrelated entries remain intact. This prevents a rejected
  replacement from leaving stale data available under that same request key.
- LRU eviction enforces both total estimated bytes and entry count. Cache
  admission never truncates the actual response.
- A lock serializes retained-state, copy, LRU and counter updates. Callers
  must not concurrently mutate input request/response objects during a call.
- A request is preflighted before JSON serialization. Unsupported JSON, invalid
  Unicode, non-finite values or an encoded request exceeding the ceiling bypass
  caching. The full canonical request is still hashed for admitted requests.

## What the budget does not mean

`estimated_bytes` counts recursively estimated response data plus the SHA-256
hex key. It excludes the cache's OrderedDict nodes, entry tuples, counters,
locks and allocator overhead; entry count bounds metadata growth. It is not
RSS or a strict process-memory limit. Python's `sys.getsizeof` is shallow on
its own, which is why child values are visited explicitly:
https://docs.python.org/3/library/sys.html#sys.getsizeof

Peak allocation can exceed the retained budget: the caller owns the original
response, an admitted copy exists temporarily during replacement/eviction, and
`get()` returns an isolated copy. JSON escaping can expand a preflighted
request before the encoded-size check. Those temporaries are constrained by
admission depth/visit/size limits, not included in retained cache accounting.
`clear()` releases references; it does not promise immediate RSS reduction or
secure erasure of all Python allocations.

The cache is neither persistent knowledge nor the recovery/evidence journal.
Never discard authoritative evidence to implement this response-cache policy.
The host must independently enforce privacy, namespace isolation, freshness,
consent and authorization; a cache hit is not verified task completion.

## Compatibility and trade-offs

Existing plain-data users retain the interface. Arbitrary Python objects and
oversized requests/responses now intentionally miss instead of being retained.
A small budget can cause more cache misses and hence more recomputation; cache
pressure must never implicitly permit cloud routing, spending or data sharing.
Budgets are per instance; spawning unbounded cache instances is not addressed.

## Verification

The original implementation was exercised with the new 21-test suite before
production changes: 10 failures and 12 errors were reported (subtests can
produce multiple failures). In particular, a 2 MiB response was copied, and
opaque objects executed `__deepcopy__`. New constructor options were absent.

The final focused suite adds three boundary controls (24 tests total): exact
byte admission, escaped JSON expansion, and disabled entry/request budgets.
It covers LRU under byte pressure, Unicode memory, nested data, skipped
replacements, copy isolation, unsafe hooks, depth/width bounds, request
identity, clear, immutable budgets and concurrent callers.

Run from the repository root:

```sh
python3 test/maria-cache-memory.test.py
python3 test/maria-runtime-v18.test.py
python3 scripts/check-maria-runtime-v18.py
python3 -m compileall -q apps/maria-desktop packages/maria-runtime/python
node scripts/check-foundation.mjs
git diff --check
```

Five compiled behavioral mutations were tested in temporary copies and all
were detected: missing total-byte eviction, response preflight, stale-key
invalidation, clear accounting, or request preflight. The unchanged corrected
source passed the 24-test suite again afterwards.

The existing runtime workflow now includes the focused suite on Ubuntu and
macOS, without adding package dependencies or relaxing any gate. A successful
focused suite does not replace repository-wide or native app verification.

## Measured synthetic workload (2026-09-12)

Linux / CPython 3.11.6, separate processes per mode, `tracemalloc` started after
imports, 96 distinct requests each carrying a newly created 512 KiB bytearray
inside a response dictionary, followed by garbage collection. Baseline is the
cache source from the inspected main commit. No inference or network occurs
inside the workload. Memory below is Python-traced allocation, **not RSS**.

| Configuration | Retained entries | Traced current bytes | Traced peak bytes |
| --- | ---: | ---: | ---: |
| baseline | 32 | 16,792,838 | 18,373,351 |
| bounded-default | 15 | 7,873,556 | 9,505,573 |
| eco-example | 3 | 1,575,468 | 3,208,533 |

After `clear()` both bounded configurations measured 2,326 traced bytes in this
harness. The 2 MiB configuration is an explicit example, not a shipped Eco
profile. Different payload shapes/interpreters yield different measurements.
Do not extrapolate these figures to SEIS's full native application or models.

## Risks, rollback and next handoff

Risk: optional-cache hit rate changes for large or custom responses; sizing
adds bounded traversal work. Keep actual provider results independent from
cache admission. Rollback is a focused revert of this branch, not deletion of
user data. No dependency, permission, storage migration or deployment changes.

Next: after review, wire a single cache lifecycle to the real provider host,
apply explicit per-session budgets and tested pressure-release signals, then
profile the native app with actual models and the real 3D orb. Preserve the
existing separate work on CI publish-readiness and permission/native stacks.
