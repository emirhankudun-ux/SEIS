# SEIS PR0 Foundation Staging Pathspec

## Purpose

This note documents the exact PR0 staging boundary for the foundation manifest
package. The machine-readable source is
`content/development/seis-pr0-foundation-staging-pathspec.json`.

## Boundary

This is a pathspec safety contract, not a staging operation. It does not run
`git add`, does not commit, and does not claim the worktree is clean.

The safe PR0 list contains only the public-safe source provenance, five-year
agency orchestration, MCP risk, Stitch catalog, Swift/Apple bridge manifests,
their direct checkers, short docs, ADRs, and SEIS Brain context packs.

Mixed or high-risk paths stay outside this pathspec. In particular,
`package.json`, `apps/seis-demo-web/script.js`, existing SwiftUI shell diffs,
AI runtime files, SSH/cloud files, generated reports, and downloadable
reference trees must not be staged by this slice.

## Enterprise Direction

The pathspec supports the broader SEIS goal of building toward major-company
engineering standards through architecture quality, trust, security,
accessibility, evidence, modularity, design craft, and long-horizon execution.
It does not make market-share, benchmark, revenue, or live-capability claims.

## Installed Tools And Plugins

Installed AI tools, plugins, MCPs, and skills should be used when they are fit
for a specific task and permission-safe. Blind enablement, write-capable
external mutation, secret sharing, and fake tool-usage claims remain blocked.

## Verification

Run the PR0 acceptance sequence in this order:

```sh
node scripts/check-seis-source-provenance-intake.mjs
node scripts/check-seis-five-year-agency-orchestration-contract.mjs
node scripts/check-seis-mcp-permission-risk-matrix.mjs
node scripts/check-seis-stitch-ux-screen-catalog.mjs
node scripts/check-seis-swift-apple-bridge-manifest.mjs
node scripts/check-seis-pr0-foundation-staging-pathspec.mjs
node scripts/check-seis-pr0-staged-boundary.mjs
npm run check:js
node --test packages/seis-ai/test/mcp-smoke.test.mjs
```

Also review `docs/INDEX.md` and `docs/STATUS.md` for PR0 visibility without
staging unrelated dirty status work. The staged-boundary checker inspects the
Git index. If anything is staged, every staged path must be either a PR0
pathspec-safe path or one of this ledger's control paths.
