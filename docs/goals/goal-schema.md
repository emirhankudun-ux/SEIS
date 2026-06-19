# SEIS Goal Schema

Date: 2026-06-19

This schema defines the lightweight non-LLM goal object for SEIS Goal Tracking
OS. It can be represented in Markdown tables first, then migrated to JSON when
the Command Center app needs structured records.

The first structured registry is
[`../../content/development/seis-goal-tracking.json`](../../content/development/seis-goal-tracking.json).
Validate it with:

```bash
npm run check:goal-tracking
```

## Required Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable goal id, such as `SEIS-GOAL-001`. |
| `title` | Yes | Human-readable goal title. |
| `description` | Yes | What the goal means and why it matters. |
| `category` | Yes | Strategic goal category. |
| `priority` | Yes | `P0 critical`, `P1 high`, `P2 medium`, `P3 low`, or `P4 future`. |
| `status` | Yes | One allowed status from the status list. |
| `owner_role` | Yes | Responsible role, not necessarily a person. |
| `created_date` | Yes | Date or placeholder if unknown. |
| `target_phase` | Yes | Roadmap phase where this goal belongs. |
| `related_milestone` | Yes | Milestone id or `none`. |
| `related_epic` | Yes | Epic id or `none`. |
| `dependencies` | Yes | Required prerequisites or `none`. |
| `blockers` | Yes | Blocking conditions or `none`. |
| `risk_level` | Yes | `low`, `medium`, `high`, `critical`, or `unknown`. |
| `risks` | Yes | Risk notes or `unknown`. |
| `evidence_links` | Yes | Relative links or `evidence unavailable`. |
| `validation_method` | Yes | How completion/validation is proven. |
| `next_action` | Yes | Next safe action. |
| `last_reviewed` | Yes | Date or placeholder. |
| `review_cadence` | Yes | daily, weekly, monthly, per PR, or milestone. |
| `notes` | No | Short context. |

## Allowed Status Values

- `idea`
- `proposed`
- `planned`
- `active`
- `blocked`
- `in-review`
- `validated`
- `completed`
- `deferred`
- `archived`
- `deprecated`

## Priority Values

- `P0 critical`
- `P1 high`
- `P2 medium`
- `P3 low`
- `P4 future`

## Risk Values

- `low`
- `medium`
- `high`
- `critical`
- `unknown`

## Markdown Example

| Field | Value |
| --- | --- |
| id | `SEIS-GOAL-002` |
| title | Establish SEIS Goal Tracking OS |
| description | Create the long-term goal, milestone, blocker, evidence, and next-action system. |
| category | Goal Tracking OS |
| priority | P1 high |
| status | active |
| owner_role | Maintainer / Product Architecture |
| created_date | 2026-06-19 |
| target_phase | Goal foundation |
| related_milestone | `SEIS-MS-001` |
| related_epic | `SEIS-EPIC-GOALS-001` |
| dependencies | Foundation docs, roadmap queue |
| blockers | App implementation not built yet |
| risks | medium |
| evidence_links | [`goal-tracking-system.md`](goal-tracking-system.md) |
| validation_method | Required docs exist, review doc exists, validation output recorded |
| next_action | Add static Goal Tracking Center data and UI plan |
| last_reviewed | 2026-06-19 |
| review_cadence | weekly |

## JSON Shape

```json
{
  "id": "SEIS-GOAL-002",
  "title": "Establish SEIS Goal Tracking OS",
  "description": "Create the long-term goal, milestone, blocker, evidence, and next-action system.",
  "category": "Goal Tracking OS",
  "priority": "P1 high",
  "status": "active",
  "owner_role": "Maintainer / Product Architecture",
  "created_date": "2026-06-19",
  "target_phase": "Goal foundation",
  "related_milestone": "SEIS-MS-001",
  "related_epic": "SEIS-EPIC-GOALS-001",
  "dependencies": ["Foundation docs", "Roadmap queue"],
  "blockers": ["App implementation not built yet"],
  "risk_level": "medium",
  "risks": ["medium"],
  "evidence_links": ["docs/goals/goal-tracking-system.md"],
  "validation_method": "Required docs exist, review doc exists, validation output recorded",
  "next_action": "Add static Goal Tracking Center data and UI plan",
  "last_reviewed": "2026-06-19",
  "review_cadence": "weekly",
  "notes": ""
}
```

## Evidence Object

