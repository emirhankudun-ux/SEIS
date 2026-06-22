# SEIS Master Backlog

Date: 2026-06-22

| ID | Priority | Lane | Work | Acceptance evidence |
| --- | --- | --- | --- | --- |
| `SEIS-BL-001` | P0 | Goal Tracking OS | Keep structured goal, evidence, and execution records valid. | `npm run check:goal-tracking` passes. |
| `SEIS-BL-002` | P0 | Repository hygiene | Resolve pre-existing tracked deletions outside this slice. | `git status --short` no longer shows unexplained deletions. |
| `SEIS-BL-003` | P1 | Command Center | Maintain generated/static Goal Tracking view model. | `npm run check:goal-command-center-view` passes and the static page reads JSON records without LLM. |
| `SEIS-BL-004` | P1 | Goal Tracking OS | Keep review cadence and progress ledger records synchronized with evidence. | `SEIS-EVID-007` exists and `npm run check:goal-tracking` validates review and ledger panels. |
| `SEIS-BL-005` | P1 | Goal Tracking OS | Keep horizon, project, epic, and subtask hierarchy records synchronized with evidence. | `SEIS-EVID-008` exists and `npm run check:goal-tracking` validates hierarchy panels. |
| `SEIS-BL-006` | P1 | Goal Tracking OS | Keep goal metadata fields required and visible in generated views. | `SEIS-EVID-009` exists and `npm run check:goal-tracking` validates metadata fields. |
| `SEIS-BL-007` | P1 | Goal Tracking OS | Keep archive, deferred, and review-candidate material separate from active goals. | `SEIS-EVID-010` exists and `npm run check:goal-tracking` validates archive ledger panels. |
| `SEIS-BL-008` | P1 | Goal Tracking OS | Keep yearly, quarterly, monthly, and weekly cycle records evidence-linked. | `SEIS-EVID-011` exists and `npm run check:goal-tracking` validates cycle plan panels. |
| `SEIS-BL-009` | P1 | Repository intelligence | Define read-only scanner outputs for missing docs, risky files, validation gaps, and readiness blockers. | Scanner plan and fixture output exist. |
| `SEIS-BL-010` | P1 | Security | Add deeper security baseline without printing secrets. | Path-only scan and validation notes are documented. |
| `SEIS-BL-011` | P1 | GitHub governance | Inspect open/closed PRs after approval. | PR rescue review records current state. |
| `SEIS-BL-012` | P1 | Public readiness | Run public-readiness dry run after worktree recovery. | Public readiness decision is evidence-backed. |
| `SEIS-BL-013` | P1 | Release readiness | Run release-readiness dry run without deployment. | Release blockers and rollback plan are documented. |
| `SEIS-BL-014` | P2 | AI Core | Define model router, prompt engine, agent runtime, and evaluation boundaries. | Docs avoid model ownership overclaims. |
| `SEIS-BL-015` | P2 | SSH / cloud | Document SSH workspace policy before remote commands. | SSH docs require approval and no private key exposure. |
| `SEIS-BL-020` | P0 | Security | Keep root `SECURITY.md` and repeatable redacted provider/credential audit current. | `SECURITY.md`, `npm run audit:ai-providers`, and audit reports exist without secret values. |
| `SEIS-BL-013` | P1 | `@seis-cloud` | Keep cloud work dry-run until deployment approval. | Existing cloud checks pass without live deployment. |
| `SEIS-BL-014` | P1 | `@seis-code` | Define SEIS Code MVP contract before implementation. | Contract covers Monaco, virtual FS, terminal, persistence, and no-key AI fallback. |
| `SEIS-BL-015` | P1 | `@seis-design` | Add component inventory and visual QA gates. | Design checklist covers tokens, accessibility, reduced motion, and provenance. |
| `SEIS-BL-016` | P1 | `@seis-data` | Expand schema registry and freshness policy for JSON records. | `npm run check:data-schema-registry` validates current registry coverage. |
| `SEIS-BL-017` | P1 | Command Center | Generate a read-only lane status view from records and docs. | Static view shows lane states without fake live controls. |
| `SEIS-BL-018` | P1 | AI Core | Run provider audit before adding live provider adapters. | Audit distinguishes docs-only, mock, placeholder, and live integrations. |
| `SEIS-BL-019` | P1 | Plugin interfaces | Keep `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` visible as a read-only static interface with a five-year horizon. | `apps/web/index.html`, `apps/web/app.js`, `apps/web/styles.css`, and `content/development/seis-plugin-interface-roadmap.json` stay aligned. |
| `SEIS-BL-021` | P0 | Integration | Keep every SEIS workstream tied to GitHub, evidence, validation, and PR sequencing. | `docs/governance/seis-integration-and-github-development.md` and `content/development/seis-integration-map.json` stay current. |

## Detailed Next Work

| ID | Suggested branch | Suggested PR title | Risk | Approval required | Next safe action |
| --- | --- | --- | --- | --- | --- |
| `SEIS-BL-008` | `seis/goals-cycle-plan` | `docs: add Goal Tracking cycle plan` | Low | No | Keep cycle records synchronized with horizon, status, and generated Goal Tracking Center records. |
| `SEIS-BL-020` | `security/provider-env-validation` | `security: add provider env validation` | High | Yes only for secret rotation/history rewrite | Add typed server-only environment validation and keep audit reports redacted. |
| `SEIS-BL-013` | `seis-cloud/readiness-dry-run` | `docs: add SEIS cloud readiness dry run` | High | Yes for live deploy/SSH | Keep all cloud output dry-run and evidence-backed. |
| `SEIS-BL-014` | `seis-code/mvp-contract` | `docs: define SEIS Code MVP contract` | Medium | Yes for dependency installation | Define the browser-safe IDE and terminal acceptance tests. |
| `SEIS-BL-015` | `seis-design/component-inventory` | `docs: add SEIS design component inventory` | Low | No | Inventory current UI components and reduced-motion behavior. |
| `SEIS-BL-016` | `seis-data/schema-registry` | `docs: add SEIS data schema registry` | Medium | No | Start with `content/development/*.json` and `data/*.json`. |
| `SEIS-BL-017` | `seis/command-center-lane-status` | `feat: add SEIS lane status view` | Medium | No unless adding dependencies | Generate a read-only Command Center view. |
| `SEIS-BL-018` | `ai/provider-audit` | `docs: add AI provider credential audit` | High | Yes for live provider calls | Inspect SDK/env/client exposure without requesting keys. |
| `SEIS-BL-019` | `seis/plugin-interface-suite` | `feat: add SEIS plugin interface suite` | Medium | No unless adding dependencies or live integrations | Add schema validation and manual browser QA for the static plugin interface suite. |
| `SEIS-BL-021` | `seis/integration-spine` | `docs: add SEIS integration and GitHub development spine` | Medium | No for documentation and JSON records | Keep local workstreams visible without merging risky code. |

## Deferred Dangerous Work

- Push to `main`.
- Merge, force-push, branch deletion, or history rewrite.
- File deletion or cleanup of tracked deletions.
- Cross-worktree cherry-pick, bulk copy, or branch reconciliation without diff review.
- Deployment, release/tag creation, repo visibility changes, or settings changes.
- SSH commands, secret rotation, model training, benchmarks, or dataset downloads.
