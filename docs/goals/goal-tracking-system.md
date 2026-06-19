# SEIS Goal Tracking OS

Date: 2026-06-19

SEIS Goal Tracking OS is the long-term progress management layer for the SEIS
ecosystem. It tracks vision, goals, milestones, epics, tasks, blockers, risks,
evidence, validation, decisions, completed work, deferred work, and next safe
actions.

## Mission

Make SEIS capable of showing:

- Where the project is going.
- What has been completed.
- What is blocked.
- What is planned.
- What needs review.
- What needs evidence.
- What should happen next.

The system must work without an LLM. LLMs may summarize, prioritize, and review
goal data, but they must not fabricate progress or override evidence.

## Official Concepts

| Concept | Meaning |
| --- | --- |
| Vision | Long-term direction and product identity. |
| Strategy | Sustained approach for reaching the vision. |
| Roadmap | Ordered phases and milestones. |
| Milestone | A measurable step toward a roadmap phase. |
| Epic | A coherent body of work under a milestone. |
| Task | A concrete unit of work. |
| Validation | Check or review that proves a claim. |
| Evidence | Link or record supporting status, progress, or validation. |
| Blocker | Condition preventing safe progress. |
| Risk | Condition that may cause failure, delay, or harm. |
| Completed item | Work finished with evidence. |
| Deferred item | Work intentionally delayed. |
| Archived item | Historical material not treated as active direction. |

## Status Rules

Allowed statuses:

- `idea`
- `proposed`
- `planned`
- `active`
- `blocked`
- `in-review`
- `validated`
- `completed`
- `deferred`
- `archived`
- `deprecated`

Rules:

- Do not mark goals completed without evidence.
- Do not mark goals validated without validation.
- Use `evidence unavailable` when evidence is missing.
- Use `blocked` only when a real blocker is named.
- Keep archive items separate from active goals.
- Do not turn every prompt, idea, or archive note into an active goal.

## Review Cadence

| Cadence | Purpose | Completion rule |
| --- | --- | --- |
| Daily Review | Record what changed, what is blocked, what needs validation, and next safe action. | Mark complete only when performed. |
| Weekly Review | Review active goals, milestone progress, next PR queue, blockers, completed work, and priorities. | Mark complete only when performed. |
| Monthly Review | Review long-term direction, roadmap phases, architecture, AI Core, Command Center, public readiness, release readiness, and SEIS Universe direction. | Mark complete only when performed. |

## Non-LLM Storage

The first version is Markdown-first:

- [`seis-vision.md`](seis-vision.md)
- [`long-term-goals.md`](long-term-goals.md)
- [`goal-schema.md`](goal-schema.md)
- [`milestone-map.md`](milestone-map.md)
- [`progress-review.md`](progress-review.md)
- review templates

Future versions may add JSON records generated from these docs or maintained
directly by Command Center.

The current structured registry lives at
[`../../content/development/seis-goal-tracking.json`](../../content/development/seis-goal-tracking.json).
It is validated by `npm run check:goal-tracking`, which enforces required
fields, allowed statuses, evidence-link safety, blocked-goal blockers, and
validation evidence rules.

The current structured evidence ledger lives at
[`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json)
and is documented in [`evidence-ledger.md`](evidence-ledger.md). It stores
validation, blocker, repository-state, commit, review, and security-scan
records without requiring an LLM.

The current structured execution registry lives at
[`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json)
and is documented in [`execution-board.md`](execution-board.md). It stores
tasks, subtasks, blockers, decisions, and next safe actions without requiring an
LLM.

## Command Center Connection

The Goal Tracking Center should render:

- Active goals.
- Milestone timeline.
- Weekly priorities.
- Blocked items.
- Next PR queue.
- Completed work with evidence.
- Validation status.
- Release/public readiness.
- AI Core and Command Center progress.
- Next safe actions.
