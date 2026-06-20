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
| `SEIS-COMPLETE-004` Goal Tracking OS objective coverage audit | `SEIS-EVID-014` | Does not prove full Command Center implementation or resolve hygiene blockers. |
| `SEIS-COMPLETE-005` Daily Goal Tracking OS review for 2026-06-20 | `SEIS-EVID-015` | Does not mark broader cadence complete. |
| `SEIS-COMPLETE-006` Goal Tracking OS completion gate audit | `SEIS-EVID-016` | Does not mark the full objective complete. |
| `SEIS-COMPLETE-007` Weekly Goal Tracking OS review for 2026-W25 | `SEIS-EVID-017` | Does not mark recurring future reviews complete or resolve hygiene blockers. |
| `SEIS-COMPLETE-008` Monthly Goal Tracking OS review for 2026-06 | `SEIS-EVID-018` | Does not mark the full objective complete or resolve hygiene blockers. |
| `SEIS-COMPLETE-009` Static Command Center shell | `SEIS-EVID-019` | Does not prove a dynamic routed runtime or live integrations. |
| `SEIS-COMPLETE-010` Goal Tracking OS requirement matrix | `SEIS-EVID-020` | Does not mark the full objective complete or replace the completion gate. |

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