The first structured evidence ledger is
[`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json).
Each evidence record should use this lightweight shape:

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable evidence id such as `SEIS-EVID-001`. |
| `title` | Yes | Short evidence title. |
| `type` | Yes | `validation`, `repository-state`, `blocker`, `security-scan`, `commit`, or `review`. |
| `status` | Yes | `passed`, `failed`, `blocked`, `observed`, or `partial`. |
| `observed_at` | Yes | Date the evidence was observed. |
| `command` | Yes | Command or review action, summarized without private paths. |
| `supports_goal_ids` | Yes | Goal ids supported by this evidence. |
| `related_paths` | Yes | Repo-relative files or directories. |
| `summary` | Yes | Evidence summary without secrets or private paths. |
| `limitations` | Yes | What the evidence does not prove. |
| `next_action` | Yes | Next safe action implied by the evidence. |

Evidence records are validated by `npm run check:goal-tracking`.

## Execution Object

The first structured execution registry is
[`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json).
It contains tasks, subtasks, blockers, and decisions.

### Task Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable task id such as `SEIS-TASK-001`. |
| `title` | Yes | Short task title. |
| `status` | Yes | `planned`, `active`, `blocked`, `in-review`, `completed`, or `deferred`. |
| `priority` | Yes | Same priority values as goals. |
| `owner_role` | Yes | Responsible role. |
| `supports_goal_ids` | Yes | Goal ids this task advances. |
| `related_milestone` | Yes | Milestone id or `none`. |
| `related_epic` | Yes | Epic id or `none`. |
| `blocker_ids` | Yes | Related blocker ids. |
| `decision_ids` | Yes | Related decision ids. |
| `evidence_ids` | Yes | Related evidence ids. |
| `related_paths` | Yes | Repo-relative paths. |
| `subtasks` | Yes | Subtask records with id, title, status, and next action. |
| `next_action` | Yes | Next safe action. |
| `notes` | Yes | Context and limitations. |

### Blocker Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable blocker id such as `SEIS-BLOCKER-001`. |
| `title` | Yes | Short blocker title. |
| `status` | Yes | `active`, `mitigated`, `resolved`, or `deferred`. |
| `severity` | Yes | `critical`, `high`, `medium`, `low`, or `unknown`. |
| `supports_goal_ids` | Yes | Goal ids affected by the blocker. |
| `evidence_ids` | Yes | Evidence records proving the blocker. |
| `related_paths` | Yes | Repo-relative paths. |
| `required_approval` | Yes | Human approval requirement, if any. |
| `next_action` | Yes | Next safe action. |

### Decision Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable decision id such as `SEIS-DEC-001`. |
| `title` | Yes | Short decision title. |
| `status` | Yes | `proposed`, `accepted`, `deferred`, or `superseded`. |
| `date` | Yes | Decision date. |
| `supports_goal_ids` | Yes | Goal ids affected by the decision. |
| `evidence_ids` | Yes | Evidence supporting the decision. |
| `related_paths` | Yes | Repo-relative paths. |
| `decision` | Yes | Decision statement. |
| `consequence` | Yes | Practical consequence of the decision. |

Execution records are validated by `npm run check:goal-tracking`.

## Review Cadence Object

The first structured review cadence registry is
[`../../content/development/seis-goal-review-cadence.json`](../../content/development/seis-goal-review-cadence.json).
It contains planned daily, weekly, and monthly review records. A record may be
marked `performed` only when real current-period review evidence exists.

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable review id such as `SEIS-REVIEW-001`. |
| `title` | Yes | Short review title. |
| `cadence` | Yes | `daily`, `weekly`, or `monthly`. |
| `status` | Yes | `planned`, `performed`, `blocked`, `deferred`, or `skipped`. |
| `owner_role` | Yes | Responsible role. |
| `related_goal_ids` | Yes | Goal ids this review supports. |
| `related_task_ids` | Yes | Task ids connected to the review. |
| `evidence_ids` | Yes | Evidence ids proving the review when status is `performed`; empty for planned records. |
| `related_paths` | Yes | Repo-relative paths. |
| `checklist` | Yes | Review checklist items. |
| `required_evidence` | Yes | Evidence required before the review can prove a status change. |
| `completion_rule` | Yes | Rule for marking the review performed. |
| `next_action` | Yes | Next safe action. |

Review cadence records are validated by `npm run check:goal-tracking`.

## Planning Horizon Object

The first structured planning horizon registry is
[`../../content/development/seis-goal-planning-horizons.json`](../../content/development/seis-goal-planning-horizons.json).
It contains yearly, quarterly, monthly, and weekly horizons plus active project
records.

### Horizon Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable horizon id such as `SEIS-HORIZON-001`. |
| `title` | Yes | Short horizon title. |
| `horizon` | Yes | `yearly`, `quarterly`, `monthly`, or `weekly`. |
| `timeframe` | Yes | Current period label. |
| `status` | Yes | `planned`, `active`, `blocked`, `deferred`, or `completed`. |
| `priority` | Yes | Same priority values as goals. |
| `owner_role` | Yes | Responsible role. |
| `related_goal_ids` | Yes | Goals the horizon supports. |
| `related_task_ids` | Yes | Tasks the horizon supports. |
| `evidence_ids` | Yes | Evidence ids supporting the horizon. |
| `related_paths` | Yes | Repo-relative paths. |
| `focus` | Yes | Horizon focus. |
| `success_signal` | Yes | Evidence-backed success signal. |
| `blockers` | Yes | Known blockers or empty array. |
| `next_action` | Yes | Next safe action. |

