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
| Planning horizon | Yearly, quarterly, monthly, or weekly planning layer. |
| Project | Active, blocked, or planned body of work tied to goals and milestones. |
| Epic | Coherent body of work under a milestone. |
| Task | Concrete unit of work. |
| Subtask | Execution detail tied to a task and epic. |
| Validation | Check or review that proves a claim. |
| Evidence | Record supporting a status or claim. |
| Blocker | Condition preventing safe progress. |
| Risk | Condition that can cause failure or harm. |
| Risk register item | Structured risk with severity, mitigation, evidence, and next action. |
| Validation step | Repeatable command or review method with a success condition. |
| Roadmap link | Explicit goal-to-roadmap, queue, and status mapping. |
| Completed item | Scoped work finished with evidence. |
| Deferred item | Work intentionally delayed. |
| Archived item | Historical material not active by default. |
| Archive ledger item | Historical, deferred, or review-candidate material kept outside active official goals. |
| Cycle plan item | Yearly, quarterly, monthly, or weekly execution record. |

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
- `content/development/seis-goal-review-cadence.json`
- `content/development/seis-goal-progress-ledger.json`
- `content/development/seis-goal-hierarchy.json`
- `content/development/seis-goal-archive-ledger.json`
- `content/development/seis-goal-cycle-plan.json`
- `content/development/seis-goal-risk-register.json`
- `content/development/seis-goal-validation-steps.json`
- `content/development/seis-goal-roadmap-links.json`
- `docs/goals/evidence-ledger.md`
- `docs/goals/execution-board.md`
- `docs/goals/review-cadence.md`
- `docs/goals/progress-ledger.md`
- `docs/goals/horizon-map.md`
- `docs/goals/project-epic-task-map.md`
- `docs/goals/archive-ledger.md`
- `docs/goals/cycle-plan.md`
- `docs/goals/risk-register.md`
- `docs/goals/validation-steps.md`
- `docs/goals/roadmap-links.md`
- `docs/goals/command-center-view-model.md`
- `scripts/check-goal-tracking.mjs`

Run:

```bash
npm run check:goal-tracking
```
