# First Commit Plan

## Branch

Use a non-main branch:

```bash
chore/seis-foundation-audit
```

## Commit 1 - Analysis And Foundation

Include:

- `AGENTS.md`
- `.gitignore`
- `README.md`
- `docs/reports/zip-analysis-2026-05-24.md`
- `docs/architecture/web-mobile-foundation.md`
- `docs/architecture/animation-system-plan.md`
- `docs/quality/responsive-performance-accessibility.md`
- `docs/decisions/3d-rendering-approach.md`
- `packages/design-tokens/seis.tokens.css`
- `packages/asset-registry/legacy-assets.json`
- `apps/web/`
- `content/`
- `scripts/check-foundation.mjs`
- `scripts/sync-icloud-github.sh`
- `.github/workflows/foundation-check.yml`

Suggested message:

```text
chore: add SEIS foundation audit and cinematic web shell
```

## Do Not Include Yet

- Extracted zip contents.
- `node_modules`.
- `.next` output.
- generated screenshots/videos.
- unverified image copies.
- new heavy dependencies.

## Acceptance Criteria

- The branch contains no copied legacy source dumps.
- The report identifies valuable assets and archive candidates.
- The web shell opens locally as static HTML.
- Reduced-motion mode is implemented.
- Animation behavior is isolated and removable.
- Curated drawing assets render from the new public media folder.
- Lightweight checks pass.
- Main branch remains untouched.

## Current Blocker

This folder is not a Git repo. Create or clone the real GitHub working tree before committing.
