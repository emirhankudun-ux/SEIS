# Command Center Goals View

The Command Center Goals View is the UI contract for rendering Goal Tracking OS
records.

## First Data Contract

- `content/development/seis-goal-tracking.json`
- `content/development/seis-goal-evidence.json`
- `content/development/seis-goal-execution.json`
- `content/development/seis-goal-review-cadence.json`
- `content/development/seis-goal-progress-ledger.json`
- `content/development/seis-goal-hierarchy.json`
- `content/development/seis-goal-archive-ledger.json`
- `content/development/seis-goal-cycle-plan.json`
- `content/development/seis-goal-command-center-view.json`
- `apps/web/goal-tracking.html`
- `docs/roadmap/MASTER_BACKLOG.md`
- `docs/roadmap/NEXT_PR_QUEUE.md`

## Required Panels

| Panel | Rule |
| --- | --- |
| Summary cards | Counts only; no fake percentages. |
| Goal table | Status, category, priority, evidence, next action. |
| Blocker panel | Repository hygiene and approval blockers visible. |
| Evidence drawer | Shows proof and limitations. |
| Next safe action panel | Uses task and PR queue records. |
| Review cadence panel | Shows planned daily, weekly, and monthly reviews without marking them performed. |
| Completed work panel | Shows scoped completed records with evidence and limitations. |
| Deferred work panel | Shows deferred records with approval notes. |
| Follow-up action panel | Shows continuing actions tied to goals, tasks, and evidence. |
| Planning horizon panel | Shows yearly, quarterly, monthly, and weekly planning records. |
| Project hierarchy panel | Shows active projects, epics, and subtasks with blockers visible. |
| Archive ledger panel | Shows historical, deferred, and review-candidate material without promoting it. |
| Cycle plan panel | Shows yearly, quarterly, monthly, and weekly execution cycle records. |
| Readiness panel | Public and release readiness stay blocked until validated. |

## Generated Surface

The current generated static surface is `apps/web/goal-tracking.html`. It is a
manual/static Command Center foundation, not a live integration.

## Non-Goals

- No live GitHub state in the first slice.
- No SSH operations.
- No deployment or release actions.
- No LLM-dependent source of truth.
