# SEIS PR Stack Packaging Plan

This note protects the current local SEIS review branch from being described as
a single PR2 data-only change.

The machine-readable source is
`content/development/seis-pr-stack-packaging-plan.json`.

## Current Rule

The current branch may contain multiple review slices. It must not be opened or
described as a single `pr2-web-demo-visibility-data-first` PR while the branch
diff contains non-PR2 paths such as `apps/seis-demo-web/script.js`.

Required public statement: current branch is a branch stack, not a single PR2 data-only PR.

PR2 data-only work may include the static foundation dashboard JSON, its direct
data checker, the boundary checker, and PR queue/sequence wording needed to keep
the UI pending, no-key, no-provider, and no-fake-live boundary explicit.

## GitHub Boundary

- Do not push without explicit owner approval.
- Do not push directly to `main`.
- Do not force push.
- Do not merge, deploy, publish, or mutate remote state from this package.
- If the full current branch is pushed, present it as a stacked foundation
  branch, not as a PR2 data-only branch.

## Validation

```bash
node scripts/check-seis-pr-stack-packaging-plan.mjs
```

The checker parses `git diff --name-status
origin/feature/apple-first-foundation...HEAD` when that local remote-tracking
ref exists. It fails on delete/rename/copy changes, unclassified branch paths,
or any attempt to allow a single PR2 data-only claim while non-PR2 paths are in
the branch diff.

This validation is a packaging guard only. It does not prove public release,
live AI, provider credentials, deployment, elapsed five-year execution, or
write-capable subagent autonomy.