### Active Project Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable project id such as `SEIS-PROJECT-001`. |
| `title` | Yes | Short project title. |
| `status` | Yes | `planned`, `active`, `blocked`, `deferred`, or `completed`. |
| `priority` | Yes | Same priority values as goals. |
| `owner_role` | Yes | Responsible role. |
| `related_goal_ids` | Yes | Goals the project supports. |
| `related_task_ids` | Yes | Tasks the project supports. |
| `evidence_ids` | Yes | Evidence ids supporting the project. |
| `related_horizon_ids` | Yes | Horizon ids connected to the project. |
| `related_paths` | Yes | Repo-relative paths. |
| `blockers` | Yes | Known blockers or empty array. |
| `next_action` | Yes | Next safe action. |

Planning horizon records are validated by `npm run check:goal-tracking`.

## Progress Ledger Object

The first structured progress ledger is
[`../../content/development/seis-goal-progress-ledger.json`](../../content/development/seis-goal-progress-ledger.json).
It contains scoped completed work, deferred work, and follow-up actions.

### Completed Item Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable id such as `SEIS-COMPLETE-001`. |
| `title` | Yes | Completed item title. |
| `completed_at` | Yes | Date the scoped item was completed. |
| `status` | Yes | Must be `completed`. |
| `supports_goal_ids` | Yes | Goal ids supported by the item. |
| `evidence_ids` | Yes | Evidence proving the scoped completion. |
| `related_paths` | Yes | Repo-relative paths. |
| `summary` | Yes | What was completed. |
| `limitations` | Yes | What completion does not prove. |
| `next_action` | Yes | Next safe action. |

### Deferred Item Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable id such as `SEIS-DEFER-001`. |
| `title` | Yes | Deferred item title. |
| `status` | Yes | Must be `deferred`. |
| `reason` | Yes | Reason for deferral. |
| `supports_goal_ids` | Yes | Goal ids affected by the deferral. |
| `related_paths` | Yes | Repo-relative paths. |
| `approval_required` | Yes | Approval boundary, if applicable. |
| `next_action` | Yes | Next safe action. |

### Follow-Up Action Fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Stable id such as `SEIS-FOLLOWUP-001`. |
| `title` | Yes | Follow-up action title. |
| `status` | Yes | `planned`, `active`, `blocked`, `deferred`, or `completed`. |
| `priority` | Yes | Same priority values as goals. |
| `supports_goal_ids` | Yes | Goals the follow-up supports. |
| `related_task_ids` | Yes | Related task ids. |
| `evidence_ids` | Yes | Evidence ids supporting the follow-up. |
| `related_paths` | Yes | Repo-relative paths. |
| `next_action` | Yes | Next safe action. |

Progress ledger records are validated by `npm run check:goal-tracking`.

## Command Center View Object

The generated Command Center view model is
[`../../content/development/seis-goal-command-center-view.json`](../../content/development/seis-goal-command-center-view.json).
It is generated by `npm run automation:goal-command-center-view` and checked by
`npm run check:goal-command-center-view`.

| Field | Required | Description |
| --- | --- | --- |
| `schemaVersion` | Yes | View model schema version. |
| `id` | Yes | Stable id, currently `seis-goal-command-center-view`. |
| `mode` | Yes | Must be `non_llm_command_center_goal_view`. |
| `sourceRecords` | Yes | Goal, evidence, and execution source JSON paths. |
| `summary` | Yes | Counts, final state, and next safe action. |
| `progressCards` | Yes | Numeric cards; no fake percentages. |
| `panels.activeGoals` | Yes | Active goal records for display. |
| `panels.blockedGoals` | Yes | Blocked goal records for display. |
| `panels.categoryStatus` | Yes | One row per strategic category. |
| `panels.nextActionQueue` | Yes | Task-backed next action queue. |
| `panels.blockedItems` | Yes | Active blocker records. |
| `panels.validationStatus` | Yes | Evidence records and limitations. |
| `panels.reviewCadence` | Yes | Planned daily, weekly, and monthly review cadence. |
| `panels.planningHorizons` | Yes | Yearly, quarterly, monthly, and weekly planning horizons. |
| `panels.activeProjects` | Yes | Current project lanes. |
| `panels.completedItems` | Yes | Scoped completed work. |
| `panels.deferredItems` | Yes | Deferred work with reasons. |
| `panels.followUpActions` | Yes | Follow-up actions. |
| `panels.decisions` | Yes | Decision records and consequences. |
| `panels.readinessConnections` | Yes | Public/release/AI Core/Command Center/Universe status. |
| `uxGuards` | Yes | UI guardrails for no fake progress, visible blockers, and evidence-backed completion. |
