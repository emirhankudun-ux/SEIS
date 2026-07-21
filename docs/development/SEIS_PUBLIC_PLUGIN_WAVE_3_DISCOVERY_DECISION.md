# SEIS Public Plugin Wave 3 Discovery Decision

**Goal:** `SEIS-GOAL-021`
**Status:** `approved-discovery-candidate`
**Candidate:** `seis-swift-concurrency-audit`

Wave 3 has selected one bounded candidate for design review. This is a
repository-local discovery decision only: no package exists yet, no `SEIS Repo`
card was added, and the Wave 3 program remains `planned` with its own selection
field empty until the implementation gate passes.

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

Before the candidate can become a public package, the implementation must add
its own deny-by-default runtime, deterministic positive/negative fixtures,
plugin-creator structural validation, and all app-source, catalog, matrix,
registry, lifecycle, provenance, and public `SEIS Repo` reconciliation. Only
then may Wave 3 move from `planned` to a focused implementation scope.

## Evidence and rollback

Machine-readable evidence is generated at
`content/development/seis-public-plugin-wave-3-capability-decision.json` by
`scripts/create-seis-public-plugin-wave-3-capability-decision.mjs`.

Rollback is a focused feature-branch revert of this decision, test, and
documentation checkpoint. It has no data migration, package, marketplace-card,
or external-state cleanup because none has been created.
