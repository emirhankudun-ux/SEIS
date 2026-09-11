# MARIA Recovery Input Consistency

## Scope

PR #227 hardens the existing recovery path on top of the native reader in #225. It does not introduce a second recovery engine, new wire version, dependency, background service, or execution surface. The isolated integration follow-up in PR #229 additionally verifies this hardening together with the Swift cancellation path from #228 and closes cross-language contract gaps discovered during that joint review.

The retained architecture is:

`DurableWorkCheckpointStore -> RecoveryCandidateInspector -> RecoveryDashboardBuilder -> RecoveryDashboardWireCodec -> RecoveryNativeBridgeAdapter / SeisMariaRecoveryDecoder -> existing SwiftUI shell`.

The Swift shell is unchanged by the Python hardening. Hosted native build, Python/Swift golden-fixture parity, package tests, and synthetic view rendering remain regression gates rather than claims of a newly implemented native app.

## Reproduced defects and fixes

### Visibility after a trusted concurrent write

Discovery filtered complete records, but a subsequent inspection reloaded each record. A checkpoint completed between those operations was then added to the default incomplete-only dashboard. Its row and aggregate counts contradicted the requested filter.

The builder now reapplies `include_complete` to the inspected state. Deleted records remain omitted; corruption still raises without returning partial rows. Tests inject deterministic trusted-writer interleavings through the existing inspector boundary; they do not depend on sleeps or scheduler timing.

### Validation before using typed data

Python dataclass annotations do not enforce field types. A list/dictionary disposition could reach set/dictionary lookup and raise an unhandled `TypeError`; a plain-string host disposition could reach `.value` and raise `AttributeError`. Encoding also materialized collections before checking their declared bounds.

The wire encoder now checks tuple shape/cardinality before iterating rows and detail collections, and verifies enum identity before accessing `.value`. Decoding and the typed native adapter check string type before hashing a disposition. Known malformed field inputs remain within `RecoveryDashboardWireError` or `RecoveryNativeBridgeError`. Incorrect top-level API argument types retain their documented `TypeError` behavior.

Lone UTF-16 surrogate escapes are rejected at both wire and direct typed-native boundaries. Valid supplementary Unicode and canonically distinct identifiers are preserved unchanged: the fix does not normalize identifiers or replace invalid text. Swift's existing decoder already rejects the invalid escapes; the Python side now avoids exporting those unusable native identities.

The wire JSON parser also normalizes recursion-limit failure to its redacted contract error. The 64 KiB byte ceiling remains in place. This is not a new promise of parser equivalence for every possible JSON number or arbitrary Python subclass.

### Signed integer parity across Python and native Swift

Python integers are arbitrary precision, while the supported native Apple client decodes JSON integers into signed 64-bit Swift `Int`. During the #229 integration review, a durable row `schema_version` greater than `Int.max` was accepted by the Python wire decoder, encoder and direct typed-native adapter even though the Swift decoder could not represent the same value. That created a wire payload Python could describe as valid while the native consumer necessarily rejected it.

`RecoveryDashboardWireCodec.MAX_NATIVE_INTEGER` now fixes the shared upper bound at `2^63 - 1`. Durable row schema versions must be positive integers within that range in both the wire codec and direct typed-native adapter. This does not change the wire-v1 field set or current durable schema values (v1/v2); it prevents Python-only values from crossing a contract advertised to the 64-bit Apple-native client.

The test was committed first at `a12766ebef49b2794c6b6aad626c58307f9b85e3`. Hosted `MARIA Learning Fabric` run `34598480718` reproduced six expected failures covering decode, encode and direct typed-native construction at `2^63` and `2^100`. The bounded implementation then restored the full MARIA regression sweep.

### Dashboard rows require concrete durable schema evidence

`RecoveryCandidateView.schema_version` remains optional because the pre-dashboard `NOT_FOUND` state has no durable record. A dashboard row is different: `RecoveryDashboardBuilder` omits `NOT_FOUND`, every surviving row came from a validated durable checkpoint, and the Swift presentation model requires a concrete `Int` schema version. The Python wire row nevertheless still annotated and decoded that field as `int | None`, allowing JSON `null` to pass the wire decoder before failing at the native bridge.

The wire boundary now makes this invariant explicit. `RecoveryDashboardWireRow.schema_version` is a concrete `int`, and a shared `_durable_schema_version()` validator is used by both host-created encoding and JSON decoding. `null`, booleans, non-integers, non-positive values and values above the signed native range are rejected before a wire row is constructed. The pre-dashboard candidate model remains unchanged, so absence can still be represented only where it is semantically valid.

The contract was added test-first at `ffa7d6c5fb5a08d97240d70b4bfcb7d9d5e583e7`. Hosted `MARIA Learning Fabric` run `34599068696` failed specifically because `schema_version=null` was still accepted by the wire decoder. The minimal wire-model/validator change at `a6d81c87ca7228eb9422b8af782020073555adb6` restored the MARIA Python regression sweep without changing wire field names or execution authority.

