# SEIS Goal Tracking Requirement Matrix

Date: 2026-06-20

This matrix expands the Goal Tracking OS objective audit into requirement-level
coverage. It is a local, non-LLM evidence map, not a completion claim.

Structured source:
[`../../content/development/seis-goal-requirement-matrix.json`](../../content/development/seis-goal-requirement-matrix.json).

Related audits:

- [`GOAL_TRACKING_OBJECTIVE_AUDIT.md`](GOAL_TRACKING_OBJECTIVE_AUDIT.md)
- [`GOAL_TRACKING_COMPLETION_AUDIT.md`](GOAL_TRACKING_COMPLETION_AUDIT.md)

## Status Summary

| Status | Meaning |
| --- | --- |
| `proved` | Current local records and docs support the requirement for the stated scope. |
| `partial` | The foundation exists, but the full product/runtime requirement is not complete. |
| `blocked` | The requirement is blocked by a named repository or approval condition. |
| `planned` | The requirement is deliberately deferred and not implemented. |
| `unverified` | Evidence is unavailable or stale. |

## Requirement Coverage

| Requirement | Status | Evidence | Gap |
| --- | --- | --- | --- |
| `SEIS-REQ-001` long-term vision and strategic direction | proved | Vision, long-term goals, and goal registry exist. | Future strategy changes need dated reviews. |
| `SEIS-REQ-002` yearly, quarterly, monthly, and weekly horizons | proved | Planning horizon records validate and monthly review is recorded. | Static records only; no live calendar system. |
| `SEIS-REQ-003` active projects, milestones, and epics | proved | Milestone map, goal records, and active project records exist. | Not an interactive timeline. |
| `SEIS-REQ-004` tasks and subtasks | proved | Execution registry validates tasks and subtasks. | File-backed contract only. |
| `SEIS-REQ-005` blockers and risks | proved | Blocked goals and execution blockers are visible. | Repository hygiene remains unresolved. |
| `SEIS-REQ-006` decisions | proved | Execution decisions are structured and linked to goals. | Future architecture decisions still need ADRs when they change architecture. |
| `SEIS-REQ-007` daily, weekly, and monthly reviews | proved | Cadence and performed review logs exist. | Future periods still need current evidence. |
| `SEIS-REQ-008` validation evidence | proved | Evidence ledger records passed, blocked, failed, observed, and partial evidence. | No full secret-history, dependency, or public-readiness scan. |
| `SEIS-REQ-009` completed, deferred, and follow-up work | proved | Progress ledger and completion gate validate. | Completed items prove only their named scope. |
| `SEIS-REQ-010` next safe actions | proved | Goals, tasks, blockers, reviews, and follow-ups expose next actions. | No live queue assignment. |
| `SEIS-REQ-011` active vs archive separation | partial | Goal statuses and docs navigation distinguish active and historical material. | No dedicated archived-goal ledger yet. |
| `SEIS-REQ-012` strategic categories | proved | 20 required categories validate through goal records. | Several categories remain planned or blocked. |
| `SEIS-REQ-013` lightweight goal object | proved | Schema doc and validator enforce required fields. | Not persistent application storage. |
| `SEIS-REQ-014` Goal Tracking Center app foundation | partial | Static Goal Tracking Center and Command Center shell exist. | No routed runtime or live integrations. |
| `SEIS-REQ-015` Command Center Goal UX | partial | Static page renders cards, blockers, next actions, validation, planning, readiness, objective coverage, and completion gates. | No dedicated interactive milestone timeline. |
| `SEIS-REQ-016` evidence rules | proved | Evidence limitations, completion gate, and scoped sensitive-pattern checks exist. | Scoped checks are not full repository security scans. |
| `SEIS-REQ-017` LLM independence | proved | Records, validators, generators, and static pages run locally. | Future LLM assistance still needs permission boundaries. |
| `SEIS-REQ-018` first implementation priority | partial | Goals connect to docs, roadmap, backlog, PR queue, generated views, and static shell. | Dynamic runtime and repository hygiene remain unfinished. |
| `SEIS-REQ-019` repository intelligence and readiness blockers | partial | Status, deletion review, backlog, and queue expose blockers. | No live scanner or GitHub PR integration. |
| `SEIS-REQ-020` approval boundaries | proved | Deferred items and next PR queue list approval-needed work. | Approval center UI is not implemented. |
| `SEIS-REQ-021` live integrations | planned | Current docs mark external states unverified or deferred. | No external GitHub, SSH, deployment, provider, benchmark, or dataset operation was performed. |
| `SEIS-REQ-022` requirement matrix maintenance | proved | Structured matrix and this review document exist. | Matrix must be refreshed when source records change. |

## Current Decision

The Goal Tracking OS foundation is stronger and more inspectable after this
matrix, but the full objective remains `not_complete`. The next safe action is
still repository hygiene recovery before public, release, merge, or live
integration claims.

## Validation

Run:

```bash
npm run check:goal-tracking
npm run check:goal-command-center-view
npm run check:goal-command-center-static
```

Expected known blocker:

```bash
npm run check:foundation
```

The foundation check remains blocked until the missing governance files and
checker script are restored, replaced, or intentionally removed through
reviewed repository hygiene work.
