# Command Center Goals View

Date: 2026-06-19

The Command Center Goals View is the UI expression of SEIS Goal Tracking OS. It
connects long-term goals to roadmap, validation, blockers, evidence, public
readiness, release readiness, AI Core progress, and Command Center progress.

## Layout

| Region | Purpose |
| --- | --- |
| Header | Current review window, last updated date, and stale data warning. |
| Summary Strip | Counts by status: active, blocked, planned, in-review, validated, completed, deferred. |
| Goal Table | Sortable/filterable goal list with evidence and next action. |
| Milestone Timeline | Phase and milestone status without fake progress bars. |
| Blocker Panel | High-risk blockers, security blockers, and approval-needed actions. |
| Next Safe Action Panel | What should happen next, grouped by PR queue and goal. |
| Evidence Drawer | Links to docs, validation output, reviews, files, and PR records. |
| Review Cadence Panel | Daily, weekly, and monthly review templates and last review dates. |

## Filters

- Category.
- Status.
- Priority.
- Risk.
- Owner role.
- Evidence state.
- Blocked only.
- Approval needed.
- Review cadence.

## Empty And Stale States

| State | Message rule |
| --- | --- |
| No goals | Explain that no goals are defined and link to goal schema. |
| Missing evidence | Show `evidence unavailable`; do not infer completion. |
| Stale review | Show last reviewed date and review cadence. |
| GitHub unknown | Show approval-needed state for live PR data. |
| Validation blocked | Show exact failing check and blocker link. |

## Accessibility

- Goal status must not depend on color alone.
- Tables need keyboard focus and clear column labels.
- Blocked and approval-needed states should be announced clearly.
- Long text must wrap without hiding evidence links.
- Reduced-motion users should not see timeline animation.

## First UI Data Contract

The first generated Command Center view source is
[`../../content/development/seis-goal-command-center-view.json`](../../content/development/seis-goal-command-center-view.json).
The first generated static page is
[`../../apps/command-center/goal-tracking/index.html`](../../apps/command-center/goal-tracking/index.html).
It is derived from the structured source records:

- [`../../content/development/seis-goal-tracking.json`](../../content/development/seis-goal-tracking.json)
- [`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json)
- [`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json)

The raw goal source is
[`../../content/development/seis-goal-tracking.json`](../../content/development/seis-goal-tracking.json).
Evidence and validation summaries should come from
[`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json).
Tasks, subtasks, blockers, decisions, and next safe actions should come from
[`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json).
The compact view model can be derived from each goal record:

```json
{
  "goal_id": "SEIS-GOAL-002",
  "title": "Establish SEIS Goal Tracking OS",
  "category": "Goal Tracking OS",
  "priority": "P1 high",
  "status": "active",
  "risk": "medium",
  "evidence_state": "documented",
  "blocker_count": 1,
  "next_action": "Add static Goal Tracking Center data and UI plan"
}
```

## Non-Goals

- No fabricated progress bars.
- No hidden blockers.
- No automatic completion.
- No live GitHub or SSH dependency for first version.
- No LLM dependency for goal state.
