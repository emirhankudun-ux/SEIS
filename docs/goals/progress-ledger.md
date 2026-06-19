# SEIS Goal Progress Ledger

Date: 2026-06-20

This document defines how Goal Tracking OS records completed work, deferred
work, and follow-up actions without using an LLM as the source of truth.

The structured progress ledger is
[`../../content/development/seis-goal-progress-ledger.json`](../../content/development/seis-goal-progress-ledger.json).

## Completed Items

Completed items require evidence ids and limitations. A completed item means the
listed scope is complete, not that the whole SEIS ecosystem is complete.

| Completed item | Evidence | Limitation |
| --- | --- | --- |
| `SEIS-COMPLETE-001` Goal Tracking OS documentation foundation | `SEIS-EVID-001` | Does not prove an app module exists. |
| `SEIS-COMPLETE-002` Structured Goal Tracking OS records | `SEIS-EVID-008`, `SEIS-EVID-011`, `SEIS-EVID-012` | Does not claim reviews or horizons are complete. |
| `SEIS-COMPLETE-003` Static Goal Tracking Center surface | `SEIS-EVID-009`, `SEIS-EVID-010` | Does not prove routed app shell, deployment, or live integration. |

## Deferred Items

| Deferred item | Reason | Next action |
| --- | --- | --- |
| `SEIS-DEFER-001` Routed Command Center Goal Tracking module | Repository hygiene should be isolated first. | Plan routed shell after validation blockers are handled. |
| `SEIS-DEFER-002` Live GitHub PR and branch state integration | External GitHub connection requires approval. | Run GitHub PR inspection only after approval. |
| `SEIS-DEFER-003` Public and release readiness claims | Foundation validation is blocked. | Resolve repository hygiene before readiness claims. |

## Follow-Up Actions

| Follow-up | Status | Priority | Next action |
| --- | --- | --- | --- |
| `SEIS-FOLLOWUP-001` Recover foundation validation surface | blocked | P0 critical | Restore, replace, or approve removal of missing governance files. |
| `SEIS-FOLLOWUP-002` Keep Goal Tracking records fresh | active | P1 high | Run validation after structured record updates. |
| `SEIS-FOLLOWUP-003` Connect static Goal Tracking Center to Command Center shell | planned | P1 high | Create a routed local shell after repository hygiene is isolated. |

## Rules

- Do not mark completed work without evidence ids.
- Completion applies only to the named scope.
- Deferred work must include a reason and next action.
- Follow-up actions must link to goals, tasks, evidence, and repo-relative
  paths.
- Dangerous deferred actions remain approval-gated.

## Validation

Run:

```bash
npm run check:goal-tracking
```

The validator checks completed, deferred, and follow-up records for ids,
statuses, evidence references, safe text, and repo-relative paths.
