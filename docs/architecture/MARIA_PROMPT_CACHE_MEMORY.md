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
lifetime hit/miss/skip/eviction/allocation-failure counters remain available.
A future host can invoke it on a validated memory-pressure signal. **No automatic OS pressure
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
- A lock serializes key admission, retained-state, copy, LRU and counter
  updates, so callers sharing an instance cannot build key buffers in parallel.
  Callers must not concurrently mutate input objects during a call.
- A request is preflighted before JSON serialization. Unsupported JSON, invalid
  Unicode, non-finite values or an encoded request exceeding the ceiling bypass
  caching. Dictionary keys in requests must be exact strings, including nested
  dictionaries; numeric/bool/null keys must not silently alias string keys.
  Response dictionaries retain the existing plain-data key rules. The complete
  canonical request is still hashed for admitted requests.

## What the budget does not mean

`estimated_bytes` counts recursively estimated response data plus the SHA-256
hex key. It excludes the cache's OrderedDict nodes, entry tuples, counters,
locks and allocator overhead; entry count bounds metadata growth. It is not
RSS or a strict process-memory limit. Python's `sys.getsizeof` is shallow on
its own, which is why child values are visited explicitly:
https://docs.python.org/3/library/sys.html#sys.getsizeof

Peak allocation can exceed the retained budget: the caller owns the original
response, an admitted copy exists temporarily during replacement/eviction, and
`get()` returns an isolated copy. Incremental JSON encoding avoids whole-request
string/byte buffers, but the encoder can still allocate an entire escaped
string token. UTF-8 conversion is sliced into at most 16 KiB blocks; this is
**not** a 16 KiB bound on the whole encoder or operation. Temporaries are not
included in retained cache accounting.
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

## Initial memory-budget verification

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

## Initial retained-cache measurements (2026-09-12)

These measurements belong to initial PR #249 head
`800616c45415982195cbc01028e205934bf4211e`, not the later key-hashing changes.

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

## Follow-up: transient allocation and memory-pressure failures

Inspection of initial PR #249 head
`800616c45415982195cbc01028e205934bf4211e` found that retained byte limits did
not prevent whole-request JSON/UTF-8 temporaries. `MemoryError` during key
construction or response copying also escaped the optional cache. Finally,
non-string dictionary keys could serialize to the same string keys as a
valid request; no hash collision was needed.

The existing cache now hashes `JSONEncoder.iterencode` chunks incrementally,
checks the running UTF-8 byte count, stops encoding over-budget inputs early,
and slices even large string chunks before byte conversion. Accepted canonical
JSON keys are unchanged. Request admission rejects non-string dictionary keys
before the JSON encoder can coerce them. Tuples still encode as JSON arrays.

`get`/`put` contain recoverable `MemoryError` inside their existing lock. They
release all **optional response-cache entries**, reset retained accounting,
record `allocation_failures`, and return a miss or skip. A failed read does
not increment hits. Clearing all entries when a key cannot be built prevents
a stale prior response from surviving an unknown-key replacement failure.
Normal size/shape rejections still do not clear unrelated cached responses.

Only `MemoryError` takes this pressure path: programming failures and
cancellation are not swallowed. The handler is best-effort. Sustained process
exhaustion, OS termination, allocation failures in the handler itself and
model/GPU memory remain outside its guarantees. A cache miss grants no retry,
cloud-routing, spending or data-sharing permission. Hosts must inspect the
counter and apply their own resource/authorization policy.

Primary references:
- Python JSON conversion rules and `iterencode`:
  https://docs.python.org/3.12/library/json.html
- Python's explicitly limited `MemoryError` recovery guarantee:
  https://docs.python.org/3.12/library/exceptions.html#MemoryError

### Follow-up verification

The first 19 follow-up tests ran against unchanged initial #249 code and
reported 16 assertion failures (including subtests), reproducing whole-buffer
allocation, UTF-8 update size, key coercion and escaping allocation failures.
The final suite has 20 tests, including 100 deterministic nested canonical-digest
fixtures. The original 24 memory tests and 9 foundation tests remain unchanged.
Six compiled mutations were detected in isolated temporary copies: removing
string-key validation, removing the UTF-8 budget check, enlarging encoding
blocks, omitting pressure cleanup, miscounting failed reads as hits, and
swallowing non-memory exceptions. Corrected source passed again afterwards.

```sh
python3 test/maria-cache-pressure.test.py
python3 test/maria-cache-memory.test.py
python3 test/maria-runtime-v18.test.py
python3 scripts/benchmark-maria-cache-admission.py --runs 5
```

The existing Ubuntu/macOS workflow runs both cache suites and a one-sample
benchmark semantic smoke check. There is no machine-dependent performance
threshold and no test weakening. Memory-error tests use injected failures,
not actual exhaustion of the CI runner.

### Reproducible request-key benchmark

Linux / CPython 3.11.6; five samples per strategy. The committed benchmark
compares the former whole-buffer strategy against incremental hashing under
the same request preflight. Inputs/imports are created before tracing;
reported peak bytes are `tracemalloc` allocations, **not RSS**. Median timing
is measured separately with tracing off. All accepted digests must match;
both strategies must reject the escaped over-budget fixture.

| Fixture | Strategy | Median peak bytes | Median elapsed ms |
| --- | --- | ---: | ---: |
| large-ascii | whole-buffer-reference | 1,576,453 | 2.901 |
| large-ascii | streaming | 805,150 | 2.353 |
| many-parts | whole-buffer-reference | 1,139,561 | 2.228 |
| many-parts | streaming | 10,600 | 3.733 |
| unicode | whole-buffer-reference | 963,783 | 0.875 |
| unicode | streaming | 532,872 | 0.912 |
| escape-over-budget | whole-buffer-reference | 2,163,453 | 1.402 |
| escape-over-budget | streaming | 1,086,619 | 0.536 |

The many-part fixture trades CPU time (2.228 to 3.733 ms here) for much lower
transient allocation. Do not advertise a universal speedup. Large individual
string tokens still dominate some peaks. These measurements do not establish
native-app, model, orb, swap, battery, or target-device performance.

### Host integration remains separate

The foundation launcher still does not call `PromptCache` or a live model.
The legacy SSH host in `server/cloud/ssh-ai-shell/ai_engine.py` has a different
provider/tool loop and is not a safe drop-in caller for this boundary. It was
inspected, not initialized, rewritten or connected. No SDK, credential, live
provider, native memory-pressure observer or new execution authority was used.
A reviewed provider-host lifecycle with project/provider/session isolation
must precede production cache integration. Existing open platform/native
branches are not imported or overwritten by this follow-up.

## Risks, rollback and next handoff

Risk: optional-cache hit rate changes for large or custom responses; sizing
adds bounded traversal work. Keep actual provider results independent from
cache admission. Rollback is a focused revert of this branch, not deletion of
user data. No dependency, permission, storage migration or deployment changes.

Next: after review, wire a single cache lifecycle to the real provider host,
apply explicit per-session budgets and tested pressure-release signals, then
profile the native app with actual models and the real 3D orb. Preserve the
existing separate work on CI publish-readiness and permission/native stacks.
