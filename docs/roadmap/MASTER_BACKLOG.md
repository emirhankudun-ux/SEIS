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
| `SEIS-BL-009` | P1 | Goal Tracking OS | Keep risks and validation steps first-class, evidence-linked records. | `SEIS-EVID-012` exists and `npm run check:goal-tracking` validates risk and validation-step panels. |
| `SEIS-BL-010` | P1 | Goal Tracking OS | Keep every tracked goal connected to roadmap, PR queue, and status records. | `SEIS-EVID-013` exists and `npm run check:goal-tracking` validates roadmap-link panels. |
| `SEIS-BL-010` | P1 | Repository intelligence | Define read-only scanner outputs for missing docs, risky files, validation gaps, and readiness blockers. | Scanner plan and fixture output exist. |
| `SEIS-BL-011` | P1 | Security | Add deeper security baseline without printing secrets. | Path-only scan and validation notes are documented. |
| `SEIS-BL-012` | P1 | GitHub governance | Inspect open/closed PRs after approval. | PR rescue review records current state. |
| `SEIS-BL-013` | P1 | Public readiness | Run public-readiness dry run after worktree recovery. | Public readiness decision is evidence-backed. |
| `SEIS-BL-014` | P1 | Release readiness | Run release-readiness dry run without deployment. | Release blockers and rollback plan are documented. |
| `SEIS-BL-015` | P2 | AI Core | Define model router, prompt engine, agent runtime, and evaluation boundaries. | Docs avoid model ownership overclaims. |
| `SEIS-BL-016` | P2 | SSH / cloud | Document SSH workspace policy before remote commands. | SSH docs require approval and no private key exposure. |
| `SEIS-BL-020` | P0 | Security | Keep root `SECURITY.md` and repeatable redacted provider/credential audit current. | `SECURITY.md`, `npm run audit:ai-providers`, and audit reports exist without secret values. |
| `SEIS-BL-013` | P1 | `@seis-cloud` | Keep cloud work dry-run until deployment approval. | Existing cloud checks pass without live deployment. |
| `SEIS-BL-014` | P1 | `@seis-code` | Harden the SEIS Code browser foundation with interaction and persistence tests. | `npm run check:seis-code` validates static product/runtime contracts. |
| `SEIS-BL-015` | P1 | `@seis-design` | Add visual QA gates on top of the validator-backed component inventory. | `npm run check:design-component-inventory`, `npm run check:video-hero-showcase`, `npm run check:video-hero-browser-smoke`, and `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md` validate current design contracts and release gaps. |
| `SEIS-BL-016` | P1 | `@seis-data` | Expand schema registry and freshness policy for JSON records. | `npm run check:data-schema-registry` validates current registry coverage. |
| `SEIS-BL-017` | P1 | Command Center | Generate a read-only lane status view from records and docs. | Static view shows lane states without fake live controls. |
| `SEIS-BL-018` | P1 | AI Core | Run provider audit before adding live provider adapters. | Audit distinguishes docs-only, mock, placeholder, and live integrations. |
| `SEIS-BL-019` | P1 | Plugin interfaces | Keep `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` visible as a read-only static interface with a selectable five-year development program, H1/H2 cadence, and coverage metrics. | `npm run check:plugin-interface-roadmap` and `npm run check:data-schema-registry` validate the static UI bindings, support data, evidence paths, 2026-2030 horizon, lane commitments, cadence routines, and coverage metrics. |
| `SEIS-BL-021` | P0 | Integration | Keep every SEIS workstream tied to GitHub, evidence, validation, and PR sequencing. | `docs/governance/seis-integration-and-github-development.md` and `content/development/seis-integration-map.json` stay current. |
| `SEIS-BL-022` | P1 | Mythic Gacha | Keep the no-key Shan Hai Jing inspired gacha playable and evidence-backed. | `npm run check:mythic-gacha` validates route, draw controls, 60 card markers, IndexedDB hooks, pity marker, filters, atlas binding, and SEIS Code export bridge. |

## Detailed Next Work

| ID | Suggested branch | Suggested PR title | Risk | Approval required | Next safe action |
| --- | --- | --- | --- | --- | --- |
| `SEIS-BL-008` | `seis/goals-cycle-plan` | `docs: add Goal Tracking cycle plan` | Low | No | Keep cycle records synchronized with horizon, status, and generated Goal Tracking Center records. |
| `SEIS-BL-009` | `seis/goals-risk-validation` | `docs: add Goal Tracking risk and validation ledgers` | Medium | No | Keep risk and validation-step records synchronized with status and generated Goal Tracking Center records. |
| `SEIS-BL-010` | `seis/goals-roadmap-links` | `docs: add Goal Tracking roadmap links` | Medium | No | Keep roadmap-link records synchronized with goals, backlog, queue, and status. |
| `SEIS-BL-020` | `security/provider-env-validation` | `security: add provider env validation` | High | Yes only for secret rotation/history rewrite | Add typed server-only environment validation and keep audit reports redacted. |
| `SEIS-BL-013` | `seis-cloud/readiness-dry-run` | `docs: add SEIS cloud readiness dry run` | High | Yes for live deploy/SSH | Keep all cloud output dry-run and evidence-backed. |
| `SEIS-BL-014` | `seis-code/mvp-contract` | `docs: define SEIS Code MVP contract` | Medium | Yes for dependency installation | Define the browser-safe IDE and terminal acceptance tests. |
| `SEIS-BL-015` | `seis-design/component-inventory` | `docs: add SEIS design component inventory` | Low | No | Inventory current UI components, add committed video showcase screenshots, and verify reduced-motion behavior. |
| `SEIS-BL-016` | `seis-data/schema-registry` | `docs: add SEIS data schema registry` | Medium | No | Start with `content/development/*.json` and `data/*.json`. |
| `SEIS-BL-017` | `seis/command-center-lane-status` | `feat: add SEIS lane status view` | Medium | No unless adding dependencies | Generate a read-only Command Center view. |
| `SEIS-BL-018` | `ai/provider-audit` | `docs: add AI provider credential audit` | High | Yes for live provider calls | Inspect SDK/env/client exposure without requesting keys. |
| `SEIS-BL-019` | `seis/plugin-interface-suite` | `feat: add SEIS plugin interface suite` | Medium | No unless adding dependencies or live integrations | Keep schema validation passing and refresh manual browser QA evidence for lane tabs, year controls, H1/H2 cadence, coverage metrics, and program rows. |
| `SEIS-BL-021` | `seis/integration-spine` | `docs: add SEIS integration and GitHub development spine` | Medium | No for documentation and JSON records | Keep local workstreams visible without merging risky code. |
| `SEIS-BL-022` | `seis/mythic-gacha-foundation` | `feat: add Mythic Gacha foundation` | Medium | No unless adding dependencies or live image generation | Add browser QA for draw flows, refresh persistence, SEIS Code export visibility, and per-card artwork provenance review. |

## Deferred Dangerous Work

- Push to `main`.
- Merge, force-push, branch deletion, or history rewrite.
- File deletion or cleanup of tracked deletions.
- Cross-worktree cherry-pick, bulk copy, or branch reconciliation without diff review.
- Deployment, release/tag creation, repo visibility changes, or settings changes.
- SSH commands, secret rotation, model training, benchmarks, or dataset downloads.
