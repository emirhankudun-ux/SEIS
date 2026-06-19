# SEIS Goal Tracking Center

Date: 2026-06-19

Goal Tracking Center is the Command Center module for long-term goals,
milestones, weekly priorities, blockers, validation, evidence, and next safe
actions.

## Mission

Make SEIS progress visible without exaggeration. The module must show what is
real, what is planned, what is blocked, what is validated, what needs approval,
what needs evidence, and what should happen next.

## Required Views

| View | Purpose | Data source |
| --- | --- | --- |
| Goal List | List goals with category, priority, status, owner role, evidence, blockers, and next action. | [`../goals/long-term-goals.md`](../goals/long-term-goals.md) |
| Milestone Timeline | Show phases, milestones, epics, and validation steps. | [`../goals/milestone-map.md`](../goals/milestone-map.md) |
| Progress Cards | Summarize active, blocked, planned, validated, and completed goals. | Goal records |
| Blocked Items | Make blockers and required approvals visible. | [`../goals/progress-review.md`](../goals/progress-review.md) |
| Next Safe Action Panel | Show the next safe action per active goal and roadmap queue. | [`../roadmap/NEXT_PR_QUEUE.md`](../roadmap/NEXT_PR_QUEUE.md) |
| Evidence Links | Link each status to docs, reviews, validation, files, or PRs. | Goal records and evidence locker |
| Readiness Connections | Show public/release readiness status for relevant goals. | [`../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md`](../readiness/RELEASE_PUBLIC_READINESS_SYSTEM.md) |

## UX Rules

- Do not show fake progress bars.
- Do not show completed status without evidence.
- Do not hide blockers.
- Do not bury security blockers.
- Unknown status must remain visible.
- Planned goals must be labeled planned.
- Blocked goals must show reason.
- Completed goals must show evidence.
- Validation status must be clear.

## Status Presentation

| Status | UI treatment |
| --- | --- |
| `active` | Visible as current work with next safe action. |
| `planned` | Visible as future/queued work. |
| `blocked` | Prominent blocker reason and required action. |
| `in-review` | Needs human review before completion. |
| `validated` | Shows validation evidence. |
| `completed` | Shows completion evidence. |
| `deferred` | Shows reason and next review date if known. |
| `archived` | Hidden from active view by default but available in archives. |

## Non-LLM Requirement

The Goal Tracking Center must render from structured docs or fixture data with
no LLM connected. LLMs may summarize or recommend only after evidence exists.

## First Implementation Milestone

Create a static/manual data file or fixture derived from:

- [`../goals/long-term-goals.md`](../goals/long-term-goals.md)
- [`../goals/milestone-map.md`](../goals/milestone-map.md)
- [`../goals/progress-review.md`](../goals/progress-review.md)
- [`../roadmap/NEXT_PR_QUEUE.md`](../roadmap/NEXT_PR_QUEUE.md)
