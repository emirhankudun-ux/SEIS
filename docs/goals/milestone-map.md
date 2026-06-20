# SEIS Milestone Map

Date: 2026-06-19

This milestone map connects the long-term SEIS vision to concrete roadmap
phases, epics, tasks, validation, evidence, and follow-up actions.

## Roadmap Phases

| Phase | Name | Status | Outcome |
| --- | --- | --- | --- |
| `SEIS-PHASE-0` | Repository recovery and foundation | active | Source-of-truth docs, validation, and repo hygiene are recoverable. |
| `SEIS-PHASE-1` | Goal Tracking OS foundation | active | Goal schema, milestone map, review cadence, and product views are defined. |
| `SEIS-PHASE-2` | Non-LLM Command Center foundation | planned | Static/manual Command Center renders goals, roadmap, blockers, evidence, and readiness. |
| `SEIS-PHASE-3` | Repository intelligence scanners | planned | Local read-only scanners emit repo, docs, validation, and readiness findings. |
| `SEIS-PHASE-4` | Approval, workflow, and evidence platform | planned | Approval queue, workflow queue, and evidence locker are operational. |
| `SEIS-PHASE-5` | Public and release readiness platform | planned | Public/release dry-runs and evidence checklists are repeatable. |
| `SEIS-PHASE-6` | Optional LLM enhancement | planned | LLMs summarize and assist using existing evidence without owning truth. |

## Milestones

| Milestone ID | Phase | Title | Status | Acceptance evidence |
| --- | --- | --- | --- | --- |
| `SEIS-MS-001` | `SEIS-PHASE-1` | Goal docs foundation | active | Required `docs/goals/` files and product docs exist. |
| `SEIS-MS-002` | `SEIS-PHASE-1` | Goal evidence rules | active | Goal schema and review docs require evidence for completion/validation. |
| `SEIS-MS-003` | `SEIS-PHASE-2` | Goal Tracking Center product plan | active | Product docs define Goal Tracking Center and Command Center goals view. |
| `SEIS-MS-004` | `SEIS-PHASE-2` | Static goal data for UI | active | Structured goal records exist; Command Center rendering is still planned. |
| `SEIS-MS-005` | `SEIS-PHASE-3` | Repository intelligence report | planned | Read-only scanner emits missing docs, risky files, deleted files, and validation gaps. |
| `SEIS-MS-006` | `SEIS-PHASE-4` | Approval and evidence records | planned | Approval requests and evidence records have schema and UI surface. |
| `SEIS-MS-007` | `SEIS-PHASE-5` | Public/release readiness dry-runs | planned | Dry-run reports exist without deployment or release actions. |
| `SEIS-MS-008` | `SEIS-PHASE-1` | Goal evidence ledger | active | Structured evidence ledger exists and is validated with the goal registry. |
| `SEIS-MS-009` | `SEIS-PHASE-1` | Goal execution board | active | Structured tasks, subtasks, blockers, and decisions exist and validate. |
| `SEIS-MS-010` | `SEIS-PHASE-2` | Command Center goal view model | active | Generated static view model exists and validates against source records. |
| `SEIS-MS-011` | `SEIS-PHASE-2` | Static Goal Tracking Center page | active | Generated static page exists and validates against the view model. |
| `SEIS-MS-012` | `SEIS-PHASE-1` | Goal review cadence records | active | Daily, weekly, and monthly cadence records exist and validate without fake performed reviews. |
| `SEIS-MS-013` | `SEIS-PHASE-1` | Goal planning horizon records | active | Yearly, quarterly, monthly, weekly, and active-project records exist and validate without fake completion. |
| `SEIS-MS-014` | `SEIS-PHASE-1` | Goal progress ledger records | active | Completed, deferred, and follow-up records exist and validate with evidence and limitations. |

## Epics

| Epic ID | Milestone | Title | Status | Next action |
| --- | --- | --- | --- | --- |
| `SEIS-EPIC-GOALS-001` | `SEIS-MS-001` | Goal hierarchy and schema | active | Maintain goal docs and review report. |
| `SEIS-EPIC-GOALS-002` | `SEIS-MS-003` | Goal Tracking Center UX | planned | Build static/manual product view docs and fixture data. |
| `SEIS-EPIC-GOALS-003` | `SEIS-MS-004` | Goal data extraction | active | Keep JSON goal records aligned with docs and evidence. |
| `SEIS-EPIC-GOALS-004` | `SEIS-MS-005` | Repo-evidence connection | planned | Link scanner outputs to goals and blockers. |
| `SEIS-EPIC-GOALS-005` | `SEIS-MS-008` | Evidence ledger | active | Maintain validation, blocker, repository-state, commit, review, and security-scan records. |
| `SEIS-EPIC-GOALS-006` | `SEIS-MS-009` | Execution board | active | Maintain task, subtask, blocker, decision, and next-action records. |
| `SEIS-EPIC-GOALS-007` | `SEIS-MS-010` | Command Center view model | active | Keep generated Goal Tracking Center panels fresh from source records. |
| `SEIS-EPIC-GOALS-008` | `SEIS-MS-011` | Static Goal Tracking Center page | active | Keep the generated static page fresh and blocker-visible. |
| `SEIS-EPIC-GOALS-009` | `SEIS-MS-012` | Review cadence | active | Keep cadence definitions separate from performed daily, weekly, and monthly review logs. |
| `SEIS-EPIC-GOALS-010` | `SEIS-MS-013` | Planning horizons | active | Keep yearly, quarterly, monthly, weekly, and active project lanes linked to evidence. |
| `SEIS-EPIC-GOALS-011` | `SEIS-MS-014` | Progress ledger | active | Keep completed, deferred, and follow-up records scoped and evidence-backed. |

## Validation Steps

| Step | Proves | Current status |
| --- | --- | --- |
| Required docs exist | Goal Tracking OS documentation foundation exists. | active |
| Links use relative paths | Docs remain portable. | active |
| `git diff --check` | No whitespace issues in scoped diff. | passed on 2026-06-19 |
| `npm run seis:check` | Existing web audit still passes. | passed on 2026-06-19 |
| `npm run check:goal-tracking` | Goal registry, evidence ledger, execution board, review cadence, planning horizons, and progress ledger validate. | passed on 2026-06-20 |
| `npm run check:goal-command-center-view` | Generated Command Center view model is fresh. | passed on 2026-06-19 |
| `npm run check:goal-command-center-static` | Generated static Goal Tracking Center page is fresh. | passed on 2026-06-19 |
| `npm run check:foundation` | Foundation validators pass. | blocked by pre-existing deleted files |

## Follow-Up Actions

1. Render existing structured goal and evidence records in Command Center.
2. Add read-only scanner output for goal evidence and validation gaps.
3. Render Goal Tracking Center in Command Center without LLM dependency.
4. Keep weekly review records evidence-backed and add monthly review records only when reviews are actually performed.
