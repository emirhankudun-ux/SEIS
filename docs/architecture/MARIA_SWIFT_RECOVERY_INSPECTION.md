# MARIA Swift Recovery Inspection

## Purpose

This slice brings the validated MARIA recovery presentation contract into the existing Apple-native SEIS shell without turning recovery evidence into execution authority.

The user-facing path is intentionally narrow:

```text
Durable recovery evidence
  -> RecoveryDashboardSnapshot
  -> recovery dashboard wire v1
  -> platform-neutral native presentation contract
  -> SeisPlatformKit strict Swift decoder
  -> explicit local JSON import
  -> read-only SeisAppleNativeShell window
```

The Swift layer is a consumer of already-redacted recovery metadata. It is not a checkpoint engine, a live recovery service, an authorization source, or a resume controller.

## Components

### `SeisMariaRecoveryDecoder`

`SeisPlatformKit` owns the strict wire-v1 decoder and immutable display models. The decoder:

- accepts at most 64 KiB of UTF-8 JSON;
- accepts only wire schema version `1` as an integer;
- rejects duplicate keys, including escaped aliases;
- rejects non-integer JSON numbers and unsupported scalar shapes;
- requires the exact envelope and row schemas;
- requires `execution_authorized` to be `false` at envelope and row level;
- validates project binding, row disposition semantics, detail-field semantics and durable schema versions;
- requires work identifiers to remain unique and in Python-compatible deterministic order;
- recomputes aggregate counters from decoded rows and rejects mismatches;
- preserves Python identifier distinctions by using UTF-8 bytes for SwiftUI row identity.

The decoder performs no filesystem, network, process, provider, credential, permission or execution operation.

### `SeisMariaRecoveryFileReader`

The file reader exists only for an explicitly selected local snapshot. It:

- does not discover checkpoint directories;
- does not scan the workspace;
- does not follow the selected file's final symlink component;
- opens read-only and non-blocking;
- requires a regular file;
- bounds the file to the same 64 KiB wire limit;
- leaves the selected bytes unchanged;
- delegates all semantic trust decisions to `SeisMariaRecoveryDecoder`.

`O_NOFOLLOW` protects only the final path component. This helper is not a filesystem sandbox and must not be described as one.

### Cooperative import cancellation

`read(_:)` checks task cancellation before opening a file, after acquiring the file descriptor, around each bounded read, and before/after decoding. Existing synchronous callers remain supported, but calls made from a cancelled task now throw `CancellationError` instead of continuing to read. The descriptor is closed through `defer` on both success and failure.

`readForImport(_:)` is the native UI entry point. It performs the synchronous file work in one structured child task, not an independent detached task. Cancelling the importing task therefore reaches the child. The task group joins the child before returning, so its cleanup completes before the awaiting caller finishes. On Apple platforms, the child balances successful `startAccessingSecurityScopedResource()` calls with `stopAccessingSecurityScopedResource()` in `defer`; it neither persists the URL nor broadens access beyond the selected file. The synchronous `read(_:)` API still leaves any security scope to its caller.

A cancellation check after the child returns also rejects late success from an uncooperative synchronous operation. The UI treats `CancellationError` as cancellation, not as malformed input. Its existing request-identity guard remains in place: task cancellation saves work, while request identity independently prevents stale presentation updates. Clearing or closing the window still only clears in-memory state and requests cancellation; it does not delete the selected file or wait on the main actor for I/O.

Cancellation is **cooperative**, not an operating-system I/O deadline. Neither `O_NONBLOCK` nor task cancellation guarantees immediate interruption of an already-blocked regular-file read or file-provider operation. An in-flight system call may finish before the next cancellation check; the structured caller awaits resource cleanup. No hard wall-clock guarantee, automatic retry or automatic repair is introduced.

The internal operation overload exists solely to make cancellation races reproducible in tests. It is not a public callback, tool-execution or permission-grant API.

### `SeisMariaRecoveryImportState`

Import state distinguishes:

- no source loaded;
- a read in progress;
- validated imported display evidence;
- invalid/unreadable input.

Each import receives an opaque request identity. A late completion from a cancelled, cleared or superseded import cannot restore stale data into the presentation state.

`isLive` and `executionAuthorized` are always `false` in this slice.

### `SeisMariaRecoveryView`

The macOS shell exposes an on-demand `MARIA · Oturum kayıtları` window. The window:

- is opened explicitly from the existing SEIS menu;
- uses the system file importer for JSON selection;
- delegates selected-URL security-scoped access to the async file-reader entry point;
- reads and validates away from the main actor;
- shows project, bounded aggregate counts and public-safe recovery rows;
- uses Turkish presentation labels while retaining stable machine dispositions in the model;
- clears only in-memory presentation state when the user selects `Görünümü temizle`;
- clears its presentation state when the window disappears;
- contains no resume, replay, repair, rollback or execution control.

The interface explicitly says that it has no live connection and that imported evidence does not prove freshness, authenticity or successful completion.

## Trust boundary

A successfully decoded file proves only that the bytes match the bounded recovery presentation contract and its semantic invariants.

