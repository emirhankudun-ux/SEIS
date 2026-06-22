# Goal Execution Board

Structured source:

- `content/development/seis-goal-execution.json`

The execution board is a file-backed task, blocker, and decision register. It
is not a live automation queue yet.

## Current Tasks

| ID | Status | Next action |
| --- | --- | --- |
| `SEIS-TASK-001` | active | Run `npm run check:goal-tracking`. |
| `SEIS-TASK-002` | blocked | Stage only scoped Goal Tracking OS files. |
| `SEIS-TASK-003` | planned | Add generated/static Goal Tracking Center later. |

## Current Blockers

| ID | Severity | Next action |
| --- | --- | --- |
| `SEIS-BLOCKER-001` | high | Handle pre-existing tracked deletions in a dedicated repository hygiene PR. |
| `SEIS-BLOCKER-002` | medium | Inspect live GitHub state only after approval. |

## Decisions

| ID | Decision |
| --- | --- |
| `SEIS-DEC-001` | Use file-backed non-LLM goal records first. |
| `SEIS-DEC-002` | Do not stage unrelated deletion set. |
