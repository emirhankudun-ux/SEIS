# SEIS Platform Lanes

## Purpose

Define the first reviewable foundation for the requested SEIS lanes:
`@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`.

## Current Status

| Lane | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| `@seis` | Documented foundation | `README.md`, `AGENTS.md`, `docs/STATUS.md`, `docs/INDEX.md` | Root `SECURITY.md` is absent and worktree has tracked deletions. | Keep source-of-truth docs aligned before implementation expansion. |
| `@seis-cloud` | Documented and scaffolded | `deploy/cloud-environment.json`, server adapter files, cloud checks | No live cloud connection was verified; deployment remains approval-gated. | Keep cloud work in dry-run/readiness mode. |
| `@seis-code` | Documented and scaffolded | `content/development/code-automation-plan.json`, `reports/code-automation-plan.md`, `scripts/check-code-automation-plan.cjs` | Browser IDE / terminal product is not implemented in this branch. | Define SEIS Code MVP and keep execution sandboxed. |
| `@seis-design` | Documented and scaffolded | `packages/design-tokens/seis.tokens.css`, design strategy docs | Component inventory and visual QA gates are incomplete. | Create design-system acceptance checks before broad UI work. |
| `@seis-data` | Documented and scaffolded | `packages/data/README.md`, `data/*.json`, `content/development/*.json` | Schema registry and freshness policy are incomplete. | Add data contracts and validation coverage. |

The first shared static interface for these lanes is tracked in
`content/development/seis-plugin-interface-roadmap.json` and rendered from
`apps/web/index.html#plugin-interfaces`. This is a read-only interface
foundation, not a live plugin runtime.

## Rules / Policy

- Planned is not implemented.
- Static records are not live integrations.
- Cloud readiness is not deployment readiness.
- SEIS Code automation records are not a real browser IDE.
- Design tokens are not a complete design system.
- Data files are not a governed data platform until schemas and freshness
  rules exist.

## Evidence Requirements

Each lane must advance through one of these evidence types before it is marked
validated:

- repository file evidence
- validator output
- generated static artifact
- manual review note
- screenshot or recorded QA evidence
- test result
- release dry-run record

## Related Documents

- [../SEIS_MASTER_INDEX.md](../SEIS_MASTER_INDEX.md)
- [../STATUS.md](../STATUS.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)
- [../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md)

## Next Safe Action

Keep lane work split into small PRs: plugin interface validation, cloud safety,
SEIS Code MVP planning, design-system QA, data contract validation, and AI Core
boundaries.