It does **not** prove:

- that the file is the newest recovery snapshot;
- that the file came from the current repository checkout;
- that the repository, branch, goal, tools or permissions still match;
- that a `complete` row has passed current acceptance criteria;
- that an `aligned-replan-required` row may resume automatically;
- that any execution is currently authorized.

Any future resume path must stay separate and re-enter current planning, routing, permission, MCP/tool and per-attempt authorization boundaries.

## Privacy and data handling

This slice does not upload imported recovery data or send it to a model/provider. It does not request microphone, camera or screen-recording access. It does not enumerate recovery files automatically.

The wire contract itself excludes checkpoint bodies, recovery anchors, prompts, model/tool output, credentials, permission decisions and execution tokens. The native layer must not add those fields independently.

## Verification

The focused hosted workflow is `.github/workflows/maria-swift-recovery.yml`. On macOS it:

1. records the Swift/Xcode toolchain;
2. verifies the shared Python-to-Swift fixture against the real Python wire/native-adapter path;
3. builds the existing `SeisAppleNativeShell` product;
4. runs the full Swift package test suite, including XCTest and Swift Testing, and renders recovery views;
5. separately runs the cancellation and async reader suites under Thread Sanitizer;
6. verifies the two cancellation mutations in an isolated selected-source package;
7. retains the six synthetic light/dark render artifacts.

The sanitizer step uses `--disable-xctest` only for its focused Swift Testing run. The earlier full package test step still runs XCTest and every existing suite; no baseline test or safety gate is skipped. The sanitizer step introduces no suppression options or permission changes.

Focused tests cover strict JSON/schema handling, Python presentation parity, authorization rejection, counter and row invariants, Unicode identity behavior, byte bounds, explicit-file read-only behavior, symlink/directory/FIFO rejection and stale import-completion handling.

`SeisMariaRecoveryCancellationTests` exercises pre-cancelled reads, cancellation before a missing-file open, ordinary sync/async read-only imports, parent-to-child cancellation, child cleanup, late-success rejection, typed error propagation and off-main execution. Race tests use an explicit start signal and bounded gate rather than timing sleeps.

`SeisMariaRecoveryAsyncReaderTests` also exercises the actual public async entry point against synthetic local files: the exact 64 KiB boundary and one-byte overflow, invalid UTF-8/JSON, forged authorization/counters, symlink/directory/FIFO/missing-file rejection, non-local URL rejection, Unicode paths and independent imports when 12 of 24 concurrent calls are pre-cancelled. It checks that selected bytes and sibling file lists are not rewritten.

The first native implementation run exposed a test portability error: Darwin marks semaphore waits unavailable in async contexts, including immediate observation checks that compiled under the Linux toolchain. The observations now use short, scoped `NSLock` access; only the deliberately synchronous fixture operation uses a bounded semaphore gate. No concurrency diagnostics were disabled and no test was removed.

The original two regressions were observed both in a Git-blob-verified Linux extraction and on the unchanged macOS PR checkout (MARIA Swift Recovery run `34592421655`). The native shell built and the other Swift tests passed; the cancellation tests returned a snapshot or `unreadableFile` instead of `CancellationError`.

Local targeted mutation checks confirmed that replacing the structured child with a detached task, or removing the post-result cancellation check, breaks the corresponding regression test. These are fault-injection checks, not a claim of exhaustive mutation coverage or independent review. The focused Linux extraction does not replace the full hosted macOS build/test lane.

To reproduce the focused mutation check locally, run:

```sh
python3 scripts/check-maria-swift-cancellation-mutations.py
```

The checker requires an installed Swift toolchain and uses only Python's standard library. It copies the three named recovery source files and two focused test files into a private temporary Swift package with no external dependencies or package plugins. It verifies a passing baseline, one expected test failure per mutation, a passing restored implementation, and unchanged source-checkout bytes. A compiler error, timeout, missing test run, changed mutation anchor or unexpected test result fails verification; none is accepted as proof that a mutation was detected. The temporary package is removed on exit. This checker does not replace full-package macOS tests, app rendering, sandbox entitlement validation or user-acceptance testing.

Repository-wide MARIA Learning Fabric, SEIS System Gates and Foundation Check remain independent regression gates.

## Failure handling

Invalid or unreadable input fails closed into a bounded presentation error. Raw paths, JSON payloads and decoder internals are not surfaced through the public error vocabulary.

The UI never repairs or rewrites an invalid snapshot. The user may clear the presentation and choose another file.

## Rollback

The slice is additive and isolated in the stacked recovery branch. Rolling it back means reverting the Swift recovery files, tests, focused workflow and shell window integration; it requires no external resource cleanup.

The cancellation-only follow-up can be reverted independently by restoring the file reader and view import implementation and removing its focused tests/documentation. It makes no persisted schema or data changes.

## Next safe boundary

Do not add automatic resume to this view.

The next native recovery step, if needed, should first define a separate authenticated/current-context evidence source and prove freshness semantics. Only after that should an independently permission-gated execution design be considered.
