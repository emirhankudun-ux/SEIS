# Goal Schema

The first Goal Tracking OS schema is intentionally lightweight and file-backed.

## Goal Object

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable id such as `SEIS-GOAL-003`. |
| `title` | yes | Human-readable goal title. |
| `description` | yes | What the goal is trying to achieve. |
| `category` | yes | One required strategic category. |
| `priority` | yes | `P0 critical` through `P4 future`. |
| `status` | yes | Evidence-aware lifecycle status. |
| `owner_role` | yes | Responsible role, not a person. |
| `target_phase` | yes | Foundation, readiness, research, or later phase. |
| `related_docs` | yes | Repo-relative docs. |
| `related_files` | yes | Repo-relative files or directories. |
| `created_at` | planned | Placeholder for future dated goal creation tracking. |
| `related_milestone` | planned | Placeholder for a milestone id such as `SEIS-MS-001`. |
| `related_epic` | planned | Placeholder for an epic id such as `SEIS-EPIC-001`. |
| `dependencies` | yes | Named dependencies. |
| `blockers` | yes | Named blockers or `none`. |
| `risks` | yes | Named risks. |
| `evidence_links` | yes | Repo-relative evidence or `evidence unavailable`. |
| `validation_method` | yes | How the claim will be validated. |
| `next_action` | yes | Next safe action. |
| `last_reviewed` | planned | Placeholder for future dated review evidence. |
| `review_cadence` | planned | Placeholder for daily, weekly, monthly, or custom cadence. |
| `notes` | planned | Placeholder for future non-secret notes. |

## Evidence Object

Evidence records include id, title, type, status, observed date, supported goal
ids, related paths, summary, limitations, and next action.

## Execution Object

Execution records include tasks, blockers, and decisions. They are not a live
automation queue yet.

## Review Cadence Object

Review cadence records include id, title, cadence, status, owner role, related
goals, related tasks, evidence ids, checklist, completion rule, and next action.
Planned cadence records are not performed reviews.

## Progress Ledger Object

Progress ledger records include completed items, deferred items, and follow-up
actions. Completed items require evidence ids. Deferred items require a reason
and next safe action.

## Hierarchy Object

Hierarchy records include planning horizons, active projects, epics, and
subtasks. Horizons cover yearly, quarterly, monthly, and weekly planning levels.
Projects group milestones. Epics belong to projects. Subtasks connect known
execution tasks to epics.

## Validation

`npm run check:goal-tracking` validates required docs, strategic categories,
record ids, category coverage, repo-relative links, review cadence references,
progress ledger references, hierarchy references, generated view panels, and no
active goal with unavailable evidence.
