# Goal Tracking Center

Goal Tracking Center is the Command Center module for long-term goals,
milestones, evidence, blockers, decisions, and next safe actions.

The first branch foundation is documentation and structured JSON only. It must
work without an LLM or external API.

## Required Views

| View | Purpose | Current source |
| --- | --- | --- |
| Goal list | Show goals by category, status, priority, and next action. | `content/development/seis-goal-tracking.json` |
| Evidence panel | Show validation and limitations. | `content/development/seis-goal-evidence.json` |
| Blocked items | Show blockers without hiding security or repo hygiene issues. | `content/development/seis-goal-execution.json` |
| Roadmap connection | Show backlog and next PR queue. | `docs/roadmap/*` |
| Readiness connection | Keep public/release status blocked until evidence exists. | `docs/STATUS.md` |

## UX Rules

- No fake progress bars.
- Completed states require evidence.
- Blockers stay visible.
- Planned states remain labeled planned.
- Unknown and unverified states are not hidden.
