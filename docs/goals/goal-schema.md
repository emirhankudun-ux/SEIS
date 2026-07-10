# Goal Schema

The first Goal Tracking OS schema is intentionally lightweight and file-backed.

Focused work has a public-safe execution-overlay JSON Schema at
[`schemas/seis-goal-execution.schema.json`](../../schemas/seis-goal-execution.schema.json).
It validates execution identity, requested/canonical goal mapping, agents,
horizon, repository areas, definition of done, validation, risk, rollback, and
GitHub output without adding a package dependency. Historical Goal Tracking OS
records keep their established shape and remain the only canonical goal IDs.

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
| `created_at` | yes | Dated goal-record creation field. |
| `related_milestone` | yes | Milestone id such as `SEIS-MS-001` or `milestone not assigned`. |
| `related_epic` | yes | Epic id such as `SEIS-EPIC-001` or `epic not assigned`. |
| `dependencies` | yes | Named dependencies. |
| `blockers` | yes | Named blockers or `none`. |
| `risks` | yes | Named risks. |
| `evidence_links` | yes | Repo-relative evidence or `evidence unavailable`. |
| `validation_method` | yes | How the claim will be validated. |
| `next_action` | yes | Next safe action. |
| `last_reviewed` | yes | Placeholder or dated review evidence. |
| `review_cadence` | yes | Daily, weekly, monthly, quarterly, yearly, or custom cadence. |
| `notes` | yes | Non-secret notes array. |

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

## Archive Ledger Object

Archive ledger records include id, title, status, classification, related goals,
evidence ids, related paths, promotion rule, risk, and next action. Archive
records keep historical reference and deferred material separate from active
official goals.

## Cycle Plan Object

Cycle plan records include yearly goals, quarterly goals, monthly goals, and
weekly priorities. Each item includes id, title, status, priority, horizon id,
goal links, evidence ids, related paths, and next action. Yearly, quarterly, and
monthly items may also include a success condition.

## Risk Register Object

Risk register records include id, title, status, severity, category, owner role,
goal links, evidence ids, related paths, mitigation, and next action. Risk
records must use the allowed risk levels and must not be treated as completed
mitigation without evidence.

## Validation Step Object

Validation step records include id, title, status, priority, command or manual
review method, owner role, goal links, evidence ids, related paths, success
condition, and next action. A validation step proves only the scope named by its
success condition.

## Roadmap Link Object

Roadmap link records include id, goal id, title, status, roadmap references, PR
queue references, status references, related paths, and next action. Every
tracked goal must have exactly one roadmap-link record.

## Validation

`npm run check:goal-tracking` validates required docs, strategic categories,
record ids, category coverage, repo-relative links, review cadence references,
progress ledger references, hierarchy references, archive ledger references,
cycle plan references, risk register references, validation step references,
roadmap link coverage, generated view panels, and no active goal with
unavailable evidence.
