# MARIA Recovery Input Consistency

## Scope

PR #227 hardens the existing recovery path on top of the native reader in #225. It does not introduce a second recovery engine, new wire version, dependency, background service, or execution surface.

The retained architecture is:

`DurableWorkCheckpointStore -> RecoveryCandidateInspector -> RecoveryDashboardBuilder -> RecoveryDashboardWireCodec -> RecoveryNativeBridgeAdapter / SeisMariaRecoveryDecoder -> existing SwiftUI shell`.

The Swift shell is unchanged in this patch. Hosted native build, Python/Swift golden-fixture parity, package tests, and synthetic view rendering remain regression gates rather than claims of a newly implemented native app.

## Reproduced defects and fixes

### Visibility after a trusted concurrent write

Discovery filtered complete records, but a subsequent inspection reloaded each record. A checkpoint completed between those operations was then added to the default incomplete-only dashboard. Its row and aggregate counts contradicted the requested filter.

The builder now reapplies `include_complete` to the inspected state. Deleted records remain omitted; corruption still raises without returning partial rows. Tests inject deterministic trusted-writer interleavings through the existing inspector boundary; they do not depend on sleeps or scheduler timing.

### Validation before using typed data

Python dataclass annotations do not enforce field types. A list/dictionary disposition could reach set/dictionary lookup and raise an unhandled `TypeError`; a plain-string host disposition could reach `.value` and raise `AttributeError`. Encoding also materialized collections before checking their declared bounds.

The wire encoder now checks tuple shape/cardinality before iterating rows and detail collections, and verifies enum identity before accessing `.value`. Decoding and the typed native adapter check string type before hashing a disposition. Known malformed field inputs remain within `RecoveryDashboardWireError` or `RecoveryNativeBridgeError`. Incorrect top-level API argument types retain their documented `TypeError` behavior.

Lone UTF-16 surrogate escapes are rejected at both wire and direct typed-native boundaries. Valid supplementary Unicode and canonically distinct identifiers are preserved unchanged: the fix does not normalize identifiers or replace invalid text. Swift's existing decoder already rejects the invalid escapes; the Python side now avoids exporting those unusable native identities.

The wire JSON parser also normalizes recursion-limit failure to its redacted contract error. The 64 KiB byte ceiling remains in place. This is not a new promise of parser equivalence for every possible JSON number or arbitrary Python subclass.

### Bounded directory enumeration, not just bounded output

The previous catalog sorted the entire directory's JSON candidate list before applying its 256-file ceiling. It also had no total-entry ceiling for ignored files.

Discovery now uses context-managed `os.scandir`. It retains at most 256 candidate paths, stops upon observing a 257th JSON candidate, and stops upon observing a 1025th total directory entry. Only the bounded candidate set is sorted; no checkpoint is parsed before these checks pass. Non-JSON entry contents are not read. The directory iterator closes on success or failure. Existing caller result limits and fail-closed overflow remain unchanged.

The 1024-entry budget is deliberate: many stale temporary or unrelated files must not turn an apparently small recovery catalog into an unbounded scan. Exceeding a bound requires an explicit host/owner decision; this code never deletes or repairs files automatically.

### Save/load shape symmetry

The durable validator previously compared values before validating their exact roles. For example, `complete=1` or `succeeded_steps=True` could pass equality checks, overwrite a checkpoint, and produce JSON that the same store refused to load. Invalid enum and collection values could also escape as implementation-level exceptions.

Before persistence, the shared validator now requires tuple collections, a boolean completion flag, non-negative integer counters excluding boolean/float aliases, real route/state enums, and a string failure category when present. Invalid shape fails before creating a project directory or replacing a valid file. Existing graph, completion-pointer, state/evidence, v1-read/v2-write and authorization rules are preserved.

Tests compare the previous file byte-for-byte after each rejected save, reload the valid baseline, and check that no temporary files remain. Each invalid subcase resets only its synthetic fixture so a RED write cannot contaminate the next case.

## Test-first evidence

All four behavioral groups had hosted RED evidence before their implementation:

| Contract | Test-only head | MARIA Learning run |
| --- | --- | --- |
| Completion interleaving | `c4446f555a69da4706a421eb25a16114332f5775` | `34592378960` |
| Wire and typed-native input | `b3df7f78e4f6bebbe1cefeb66792edcf86d72e52` | `34592572324` |
| Enumeration budgets | `534d4d61d0cc2784ea5833648e61ce2bbc7b7e0e` | `34593108306` |
| Isolated invalid-save inputs | `2460af21b56c82b671c998a529e71044ea436789` | `34593740201` |

These are four failure classes with many subcases, not a claim that every failed subcase is a different security vulnerability. Final acceptance must use the PR's current-head checks, not a prior green commit.

Focused commands (33 unittest methods, with additional subcases):

```sh
python3 test/maria-recovery-dashboard-race.test.py
python3 test/maria-recovery-input-boundary.test.py
python3 test/maria-recovery-catalog-bounds.test.py
python3 test/maria-recovery-save-contract.test.py
```

Full runtime regression:

```sh
set -eu
for test_file in test/maria-*.test.py; do
  python3 "$test_file"
done
```

Native regression on the supported macOS runner:

```sh
python3 test/maria-swift-recovery-parity.test.py
swift build --package-path packages/seis_platform_swift --product SeisAppleNativeShell
swift test --package-path packages/seis_platform_swift
```

The existing native workflow retains six synthetic renders: loaded, unloaded and invalid states, each in light and dark appearance. Rendering demonstrates those fixture views, not successful live-provider execution, a packaged/notarized release, or user-machine launch.

## Compatibility, authority and rollback

Valid wire-v1 field names and JSON formatting are unchanged. Durable schema v1 remains readable and new writes remain v2. No migration write-back is introduced. Host-created dataclasses must obey their existing annotated collection/scalar roles rather than rely on accidental coercion.

All recovery, wire and native presentation objects remain non-authorizing. In particular, aligned context is not execution permission and a complete checkpoint is not proof that all work succeeded. No resume button, command, model invocation, credential access, permission change or external-account operation is added.

The storage root still belongs to a trusted private host account. The scanner is not a hostile-filesystem sandbox; the dashboard is not an atomic transaction across files. Imported UI snapshots still do not prove freshness or source authenticity. Arbitrary hostile Python subclasses are outside these JSON/data-shape boundaries.

Rollback is limited to the focused commits on `fix/maria-recovery-input-consistency-v1`. Existing branches and `main` are unchanged by this work; integration and deployment still require owner review. Do not delete user checkpoints to roll back this code.

## Next safe step

Bind an explicitly selected, read-only current-workspace evidence source to the existing presentation flow, with revision/freshness checks and stale-result tests. Preserve the current file-only mode and its visible limitations. Do not turn snapshot import or a green status into execution authority.
