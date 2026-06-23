# Goal Progress Ledger

Structured source:

- `content/development/seis-goal-progress-ledger.json`

## Purpose

Track completed items, deferred items, and follow-up actions for the Goal
Tracking OS without turning planned work into false completion claims.

## Current Status

| Ledger | Status | Evidence | Next Safe Action |
| --- | --- | --- | --- |
| Completed items | Active | `SEIS-COMPLETE-*` records | Keep limitations visible. |
| Deferred items | Active | `SEIS-DEFER-*` records | Keep approval and dependency notes visible. |
| Follow-up actions | Active/planned | `SEIS-FOLLOWUP-*` records | Advance only through small reviewable PRs. |

## Rules

- Completed means completed only for the named scope.
- Deferred work remains visible until resolved.
- Follow-up actions must cite related goals, tasks, and evidence.
- Ledger items must use repo-relative paths.
- Ledger records must not include secrets, private hosts, provider keys, or
  private user data.

## Evidence Requirements

Completed items require:

- evidence IDs
- related paths
- summary
- limitations
- next action

Deferred items require:

- reason
- approval requirement when relevant
- next action

## Related Documents

- [goal-tracking-system.md](goal-tracking-system.md)
- [evidence-ledger.md](evidence-ledger.md)
- [execution-board.md](execution-board.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)

## Next Safe Action

Keep the progress ledger synchronized with `npm run check:goal-tracking` and
the generated Goal Tracking Center view.
