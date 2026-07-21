# SEIS Public Plugin Wave 3 Capability Decision

**Goal:** `SEIS-GOAL-021`
**Status:** `approved-public-local-implementation`
**Candidate:** `seis-swift-concurrency-audit`

Wave 3 completed the bounded discovery gate and is now in an active,
repository-local implementation state. The public
`plugins/seis-core/seis-swift-concurrency-audit` package and its `SEIS Repo`
card are present; the program selects that one capability and records step 47
as the current generated-evidence task. This does not claim an independent
installation, public release, provider connection, deployment, native runtime,
or completed SwiftPM test.

## Why this capability is distinct

`seis-apple-native-readiness` verifies declared Swift Package structure,
bounded source/test presence, and Apple platform strategy. It intentionally
does not assess Swift concurrency annotations or static risk signals. The
candidate would cover only that missing boundary: a read-only inspection of two
fixed checked-in Swift source roots for aggregate concurrency markers.

It does not replace workspace inspection, technology taxonomy, or source
provenance packages.

## Safety contract

- Fixed repository-relative inputs only; no arbitrary filesystem path.
- No symlink traversal; bounded file count, depth, per-file bytes, total bytes,
  and reported-path count.
- Aggregate counts and capped relative filenames only; no raw Swift text or raw
  matched values.
- Empty write, network, and secret permissions.
- No compiler, SwiftPM test, native app, signing, deployment, provider, or
  release claim.

The discovery snapshot records concurrency marker counts only. Its current
input-safety path marker state is `attention` without persisting a matched
value; that is a sanitization signal, not a credential or runtime finding. The
precise credential-assignment scan found no matches.

## Current gate

The package has its deny-by-default runtime, deterministic positive/negative
fixtures, plugin-creator structural validation, and public-card reconciliation.
Wave 3 remains in progress until current generated evidence, source/catalog/
matrix/registry/lifecycle/provenance reconciliation, broad local regressions,
and a focused feature-branch handoff are all recorded. No release or external
installation authority is created by this gate.

## Evidence and rollback

Machine-readable evidence is generated at
`content/development/seis-public-plugin-wave-3-capability-decision.json` by
`scripts/create-seis-public-plugin-wave-3-capability-decision.mjs`.

Rollback is a focused feature-branch revert of the package, `SEIS Repo` card,
generated evidence, tests, decision, and documentation. It has no data
migration or external-state cleanup.
