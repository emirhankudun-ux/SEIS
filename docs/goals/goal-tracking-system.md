# SEIS Goal Tracking OS

SEIS Goal Tracking OS is the non-LLM progress and execution layer for the SEIS
ecosystem. It stores structured goals, statuses, blockers, evidence, decisions,
completed work, deferred work, and next safe actions.

## Official Concepts

| Concept | Meaning |
| --- | --- |
| Vision | Long-term product direction. |
| Strategy | Sustained approach for reaching the vision. |
| Roadmap | Ordered phases and milestones. |
| Milestone | A measurable step toward a phase. |
| Epic | Coherent body of work under a milestone. |
| Task | Concrete unit of work. |
| Validation | Check or review that proves a claim. |
| Evidence | Record supporting a status or claim. |
| Blocker | Condition preventing safe progress. |
| Risk | Condition that can cause failure or harm. |
| Completed item | Scoped work finished with evidence. |
| Deferred item | Work intentionally delayed. |
| Archived item | Historical material not active by default. |

## Status Rules

Allowed goal statuses:

- idea
- proposed
- planned
- active
- blocked
- in-review
- validated
- completed
- deferred
- archived
- deprecated

Rules:

- Use `evidence unavailable` when evidence is missing.
- Keep blocked items visible.
- Keep planned goals labeled planned.
- Do not show fake progress percentages.
- Do not let LLM summaries override source records.

## Current Files

- `content/development/seis-goal-tracking.json`
- `content/development/seis-goal-evidence.json`
- `content/development/seis-goal-execution.json`
- `docs/goals/evidence-ledger.md`
- `docs/goals/execution-board.md`
- `scripts/check-goal-tracking.mjs`

Run:

```bash
npm run check:goal-tracking
```
