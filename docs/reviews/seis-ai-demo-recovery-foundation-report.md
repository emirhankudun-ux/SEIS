# SEIS AI Desktop Demo Recovery and Foundation Report

Date: 2026-06-19

## Repository Condition

- The selected workspace root is not a Git repository; it contains multiple
  SEIS-related folders and application bundles.
- Canonical target selected: `SEIS`, based on repository instructions and the
  `SEIS-ai-core-app-foundation/MOVED_TO_SEIS.md` consolidation note.
- Main `SEIS` worktree had substantial unrelated local changes on
  `codex/sync-icloud-seis-20260619`, including modified docs/scripts and an
  untracked `apps/command-center/` folder.
- To avoid touching that work, this implementation used a separate clean
  worktree on `seis/ai-demo-app-foundation`, tracking `origin/main`.

## Source of Truth Files Found

- `AGENTS.md`
- `README.md`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `.gitignore`
- `.github/`
- `docs/`
- `apps/`
- `packages/`
- `scripts/`

`ARCHITECTURE.md`, `ROADMAP.md`, and `CHANGELOG.md` are not top-level files in
the selected worktree; architecture, roadmap, and decision material exists under
`docs/`.

## Pull Request Status

Open PRs visible through GitHub CLI:

| PR | State | Classification | Recommended action |
| --- | --- | --- | --- |
| #37 `ci: stabilize main governance and secret scans` | Open | Useful, high-impact CI/security | Review before merge |
| #33 `Codex/sync icloud seis 20260619` | Open | Useful but locally dirty in existing worktree | Keep isolated; do not mix with this demo |
| #32 `Codex/publish local seis 20260618 163043` | Open | Potentially useful, overlaps previous publish work | Review for duplication |
| #28 cloud SSH setup | Open | Security-sensitive | Require human approval and rollback plan |
| #27 dual-focus repository development | Open | Broad platform work | Review scope before merge |
| #24 Swift diagnostics/language governance | Open | Platform lane work | Review after CI |
| #23 portfolio PWA/macOS demo | Draft | Product/demo overlap | Compare for duplicate UI claims |
| #22 cloud readiness guards | Open | Security/cloud | Review carefully |
| #20 consolidate all open PRs | Open | Broad and risky | Do not merge wholesale |
| #19 polyglot kernel | Open | Potential duplicate of merged #18 | Check merge state |
| #16, #10, #9, #8, #7, #6, #5 evolution/publish-gate variants | Open | Likely duplicates/outdated variants | Consolidate or close after review |
| #12 plugin registry | Open | Useful platform registry | Review for current data drift |
| #11 CLAUDE.md/test roadmap | Open | Documentation support | Review for overlap |
| #3 portfolio content/UI | Open | Older product surface | Compare with current `apps/web` |

Recent closed PRs visible through GitHub CLI were merged (#38, #36, #35, #34,
#31, #29, #25, #21, #18, #17, #4). They should not be recovered again.

## Closed PR Rescue Plan

- Safe work to recover: only current source-of-truth ideas already represented
  in official docs or merged PRs.
- Unsafe work to exclude: broad PR consolidation, cloud/SSH changes, branch
  cleanup, generated folders, secrets, private material, or unreviewed archive
  content.
- PRs to leave closed: merged PRs listed above.
- PRs to replace: duplicate evolution/publish-gate variants should be replaced
  by one clean branch if still needed.
- Unrecoverable PRs: none inspected deeply in this pass; unavailable diffs were
  not assumed.

## Folder Classification Table

| Folder | Classification | Reason | Action |
| --- | --- | --- | --- |
| `apps/` | Core product surface | Existing web/static apps live here | Add isolated `apps/seis-ai-demo/` |
| `apps/macos/` | Native desktop lane | Existing README defines SwiftUI as the desktop path | Add `apps/macos/seis-ai-command-core/` docs |
| `packages/seis_platform_swift/` | Apple-native package | Existing SwiftPM package and native shell | Add isolated `SeisAICommandCore` product |
| `docs/` | Official documentation | Architecture, governance, deployment, and reviews | Add focused report under `docs/reviews/` |
| `packages/` | Shared platform packages | Existing AI/design/kernel contracts | Do not modify |
| `scripts/` | Validation and automation | Existing checks and build scripts | Do not modify |
| `.github/` | GitHub workflow surface | CI, templates, governance checks | Add focused demo validation workflow |
| `node_modules/` | Generated dependency folder | Already present in worktree | Do not touch or commit |
| `archive/`, `reports/`, `memories/` | Historical/generated context | Useful for review, not app source | Do not copy into demo |
| `SEIST/`, `emirhan-kudun-portfolio/` | Nested/project source | Separate lanes with own instructions | Do not modify |

## Security Findings

- GitHub CLI is authenticated; token output was redacted by tooling and not
  copied into files.
- No provider API key was requested or used.
- The SwiftUI desktop app and web companion explicitly stay local and deterministic.
- Existing generated/dependency folders were not modified.
- The release-candidate gate is local and CI-backed; it does not publish,
  deploy, sign, notarize, or upload artifacts.

## Duplicates and Outdated Material

- Multiple open PRs appear to overlap on evolution/publish-gate work.
- `SEIS-ai-core-app-foundation` is marked for consolidation into canonical SEIS,
  so it was not used as the implementation target.
- Existing local dirty work in the main `SEIS` worktree was not staged, edited,
  or reverted.

## Files to Keep / Archive / Exclude / Merge Into Official Docs

- Keep: new `SeisAICommandCore` SwiftPM product, Swift contract tests, and
  `apps/macos/seis-ai-command-core/` documentation.
- Keep: new `apps/seis-ai-demo/` web companion demo and its tests.
- Keep: this report as a traceable review artifact.
- Keep: the focused GitHub Actions workflow and release-readiness runbook for
  the demo branch.
- Keep: `docs/reviews/seis-ai-command-core-pr-draft.md` as the prepared PR
  body for the short-lived review branch.
- Exclude: generated concept image, browser screenshots, node_modules, dist, and
  local audit downloads.
- Merge later: if accepted, link the demo from the primary app index or product
  docs in a follow-up PR.

## Recommended Branch

`seis/ai-demo-app-foundation`

## Recommended Commit Plan

1. `feat: add SEIS AI Command Core desktop demo`
2. `test: cover SEIS AI desktop and web demo workflows`
3. `ci: add SEIS AI Command Core release-candidate gate`
4. `docs: add SEIS AI desktop recovery and release-readiness notes`

## Release-Candidate Gate

Before opening or updating the PR, run:

```bash
npm run check:seis-ai-command-core
npm run check:publish-gate-contract
npm run automation:publish-readiness
```

Expected state on `seis/ai-demo-app-foundation`:

- `check:seis-ai-command-core` passes locally and in PR CI.
- `check:publish-gate-contract` passes because the review branch is documented.
- `automation:publish-readiness` remains blocked until the accepted work is on
  `main`; this is expected and prevents a false direct-publish claim.
- Use `docs/reviews/seis-ai-command-core-pr-draft.md` for the PR body after
  explicit maintainer approval to push the branch.

## Final Decision

- Safe to commit: yes, within the isolated worktree.
- Safe to open PR: yes, after validation passes.
- Safe to merge: no, human review and open PR consolidation review are still
  required.
