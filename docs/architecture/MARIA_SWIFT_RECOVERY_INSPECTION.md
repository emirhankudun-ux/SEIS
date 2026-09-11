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
- starts security-scoped access only for the selected URL when available;
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
4. runs the `SeisPlatformKit` Swift test suite.

Focused tests cover strict JSON/schema handling, Python presentation parity, authorization rejection, counter and row invariants, Unicode identity behavior, byte bounds, explicit-file read-only behavior, symlink/directory/FIFO rejection and stale import-completion handling.

Repository-wide MARIA Learning Fabric, SEIS System Gates and Foundation Check remain independent regression gates.

## Failure handling

Invalid or unreadable input fails closed into a bounded presentation error. Raw paths, JSON payloads and decoder internals are not surfaced through the public error vocabulary.

The UI never repairs or rewrites an invalid snapshot. The user may clear the presentation and choose another file.

## Rollback

The slice is additive and isolated in the stacked recovery branch. Rolling it back means reverting the Swift recovery files, tests, focused workflow and shell window integration; it requires no external resource cleanup.

## Next safe boundary

Do not add automatic resume to this view.

The next native recovery step, if needed, should first define a separate authenticated/current-context evidence source and prove freshness semantics. Only after that should an independently permission-gated execution design be considered.
