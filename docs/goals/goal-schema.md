# SEIS Goal Schema

Date: 2026-06-19

This schema defines the lightweight non-LLM goal object for SEIS Goal Tracking
OS. It can be represented in Markdown tables first, then migrated to JSON when
the Command Center app needs structured records.

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
| `risks` | Yes | Risks or `unknown`. |
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
  "risks": ["medium"],
  "evidence_links": ["docs/goals/goal-tracking-system.md"],
  "validation_method": "Required docs exist, review doc exists, validation output recorded",
  "next_action": "Add static Goal Tracking Center data and UI plan",
  "last_reviewed": "2026-06-19",
  "review_cadence": "weekly",
  "notes": ""
}
```
