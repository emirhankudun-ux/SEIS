# SEIS Next PR Queue

Date: 2026-06-22

## PR 0: SEIS Integration And GitHub Development Spine

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P0 |
| Goal | Keep every SEIS workstream connected to the canonical GitHub repository through evidence, validation, and PR sequencing. |
| Include | `docs/governance/seis-integration-and-github-development.md`, `content/development/seis-integration-map.json`, `docs/STATUS.md`, `docs/SEIS_MASTER_INDEX.md`, `docs/INDEX.md`, `docs/roadmap/MASTER_BACKLOG.md`, `docs/roadmap/NEXT_PR_QUEUE.md`, `docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md`. |
| Exclude | Bulk copying from separate worktrees, cherry-picking unreviewed commits, live GitHub write actions, SSH, deployment, provider calls, secret rotation, file deletion, branch deletion, and history rewrite. |
| Validation | `jq empty content/development/seis-integration-map.json`, documentation review, `git diff --check`. |
| Approval needed | None for scoped docs/JSON updates; approval required for cross-worktree merge, push, or deletion. |

## PR 1: Goal Tracking OS Foundation

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P0 |
| Goal | Add file-backed Goal Tracking OS docs, JSON records, validator, status, backlog, and PR queue. |
| Include | `docs/goals/*`, `docs/product/*`, `docs/reviews/GOAL_TRACKING_REVIEW.md`, `docs/roadmap/*`, `docs/STATUS.md`, `docs/INDEX.md`, `content/development/seis-goal-*.json`, `scripts/check-goal-tracking.mjs`, `package.json`. |
| Exclude | Unrelated tracked deletions, live GitHub API calls, SSH, deployment, release actions, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `node --check scripts/check-goal-tracking.mjs`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/validator work. |

## PR 1A: Goal Tracking Review Cadence Ledger

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add planned review cadence records plus completed/deferred/follow-up ledger records to the generated Goal Tracking Center. |
| Include | `content/development/seis-goal-review-cadence.json`, `content/development/seis-goal-progress-ledger.json`, `docs/goals/review-cadence.md`, `docs/goals/progress-ledger.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, `content/development/seis-goal-command-center-view.json`, `apps/web/goal-tracking.html`. |
| Exclude | Fake performed recurring reviews, live GitHub API calls, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1B: Goal Tracking Hierarchy Map

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add yearly, quarterly, monthly, weekly, active project, epic, and subtask hierarchy records to the generated Goal Tracking Center. |
| Include | `content/development/seis-goal-hierarchy.json`, `docs/goals/horizon-map.md`, `docs/goals/project-epic-task-map.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, `content/development/seis-goal-command-center-view.json`, `apps/web/goal-tracking.html`. |
| Exclude | Live GitHub issue/project sync, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1C: Goal Metadata Contract

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Make goal object metadata fields real registry fields: creation date, milestone, epic, last reviewed, review cadence, and notes. |
| Include | `content/development/seis-goal-tracking.json`, `content/development/seis-goal-evidence.json`, `docs/goals/goal-schema.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake performed reviews, live GitHub issue/project sync, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1D: Goal Archive Ledger

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Keep historical reference, repository hygiene review candidates, and deferred readiness claims separate from active official goals. |
| Include | `content/development/seis-goal-archive-ledger.json`, `docs/goals/archive-ledger.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Archive promotion, file deletion, history rewrite, live GitHub PR inspection, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work; approval required for deletion, promotion, history rewrite, merge, release, or public visibility changes. |

