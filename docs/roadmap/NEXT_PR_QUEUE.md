# SEIS Next PR Queue

Date: 2026-06-22

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

## PR 4: Security Policy And Provider Audit

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Add root `SECURITY.md`, redacted provider/credential audit, and typed environment validation plan. |
| Include | Root security policy, audit report, no-key startup rules, server-only credential boundaries. |
| Exclude | Real credential values, provider calls, secret rotation, history rewrite. |
| Validation | Redacted audit command, `.env` ignore checks, bundle exposure scan when build exists. |
| Approval needed | Yes for secret rotation or history rewrite only. |

## PR 5: Command Center Lane Status View

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Add a read-only Command Center lane status view for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`. |
| Include | Generated JSON view model and static page updates. |
| Exclude | Live cloud, GitHub write, SSH, or AI provider actions. |
| Validation | Static build, keyboard/manual QA, source record check. |
| Approval needed | None unless adding dependencies. |

## PR 6: SEIS Code, Data, And Design Contracts

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Define SEIS Code MVP, data schema registry, and design component inventory as reviewable contracts. |
| Include | Virtual file system, Monaco, terminal, no-key AI REPL acceptance criteria, JSON schema expectations, component inventory, reduced-motion QA. |
| Exclude | Full product implementation or dependency installation unless separately approved. |
| Validation | Documentation review, JSON checks, manual accessibility checklist. |
| Approval needed | Yes for dependency installation. |

## Human Approval Needed

- Push to `main`, merge, force-push, branch deletion, or history rewrite.
- File deletion.
- External GitHub PR/API inspection.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
