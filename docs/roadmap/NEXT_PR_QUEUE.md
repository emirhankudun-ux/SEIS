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
| Goal | Add and maintain a read-only Command Center lane interface for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`, including a five-year development horizon. |
| Include | `apps/web/index.html`, `apps/web/app.js`, `apps/web/styles.css`, `content/development/seis-plugin-interface-roadmap.json`, `docs/product/plugin-interface-suite.md`, status/backlog/index updates. |
| Exclude | Live cloud, GitHub write, SSH, or AI provider actions. |
| Validation | `node --check apps/web/app.js`, `jq empty content/development/seis-plugin-interface-roadmap.json`, `git diff --check`, keyboard/manual QA when browser verification is available. |
| Approval needed | None unless adding dependencies. |

## PR 5A: Plugin Interface Validation And QA

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Add dedicated validation and manual QA evidence for the static plugin interface suite. |
| Include | Schema expectations for `content/development/seis-plugin-interface-roadmap.json`, browser QA notes for lane tabs, evidence links, mobile layout, and reduced-motion behavior. |
| Exclude | Dependency installation, live provider calls, SSH, deployment, or destructive actions. |
| Validation | Static JSON schema check, browser screenshot/manual QA, keyboard navigation review. |
| Approval needed | None unless adding dependencies or external tooling. |

## PR 6: SEIS Code, Data, And Design Contracts

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Define SEIS Code MVP, expand the data schema registry, and add design component inventory as reviewable contracts. |
| Include | Virtual file system, Monaco, terminal, no-key AI REPL acceptance criteria, JSON schema expectations, component inventory, reduced-motion QA. |
| Exclude | Full product implementation or dependency installation unless separately approved. |
| Validation | `npm run check:data-schema-registry`, documentation review, JSON checks, manual accessibility checklist. |
| Approval needed | Yes for dependency installation. |

## Human Approval Needed

- Push to `main`, merge, force-push, branch deletion, or history rewrite.
- File deletion.
- Cross-worktree cherry-pick, bulk copy, or branch reconciliation.
- External GitHub PR/API inspection.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
