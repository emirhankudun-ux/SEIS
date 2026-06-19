# SEIS Goal Execution Board

Date: 2026-06-19

This board defines the first non-LLM execution layer for Goal Tracking OS. The
structured source is
[`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json).

The execution board turns goals into tasks, subtasks, blockers, decisions, and
next safe actions. It does not approve file deletion, deployment, external API
access, SSH, model training, or any other dangerous action.

## Current Execution Records

| Record type | Count | Source |
| --- | ---: | --- |
| Tasks | 5 | `content/development/seis-goal-execution.json` |
| Subtasks | 11 | `content/development/seis-goal-execution.json` |
| Blockers | 3 | `content/development/seis-goal-execution.json` |
| Decisions | 4 | `content/development/seis-goal-execution.json` |

## Active / Blocked Tasks

| Task ID | Status | Supports | Current next action |
| --- | --- | --- | --- |
| `SEIS-TASK-001` | blocked | Repository hygiene, public/release readiness | Use the deletion review as the recovery checklist in a focused repository hygiene PR. |
| `SEIS-TASK-002` | active | Goal Tracking OS, long-term vision | Keep `npm run check:goal-tracking` as the local non-LLM integrity gate. |
| `SEIS-TASK-003` | planned | Goal Tracking Center and Command Center | Build a static/manual Command Center Goal Tracking view after repository hygiene blockers are isolated. |
| `SEIS-TASK-004` | planned | Repository intelligence | Define read-only repository intelligence output records before implementing scanner automation. |
| `SEIS-TASK-005` | planned | Review cadence | Do not create fake review records; wait for actual review cadence. |

## Current Blockers

| Blocker ID | Severity | Status | Next action |
| --- | --- | --- | --- |
| `SEIS-BLOCKER-001` | critical | active | Use the deletion review to drive restore, replace, archive, or approved deletion decisions. |
| `SEIS-BLOCKER-002` | critical | active | Restore or replace the required governance docs and open-source governance validator. |
| `SEIS-BLOCKER-003` | medium | active | Build static/manual view after data contract is stable. |

## Current Decisions

| Decision ID | Status | Decision |
| --- | --- | --- |
| `SEIS-DEC-001` | accepted | Goal Tracking OS is non-LLM-first. |
| `SEIS-DEC-002` | accepted | Tracked deletions must not be resolved implicitly. |
| `SEIS-DEC-003` | accepted | Repository intelligence should be read-only first. |
| `SEIS-DEC-004` | accepted | Review cadence records must be real. |

## Validation

Run:

```bash
npm run check:goal-tracking
```

The validator checks goal records, evidence records, execution tasks, subtasks,
blockers, decisions, relative paths, id references, and sensitive-looking text
in execution records.
