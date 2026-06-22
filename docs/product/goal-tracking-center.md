# Goal Tracking Center

Goal Tracking Center is the Command Center module for long-term goals,
milestones, evidence, blockers, decisions, and next safe actions.

The current branch foundation has structured JSON plus a generated static page:

- `content/development/seis-goal-command-center-view.json`
- `apps/web/goal-tracking.html`

It must work without an LLM or external API.

## Required Views

| View | Purpose | Current source |
| --- | --- | --- |
| Goal list | Show goals by category, status, priority, and next action. | `content/development/seis-goal-command-center-view.json` |
| Evidence panel | Show validation and limitations. | `content/development/seis-goal-command-center-view.json` |
| Blocked items | Show blockers without hiding security or repo hygiene issues. | `content/development/seis-goal-command-center-view.json` |
| Review cadence | Show planned daily, weekly, and monthly review contracts. | `content/development/seis-goal-command-center-view.json` |
| Completed work | Show scoped completed items with evidence and limitations. | `content/development/seis-goal-command-center-view.json` |
| Deferred work | Show deferred work with reason, approval need, and next action. | `content/development/seis-goal-command-center-view.json` |
| Follow-up actions | Show safe continuation items after the current slice. | `content/development/seis-goal-command-center-view.json` |
| Planning horizons | Show yearly, quarterly, monthly, and weekly planning layers. | `content/development/seis-goal-command-center-view.json` |
| Projects, epics, subtasks | Show active projects, epics, and task-backed subtasks. | `content/development/seis-goal-command-center-view.json` |
| Archive ledger | Show historical, deferred, and review-candidate material outside active goals. | `content/development/seis-goal-command-center-view.json` |
| Cycle plan | Show yearly goals, quarterly goals, monthly goals, and weekly priorities. | `content/development/seis-goal-command-center-view.json` |
| Risk register | Show explicit risks, severity, mitigation, and next action. | `content/development/seis-goal-command-center-view.json` |
| Validation steps | Show scoped commands or review methods and success conditions. | `content/development/seis-goal-command-center-view.json` |
| Roadmap connection | Show backlog and next PR queue. | `docs/roadmap/*` |
| Readiness connection | Keep public/release status blocked until evidence exists. | `docs/STATUS.md` |

## UX Rules

- No fake progress bars.
- Completed states require evidence.
- Blockers stay visible.
- Planned states remain labeled planned.
- Planned reviews are not performed reviews.
- Hierarchy records are not live GitHub issue or project-board sync.
- Archive records are not official direction until promoted through review.
- Cycle records do not prove that weekly or monthly reviews were performed.
- Risk records do not prove mitigation is complete.
- Validation steps do not prove broader readiness outside their success condition.
- Unknown and unverified states are not hidden.
