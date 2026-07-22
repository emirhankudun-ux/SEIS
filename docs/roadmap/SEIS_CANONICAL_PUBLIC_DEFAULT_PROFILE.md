# SEIS Canonical Public Default Profile

## User-facing outcome

SEIS Repo has a compact public distribution model:

- one canonical default: `seis-ai-agent@seis-repo`;
- 33 optional curated bundles, selected only when a scoped task needs one;
- no bulk installation of the retained source capabilities;
- at most 15 source capabilities inside each optional bundle.

The source modules named `seis`, `seis-cloud`, `seis-code`, `seis-design`,
`seis-data`, `seis-security`, `seis-research`, `seis-automation`, and
`seis-product` are already embedded inside SEIS-Agent. Leaving all of their
direct `@seis-repo` configuration records active makes the real UI noisier than
the canonical package model without adding capability coverage.

## Read-only plan

```bash
npm run plan:seis-public-marketplace-canonical-default
```

The plan derives its targets from the checked-in `unified-suite.json`, reports
aggregate counts only, verifies that the canonical public SEIS-Agent is enabled,
and distinguishes three safe categories:

- embedded direct public source records that can be removed from the active
  local profile;
- curated optional bundle records, which are preserved;
- unknown public records, which are preserved and reported as unmanaged.

## Explicit, reversible apply

After reviewing the plan and receiving current human approval:

```bash
node scripts/manage-seis-public-marketplace-switch.mjs --apply --canonicalize-public
```

The command creates and verifies a same-directory backup, re-checks both the
local config and the unified-suite profile immediately before the atomic write,
then proves that no embedded direct source record remains. It leaves the
canonical SEIS-Agent, optional bundles, all source folders, caches, and
non-SEIS configuration records untouched.

Use the backup filename emitted by the command for a constrained rollback:

```bash
node scripts/manage-seis-public-marketplace-switch.mjs --apply --restore <backup-filename>
```

## Boundaries

- This does not change the 34-card marketplace, its 33 optional bundles, or
  the 380 retained source capabilities.
- It never installs a bundle; users choose an optional bundle later through the
  existing journey finder and plan-only installer.
- It has no network, provider, secret, GitHub, deployment, release, or
  background-agent path.
- Supervised Auto Mode cannot invoke this local config action automatically.
- Refreshing the Codex UI is a manual evidence step. Do not remove caches just
  because a card is temporarily stale.