## PR 1E: Goal Cycle Plan

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add yearly goals, quarterly goals, monthly goals, and weekly priorities as file-backed Goal Tracking OS cycle records. |
| Include | `content/development/seis-goal-cycle-plan.json`, `docs/goals/cycle-plan.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake performed weekly/monthly reviews, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1F: Goal Risk And Validation Ledgers

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add first-class risk and validation-step ledgers to the non-LLM Goal Tracking OS. |
| Include | `content/development/seis-goal-risk-register.json`, `content/development/seis-goal-validation-steps.json`, `docs/goals/risk-register.md`, `docs/goals/validation-steps.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake risk mitigation, fake performed validation, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, scoped sensitive-pattern scan, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1G: Goal Roadmap Links

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add explicit roadmap, PR queue, and status link records for every tracked Goal Tracking OS goal. |
| Include | `content/development/seis-goal-roadmap-links.json`, `docs/goals/roadmap-links.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake opened/merged PR state, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, scoped sensitive-pattern scan, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 2: Repository Hygiene Recovery

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Decide restore, replace, archive, or approved removal for pre-existing tracked deletions. |
| Approval needed | File deletion if any deleted files are intentionally removed. |

## PR 3: Static Goal Tracking Center Maintenance

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep the generated static Command Center Goal Tracking view fresh from JSON records. |
| Validation | `npm run check:goal-command-center-view`, `npm run check:goal-tracking`. |
| Approval needed | None unless adding dependencies or live integrations. |

## PR 4: Provider Environment Validation

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Add typed server-only provider environment validation on top of the existing root `SECURITY.md` and redacted provider audit. |
| Include | Provider config schema, Missing Key vs Disabled vs Error rules, sanitized diagnostics, no-key startup tests or documented fixtures. |
| Exclude | Real credential values, provider calls, secret rotation, history rewrite. |
| Validation | `npm run audit:ai-providers`, `.env` ignore checks, no-key startup fixture, bundle exposure scan when build exists. |
| Approval needed | Yes for secret rotation or history rewrite only. |

## PR 5: Command Center Lane Status View

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Add and maintain a read-only Command Center lane interface for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`, including a selectable five-year development program. |
| Include | `apps/web/index.html`, `apps/web/app.js`, `apps/web/styles.css`, `content/development/seis-plugin-interface-roadmap.json`, `content/development/plugin-skill-capability-map.json`, `content/lab/cinematic-engine.json`, `content/lab/quality-console.json`, `docs/product/plugin-interface-suite.md`, status/backlog/index updates. |
| Exclude | Live cloud, GitHub write, SSH, or AI provider actions. |
| Validation | `npm run check:plugin-interface-roadmap`, `node --check apps/web/app.js`, `jq empty content/development/seis-plugin-interface-roadmap.json`, `git diff --check`, keyboard/manual QA when browser verification is available. |
| Approval needed | None unless adding dependencies. |

## PR 5A: Plugin Interface Validation And QA

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep dedicated validation and manual QA evidence for the static plugin interface suite, including lane tabs, year controls, and program rows. |
| Include | `scripts/check-plugin-interface-roadmap.mjs`, `npm run check:plugin-interface-roadmap`, `docs/reviews/PLUGIN_INTERFACE_SUITE_QA.md`, support data files, browser QA notes for lane tabs, evidence links, mobile layout, HTTP status, and reduced-motion behavior. |
| Exclude | Dependency installation, live provider calls, SSH, deployment, or destructive actions. |
| Validation | `npm run check:plugin-interface-roadmap`, browser screenshot/manual QA, keyboard navigation review. |
| Approval needed | None unless adding dependencies or external tooling. |

## PR 6: SEIS Code, Data, And Design Contracts

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Harden SEIS Code browser foundation, expand the data schema registry, and add visual QA on top of the validator-backed design component inventory. |
| Include | SEIS Code interaction tests, virtual file system persistence checks, Monaco/fallback editor QA, terminal and no-key AI REPL checks, JSON schema expectations, component inventory visual QA, Video Hero QA evidence, reduced-motion QA. |
| Exclude | Full product implementation or dependency installation unless separately approved. |
| Validation | `npm run check:seis-code`, `npm run check:video-hero-showcase`, `npm run check:design-component-inventory`, `npm run check:data-schema-registry`, documentation review, JSON checks, manual accessibility checklist. |
| Approval needed | Yes for dependency installation. |

## PR 6A: Video Hero Visual QA

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Convert the four Video Hero showcase pages from validated static contract to visual QA evidence for desktop, mobile, reduced-motion, and media fallback behavior. |
| Include | `docs/product/video-hero-showcase.md`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md`, browser smoke notes, screenshots, reduced-motion evidence, media provenance review, and static package verification. |
| Exclude | Deployment, live media CDN migration, dependency installation, paid media purchases, model-provider image generation, and release publication. |
| Validation | `npm run check:video-hero-showcase`, `npm run build:static`, browser screenshot review, reduced-motion review, `git diff --check`. |
| Approval needed | None for local QA/docs; approval required for dependency installation, hosted media migration, deployment, or release. |

## PR 7: Mythic Gacha Playable Foundation

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep the Shan Hai Jing inspired gacha route playable without a runtime image-generation provider key. |
| Include | `apps/web/mythic-gacha.html`, `apps/web/mythic-gacha.css`, `apps/web/mythic-gacha.js`, `apps/web/seis-code.js` export listener, `apps/web/public/media/mythic/shan-hai-creature-atlas.png`, `docs/product/mythic-gacha.md`, route/cache/sitemap bindings, and `scripts/check-mythic-gacha.mjs`. |
| Exclude | Live image generation, real-money purchase flows, provider keys, dependency installation, deployment, SSH, or asset claims without provenance review. |
| Validation | `npm run check:mythic-gacha`, `node --check apps/web/mythic-gacha.js`, `node --check apps/web/seis-code.js`, browser/mobile QA when available. |
| Approval needed | None for the static foundation; approval required for live image generation, dependency installation, public release, or external asset pipeline changes. |

## Human Approval Needed

- Push to `main`, merge, force-push, branch deletion, or history rewrite.
- File deletion.
- Cross-worktree cherry-pick, bulk copy, or branch reconciliation.
- External GitHub PR/API inspection.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
