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

## PR 2: Repository Hygiene Recovery

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Decide restore, replace, archive, or approved removal for pre-existing tracked deletions. |
| Approval needed | File deletion if any deleted files are intentionally removed. |

## PR 3: Static Goal Tracking Center

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Generate a static Command Center Goal Tracking view from the JSON records. |
| Approval needed | None unless adding dependencies or live integrations. |

## Human Approval Needed

- Push to `main`, merge, force-push, branch deletion, or history rewrite.
- File deletion.
- External GitHub PR/API inspection.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