### Bounded directory enumeration, not just bounded output

The previous catalog sorted the entire directory's JSON candidate list before applying its 256-file ceiling. It also had no total-entry ceiling for ignored files.

Discovery now uses context-managed `os.scandir`. It retains at most 256 candidate paths, stops upon observing a 257th JSON candidate, and stops upon observing a 1025th total directory entry. Only the bounded candidate set is sorted; no checkpoint is parsed before these checks pass. Non-JSON entry contents are not read. The directory iterator closes on success or failure. Existing caller result limits and fail-closed overflow remain unchanged.

The 1024-entry budget is deliberate: many stale temporary or unrelated files must not turn an apparently small recovery catalog into an unbounded scan. Exceeding a bound requires an explicit host/owner decision; this code never deletes or repairs files automatically.

### Save/load shape symmetry

The durable validator previously compared values before validating their exact roles. For example, `complete=1` or `succeeded_steps=True` could pass equality checks, overwrite a checkpoint, and produce JSON that the same store refused to load. Invalid enum and collection values could also escape as implementation-level exceptions.

Before persistence, the shared validator now requires tuple collections, a boolean completion flag, non-negative integer counters excluding boolean/float aliases, real route/state enums, and a string failure category when present. Invalid shape fails before creating a project directory or replacing a valid file. Existing graph, completion-pointer, state/evidence, v1-read/v2-write and authorization rules are preserved.

Tests compare the previous file byte-for-byte after each rejected save, reload the valid baseline, and check that no temporary files remain. Each invalid subcase resets only its synthetic fixture so a RED write cannot contaminate the next case.

### Fault injection for the existing write path

Four additional acceptance tests cover synthetic file-flush failure before replacement, replacement failure, best-effort directory-flush failure, and private POSIX file modes. The first two require the original checkpoint bytes to survive unchanged and temporary files to be removed. The directory-flush test preserves the documented best-effort behavior after a successful replacement. This verifies existing write-path behavior rather than claiming a new defect or a simulated power-loss durability proof; filesystem and hardware guarantees remain outside these tests.

## Test-first evidence

The hardening groups have hosted RED evidence before their implementations:

| Contract | Test-only head | MARIA Learning run |
| --- | --- | --- |
| Completion interleaving | `c4446f555a69da4706a421eb25a16114332f5775` | `34592378960` |
| Wire and typed-native input | `b3df7f78e4f6bebbe1cefeb66792edcf86d72e52` | `34592572324` |
| Enumeration budgets | `534d4d61d0cc2784ea5833648e61ce2bbc7b7e0e` | `34593108306` |
| Isolated invalid-save inputs | `2460af21b56c82b671c998a529e71044ea436789` | `34593740201` |
| Native signed-integer parity | `a12766ebef49b2794c6b6aad626c58307f9b85e3` | `34598480718` |
| Concrete dashboard schema version | `ffa7d6c5fb5a08d97240d70b4bfcb7d9d5e583e7` | `34599068696` |

These are failure classes with multiple subcases, not a claim that every failed subcase is a different security vulnerability. Final acceptance must use the integration PR's current-head checks, not a prior green commit.

Focused commands (39 unittest methods, with additional subcases):

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

Valid wire-v1 field names and JSON formatting are unchanged. Durable schema v1 remains readable and new writes remain v2. No migration write-back is introduced. Host-created dataclasses must obey their existing annotated collection/scalar roles rather than rely on accidental coercion. Once a candidate is admitted to the dashboard, durable schema version metadata must be concrete and fit the signed 64-bit range shared with the supported Swift native consumer.

All recovery, wire and native presentation objects remain non-authorizing. In particular, aligned context is not execution permission and a complete checkpoint is not proof that all work succeeded. No resume button, command, model invocation, credential access, permission change or external-account operation is added.

The storage root still belongs to a trusted private host account. The scanner is not a hostile-filesystem sandbox; the dashboard is not an atomic transaction across files. Imported UI snapshots still do not prove freshness or source authenticity. Arbitrary hostile Python subclasses are outside these JSON/data-shape boundaries.

Rollback for the original #227 hardening is limited to its focused commits; the signed-integer and concrete-schema follow-ups are isolated on `integration/maria-recovery-hardening-cancellation-v1`. Existing source branches and `main` are unchanged by the integration work. Do not delete user checkpoints to roll back code.

## Next safe step

After the joint integration checkpoint is reviewed, bind an explicitly selected, read-only current-workspace evidence source to the existing presentation flow, with revision/freshness checks and stale-result tests. Preserve the current file-only mode and its visible limitations. Do not turn snapshot import or a green status into execution authority.
