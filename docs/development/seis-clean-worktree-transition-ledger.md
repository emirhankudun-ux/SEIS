# SEIS Clean Worktree Transition Ledger

## Purpose

This note explains the public-safe transition from the current broad dirty tree
to a clean SEIS worktree. The machine-readable source is
`content/development/seis-clean-worktree-transition-ledger.json`.
Its direct quality gate is
`node scripts/check-seis-clean-worktree-transition-ledger.mjs`.

## Boundary

The ledger does not clean the tree by itself and does not approve destructive
cleanup. It exists to prevent accidental bulk staging, user-work overwrite,
raw asset dumps, provider calls, SSH/deploy mutation, secret exposure, or mixed
PR scope.

The ledger also keeps `package.json` and
`apps/seis-demo-web/script.js` excluded until explicit review. They may remain
dirty locally, but they must not be staged by this PR0/PR1 transition slice.

The PR0 exact pathspec lives in
`content/development/seis-pr0-foundation-staging-pathspec.json`. Its staged
boundary gate is `node scripts/check-seis-pr0-staged-boundary.mjs`.

## Current Sequence

1. PR0 stages only foundation manifests, direct checkers, short docs, ADRs, and
   SEIS Brain context packs.
2. PR1 stages only additive Swift model and fixture-loading test files.
3. The coordination slice stages the PR0/PR1/PR2 sequence record, this clean
   worktree ledger, its checker, and roadmap queue/backlog links.
4. PR2 begins with data/checker-only web visibility and does not touch the
   existing dirty `apps/seis-demo-web/script.js` without explicit approval.
5. All AI runtime, web UI, SSH/cloud, GitHub governance, report, and large
   downloadable/reference changes stay parked or become separate PRs after
   owner review.

## Verification

Run:

```sh
node scripts/check-seis-source-provenance-intake.mjs
node scripts/check-seis-five-year-agency-orchestration-contract.mjs
node scripts/check-seis-mcp-permission-risk-matrix.mjs
node scripts/check-seis-stitch-ux-screen-catalog.mjs
node scripts/check-seis-swift-apple-bridge-manifest.mjs
node scripts/check-seis-clean-worktree-transition-ledger.mjs
node scripts/check-seis-pr0-foundation-staging-pathspec.mjs
node scripts/check-seis-pr0-staged-boundary.mjs
npm run check:js
node --test packages/seis-ai/test/mcp-smoke.test.mjs
```

Useful adjacent checks:

```sh
node scripts/check-seis-pr0-pr1-pr2-implementation-sequence.mjs
npm run check:master-backlog
```

Before promotion, review `docs/INDEX.md` and `docs/STATUS.md` for PR0
visibility without staging unrelated dirty status work.

## Security

The ledger is public-safe metadata only. It contains no local absolute paths,
private keys, provider keys, SSH hosts, deployment credentials, or raw archive
contents.
