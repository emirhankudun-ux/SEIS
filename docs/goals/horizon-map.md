# Goal Horizon Map

The Goal Horizon Map connects SEIS goals to yearly, quarterly, monthly, and
weekly planning horizons.

## Purpose

- Keep long-term execution visible without depending on an LLM.
- Distinguish yearly direction, quarterly recovery, monthly foundation work, and
  weekly validation/push focus.
- Prevent weekly tasks from replacing the long-term SEIS platform direction.

## Source Record

- `content/development/seis-goal-hierarchy.json`

## Current Horizons

| ID | Level | Status | Scope |
| --- | --- | --- | --- |
| `SEIS-HORIZON-001` | yearly | active | 2026 foundation operating layer. |
| `SEIS-HORIZON-002` | quarterly | planned | Q3 foundation recovery and repository intelligence. |
| `SEIS-HORIZON-003` | monthly | active | June 2026 Goal Tracking OS baseline. |
| `SEIS-HORIZON-004` | weekly | active | Current weekly validation and push queue. |

## Rules

- Yearly, quarterly, monthly, and weekly horizons are planning records, not
  completion claims.
- A horizon can be active only when its evidence links exist.
- Readiness horizons remain planned or blocked until dry-run evidence exists.
- Weekly priorities must not hide repository hygiene, public readiness, release
  readiness, or security blockers.

## Validation

`npm run check:goal-tracking` validates horizon ids, levels, statuses, goal
references, evidence references, repo-relative paths, and generated Command
Center panels.

## Next Safe Action

Keep horizon records synchronized with `docs/goals/progress-review.md`,
`docs/roadmap/MASTER_BACKLOG.md`, and `docs/roadmap/NEXT_PR_QUEUE.md`.
