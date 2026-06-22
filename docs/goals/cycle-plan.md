# Goal Cycle Plan

The Goal Cycle Plan records yearly goals, quarterly goals, monthly goals, and
weekly priorities for the SEIS Goal Tracking OS.

## Purpose

- Make long-range and short-range execution visible in the same file-backed
  system.
- Keep weekly priorities from replacing long-term vision.
- Keep yearly, quarterly, monthly, and weekly records evidence-linked.

## Source Record

- `content/development/seis-goal-cycle-plan.json`

## Current Cycle Records

| Level | Records | Current status |
| --- | --- | --- |
| Yearly goals | `SEIS-YEAR-001` | active |
| Quarterly goals | `SEIS-QUARTER-001` | planned |
| Monthly goals | `SEIS-MONTH-001` | active |
| Weekly priorities | `SEIS-WEEK-001` through `SEIS-WEEK-003` | active and blocked |

## Rules

- Cycle records are planning and execution guidance, not release claims.
- Weekly priorities must cite goals and evidence.
- Blocked weekly priorities must remain visible.
- Quarterly readiness work remains planned until repository hygiene evidence
  exists.
- Monthly reviews must not be marked complete without current-month review
  evidence.

## Validation

`npm run check:goal-tracking` validates cycle ids, statuses, priorities,
horizon references, goal references, evidence references, repo-relative paths,
and generated Command Center panels.

## Next Safe Action

Keep cycle records synchronized with `docs/goals/horizon-map.md`,
`docs/goals/progress-review.md`, and `docs/roadmap/NEXT_PR_QUEUE.md`.
