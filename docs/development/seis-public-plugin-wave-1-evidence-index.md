# SEIS Public Plugin Wave 1 Evidence Index

`seis-public-plugin-wave-1-evidence-index` is a repository-owned, generated
record for Wave 1 of `SEIS-GOAL-021`. It reconciles the public `SEIS Repo`
marketplace, app-owned package count, release train, public-install evidence,
MCP permission boundary, UI evidence, Round 4 capability decision, and
public-release gate in one bounded view. Schema version 2 separates the
immutable Wave 1 handoff snapshot from current marketplace revalidation.

## What it proves

- The historical Wave 1 handoff remains exactly 377 direct marketplace cards
  and 71 app-owned packages. The selected `seis-evidence-index` capability had
  one direct card in that immutable snapshot.
- The current curated projection is 34 cards: one canonical SEIS-Agent card,
  6 application bundles, and 27 topic bundles. It retains 380 repository
  sources: 5 root modules, 75 app-owned packages, and 300 topic packages.
- The selected `seis-evidence-index` source remains present and resolves
  through exactly one current card, `seis-application-bundle-04`; a direct
  source card is neither required nor present in the curated projection.
- The current 75 app-owned source packages agree with the active app release
  label and semver.
- The declared MCP ledger remains deny-by-default: write, network, and secret
  permissions are empty and public release remains disallowed.
- The Command Center static UI-state contract is ready; the separately tracked
  desktop surface still has four static marker gaps.
- The inspected generated inputs contain no machine-specific-path or
  secret-like finding. The index records only finding categories and paths,
  never raw values.

## What it does not prove

- A browser, screen-reader, network, provider, or installation run.
- Independent public installation, publication, release, deployment, or human
  approval.
- Resolution of the desktop UI-state gaps.

## Validation

    npm run automation:seis-public-plugin-wave-1-evidence-index
    npm run check:seis-public-plugin-wave-1-evidence-index
    npm run check:seis-public-plugin-wave-1-capability-decision
    npm run check:seis-public-plugin-bundles
    npm run check:seis-evidence-index
    npm run check:seis-repo-marketplace

The generated record is
`content/development/seis-public-plugin-wave-1-evidence-index.json`.
