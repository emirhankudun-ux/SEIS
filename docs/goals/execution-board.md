# Goal Execution Board

Structured source:

- `content/development/seis-goal-execution.json`

The execution board is a file-backed task, blocker, and decision register. It
is not a live automation queue yet.

## Current Tasks

| ID | Status | Next action |
| --- | --- | --- |
| `SEIS-TASK-001` | active | Run `npm run check:goal-tracking`. |
| `SEIS-TASK-002` | blocked | Continue Goal Tracking work only from the clean isolated worktree and resolve the primary checkout merge in a dedicated hygiene pass. |
| `SEIS-TASK-003` | active | Keep generated/static Goal Tracking Center fresh from source records. |

## Current Blockers

| ID | Severity | Next action |
| --- | --- | --- |
| `SEIS-BLOCKER-001` | high | Resolve the primary checkout merge conflicts in a dedicated repository hygiene pass. |
| `SEIS-BLOCKER-002` | medium | Inspect live GitHub state only after approval. |

## Decisions

| ID | Decision |
| --- | --- |
| `SEIS-DEC-001` | Use file-backed non-LLM goal records first. |
| `SEIS-DEC-002` | Do not stage unresolved primary checkout merge state. |
