# Project Epic Task Map

The Project Epic Task Map connects active projects, epics, tasks, and subtasks
inside the Goal Tracking OS.

## Purpose

- Track active projects without treating every idea as an active goal.
- Connect epics and subtasks to existing goal, evidence, and execution records.
- Keep blocked repository hygiene work visible without staging unrelated
  deletion changes.

## Source Record

- `content/development/seis-goal-hierarchy.json`

## Current Projects

| ID | Status | Scope |
| --- | --- | --- |
| `SEIS-PROJECT-001` | active | Goal Tracking OS foundation. |
| `SEIS-PROJECT-002` | blocked | Repository hygiene recovery. |
| `SEIS-PROJECT-003` | planned | Repository intelligence scanner plan. |

## Current Epics

| ID | Project | Status | Scope |
| --- | --- | --- | --- |
| `SEIS-EPIC-001` | `SEIS-PROJECT-001` | active | Structured source records. |
| `SEIS-EPIC-002` | `SEIS-PROJECT-001` | active | Generated Command Center view. |
| `SEIS-EPIC-003` | `SEIS-PROJECT-002` | blocked | Tracked deletion triage. |

## Current Subtasks

| ID | Task | Epic | Status |
| --- | --- | --- | --- |
| `SEIS-SUBTASK-001` | `SEIS-TASK-001` | `SEIS-EPIC-001` | active |
| `SEIS-SUBTASK-002` | `SEIS-TASK-003` | `SEIS-EPIC-002` | active |
| `SEIS-SUBTASK-003` | `SEIS-TASK-002` | `SEIS-EPIC-003` | blocked |

## Rules

- Active projects require evidence-backed goal links.
- Epics must belong to a known active, planned, or blocked project.
- Subtasks must point to known execution tasks and epics.
- Blocked subtasks must show the blocker instead of disappearing from the view.
- This map does not authorize merges, deletion cleanup, deployment, release, SSH,
  model training, benchmark execution, or dataset downloads.

## Validation

`npm run check:goal-tracking` validates project, epic, subtask, goal, task,
evidence, and path references and checks that generated Command Center panels
are fresh.

## Next Safe Action

Use this map as the bridge between strategic goals and execution records while
keeping repository hygiene work in a dedicated PR.
