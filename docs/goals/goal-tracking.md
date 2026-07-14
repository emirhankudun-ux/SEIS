# SEIS Goal Tracking

Status: active, public-safe operational guide

This document is the short operational entry point for the SEIS Goal Tracking
OS. It explains how to select work, record progress, attach evidence, use
supervised subagents, and close a goal without inventing completion.

It does not replace the repository constitution or the structured source files.
The authority order is:

1. `AGENTS.md`, including its goal-tracking rules.
2. [`docs/SEIS_GOAL_TRACKING.md`](../SEIS_GOAL_TRACKING.md), the SEIS goal
   constitution.
3. [`goal-tracking-system.md`](goal-tracking-system.md), the detailed Goal
   Tracking OS storage and lifecycle rules.
4. The structured JSON registries and schemas listed below.
5. Generated views, static pages, and reports.

Generated views and reports are useful projections. They never override the
source registry, evidence records, validation results, or repository state.

## Purpose

Goal tracking exists to turn a large ecosystem vision into small, reviewable,
reversible engineering outcomes. Every meaningful work cycle must produce a
real output, such as:

- code, tests, schemas, contracts, or migrations;
- documentation, an ADR, a threat model, or a decision record;
- a validation script, workflow, registry, or automation;
- design tokens, a component, an interaction specification, or an accessible
  prototype;
- an evidence record that honestly explains what was checked and what remains
  unverified.

Planning-only work is allowed when implementation is unsafe, premature, or
blocked. It must still create a concrete artifact and state the unblock
condition.

## Canonical Sources

| Source | Responsibility |
| --- | --- |
| `content/development/seis-goal-tracking.json` | Goal registry, statuses, priorities, categories, owners, risks, and next actions. |
| `content/development/seis-goal-evidence.json` | Evidence records and their relationship to goals. |
| `content/development/seis-goal-execution.json` | Tasks, execution scope, and task evidence links. |
| `content/development/seis-goal-review-cadence.json` | Planned and performed daily, weekly, and monthly reviews. |
| `content/development/seis-goal-progress-ledger.json` | Progress events and status history. |
| `content/development/seis-goal-hierarchy.json` | Project, epic, task, and subtask relationships. |
| `content/development/seis-goal-risk-register.json` | Risks, severity, mitigation, and next action. |
| `content/development/seis-goal-validation-steps.json` | Repeatable validation commands and success conditions. |
| `content/development/seis-goal-roadmap-links.json` | Goal-to-roadmap and queue mappings. |
| `data/seis-goal-tracking-update-prompt.json` | Machine-readable update-prompt contract. |
| `schemas/seis-goal-tracking-update.schema.json` | Schema for the bounded update proposal. |
| `docs/governance/seis-goal-tracking-update-prompt.md` | Human-readable update prompt package. |
| `reports/seis-goal-tracking-update-proposal-20260714.json` | Latest structured update proposal and evidence links. |
| `data/seis-enterprise-expansion-v3.json` | Specification-only Enterprise Expansion V3 term registry. |
| `schemas/seis-enterprise-expansion-v3.schema.json` | Structural schema for the Enterprise Expansion V3 registry. |
| `docs/governance/seis-enterprise-expansion-v3.md` | Human-readable Enterprise Expansion V3 governance and implementation boundary. |
| `scripts/check-seis-enterprise-expansion-v3.mjs` | Deterministic validator for exact term sets, Goal links, evidence boundaries, and non-claims. |
| `content/development/seis-goal-command-center-view.json` | Command Center view model generated from tracked records. |
| `apps/web/goal-tracking.html` | Public-safe static Goal Tracking Center surface. |

There must be one canonical record for each goal. Do not create a second JSON,
Markdown, issue, or subagent memory record that silently becomes a competing
source of truth.

## Goal Identity

Use stable identifiers in the form:

```text
SEIS-GOAL-001
SEIS-TASK-001
SEIS-EVID-001
SEIS-VAL-001
SEIS-REVIEW-001
SEIS-ROADMAP-LINK-001
```

Identifiers are immutable. Never recycle an archived identifier. When a goal
is split, retain the parent relationship and create new child records with new
IDs. Branches, commits, pull requests, reports, and evidence should reference
the applicable Goal ID.

For the current goal-tracking update package, use the existing mapping recorded
in `docs/SEIS_GOAL_TRACKING.md`: the requested execution label is
`SEIS-EXEC-001`, while the canonical Goal Tracking OS record is
`SEIS-GOAL-003`. Do not create a duplicate `SEIS-GOAL-001` for this package.

## Required Goal Fields

Every meaningful goal record must state at least:

```yaml
id: SEIS-GOAL-000
title: Clear outcome
description: Evidence-bound description of the outcome.
category: Goal Tracking OS
priority: P1 high
status: proposed
owner_role: Goal Tracking
target_phase: foundation
related_milestone: milestone not assigned
related_epic: epic not assigned
related_docs: []
related_files: []
dependencies: []
blockers: []
risks: []
evidence_links: []
validation_method: Exact command or review gate.
next_action: Smallest safe next action.
created_at: 2026-07-14
last_reviewed: 2026-07-14
review_cadence: monthly
notes: []
```

The record must also make scope, non-goals, ownership, security classification,
rollback, acceptance criteria, and GitHub output clear. Add those details to a
linked execution or decision record when the compact registry shape cannot hold
them safely.

## Status Lifecycle

The repository registry currently allows these statuses:

| Status | Meaning |
| --- | --- |
| `idea` | Captured possibility; not yet scoped. |
| `proposed` | Under evaluation and decomposition. |
| `planned` | Approved and ready after dependencies are satisfied. |
| `active` | Concrete work is underway. |
| `blocked` | Safe progress cannot continue; the blocker and unblock condition are recorded. |
| `in-review` | Output exists and is awaiting review or validation. |
| `validated` | The stated validation has passed; broader readiness is not implied. |
| `completed` | Acceptance criteria and required gates have evidence. |
| `deferred` | Intentionally postponed with a reason and next review point. |
| `archived` | Historical record retained outside active work. |
| `deprecated` | Replaced or no longer recommended. |

Do not silently replace these values with a different vocabulary. Higher-level
governance may use terms such as `in-progress` or `review`; map them explicitly
when producing an adapter or report. A status change must not erase the prior
status, evidence, blocker, or decision.

The following transitions are the normal path:

```text
idea -> proposed -> planned -> active -> in-review -> validated -> completed
                         \-> blocked -> active
planned/active -> deferred
completed/deferred -> archived
```

No goal may be marked `completed` only because a prompt was written, a branch
was created, a subagent produced a summary, or a file count increased.

## Selection and Execution Loop

Use this loop for every meaningful update:

1. Read `AGENTS.md`, the project manifest, this file, the active goal, and the
   linked source records.
2. Inspect branch, worktree, repository ownership, affected paths, and existing
   tests before editing.
3. Select the highest-priority unblocked goal that belongs to this repository.
4. Define the smallest safe task, its non-goals, dependencies, and rollback.
5. Assign a responsible role. Keep subagents supervised and scoped.
6. Produce one concrete reviewable output.
7. Run the narrowest relevant validation, then broader checks proportional to
   the risk and blast radius.
8. Record exact commands, results, limitations, and evidence IDs.
9. Update the goal, task, risk, decision, and roadmap records as needed.
10. Inspect the final worktree and report the next safe action.

If the selected work is blocked, record the blocker and unblock condition. Do
not hide it by changing the goal to `planned`, `completed`, or `validated`.

## Evidence Rules

Evidence must be reproducible, relevant, and public-safe. A useful evidence
record includes:

```yaml
id: SEIS-EVID-000
supports_goal_ids:
  - SEIS-GOAL-000
type: command | test | schema | review | artifact | decision
status: verified | blocked | unavailable
source: npm run check:goal-tracking
result: Exit code 0 and validator output.
limitations:
  - Does not prove production deployment.
related_paths:
  - content/development/seis-goal-tracking.json
recorded_at: 2026-07-14
```

Never write "tests pass" without naming the command. Never use a placeholder
`echo` as proof of a real check. Mark skipped, unavailable, or blocked checks
and explain why. Never put secrets, private notes, access tokens, or hidden
chain-of-thought in an evidence record.

## Bounded Prompt Updates

The five-million-character requirement is an aggregate context ceiling, not a
literal prompt-body target. The update package must:

- load only relevant source-linked context chunks;
- preserve the unused budget when more context is not useful;
- reject padding, duplicated text, fabricated progress, and unsupported claims;
- keep the rendered prompt within its explicit runtime limit;
- emit a structured proposal before any source record is changed;
- validate references, status transitions, evidence, and repository state.

The canonical prompt and machine contract are:

- [`seis-goal-tracking-update-prompt.md`](../governance/seis-goal-tracking-update-prompt.md)
- [`seis-goal-tracking-update-prompt.json`](../../data/seis-goal-tracking-update-prompt.json)
- [`seis-goal-tracking-update.schema.json`](../../schemas/seis-goal-tracking-update.schema.json)

For `SEIS-GOAL-003` governance work, the conditional Enterprise Expansion V3
source is [`seis-enterprise-expansion-v3.md`](../governance/seis-enterprise-expansion-v3.md)
with its registry, schema, and validator. Its eight domains and all named
terms are specification-only until separate evidence-backed implementation
goals exist.

The prompt package does not claim that thousands of agents, providers, MCP
servers, or background workers actually ran. It may describe roles and work
packages, but execution claims require current-environment evidence.

## Supervised Subagent Contract

Subagents are role-based collaborators, not an excuse to inflate counts or
claim parallel execution that did not happen. Each assigned role must return:

- goal and task IDs;
- inspected paths;
- proposed or completed changes;
- validation commands and results;
- risks, blockers, and rollback;
- handoff evidence.

Default permissions are read-only or plan-only. A subagent may not self-grant
write access, expose secrets, push protected branches, enable an unreviewed
MCP write capability, or mark a goal complete. Codex remains the coordinating
writer unless an explicit reviewed handoff changes that boundary.

Role descriptions belong in the agent registry. Goal records should track the
actual assigned work, not a fictional count of 800, 1,300, 3,000, or 4,500
agents. Capability is measured by useful validated output, not headcount.

## Quality, Security, and Public Boundary

Before completion, consider the applicable gates:

- architecture and ownership;
- product and design-system consistency;
- AI integrity, provider routing, and permission boundaries;
- security, privacy, and secret scanning;
- accessibility and keyboard/screen-reader behavior;
- performance and resource budgets;
- tests, contracts, and schema validation;
- documentation, rollback, and release readiness.

The repository is public-safe by default. Demo, local, cloud, hybrid,
offline, unavailable, and approval-required states must remain distinguishable.
No provider, model, database, MCP server, deployment, or integration may be
described as live or connected without current evidence.

## Validation Commands

Run the focused checks first:

```bash
npm run check:goal-tracking
npm run check:seis-goal-tracking-update-prompt
npm run check:goal-command-center-view
```

When the change touches governance or broader repository behavior, also run:

```bash
npm run check:seis-master-prompt
npm run check:seis-master-prompt-report
npm run check:project-ecosystem-manifest
npm run seis:check
npm run seis:test
git diff --check
```

Report every failed, skipped, or unavailable check. A passing focused validator
proves only its documented contract; it does not prove deployment, provider
connectivity, production readiness, or completion of unrelated goals.

## Definition of Done

A goal may be completed only when:

- the goal ID, owner, scope, and non-goals are clear;
- acceptance criteria have evidence;
- required quality gates pass or are explicitly recorded as unavailable;
- security, privacy, accessibility, and performance impacts are addressed;
- documentation and source links are current;
- risks, blockers, decisions, and rollback are recorded;
- issue, branch, commit, and pull request state do not contradict the goal;
- the final worktree was inspected;
- remaining gaps became explicit follow-up goals.

If any required condition is missing, use `in-review`, `blocked`, or
`deferred`, as appropriate. Do not use completion as a placeholder for intent.

## Goal Report

Use this compact report shape at the end of a tracked run:

```markdown
# Goal Report

## Project
## Goal ID
## Status
## Scope
## Completed Work
## Changed Files
## Evidence
## Validation Commands
## Failed or Skipped Checks
## Security and Privacy
## AI / MCP / Subagent Notes
## Risks and Blockers
## Rollback
## Remaining Gaps
## Next Recommended Goal
## Worktree Status

Repository state: clean
```

Replace the final line with `dirty`, `blocked`, or `not verified` when that is
the actual repository state. The final repository-state line must be exact.

## Related Surfaces

- [Goal Tracking Constitution](../SEIS_GOAL_TRACKING.md)
- [Detailed Goal Tracking OS](goal-tracking-system.md)
- [Goal Schema](goal-schema.md)
- [Evidence Ledger](evidence-ledger.md)
- [Execution Board](execution-board.md)
- [Validation Steps](validation-steps.md)
- [Roadmap Links](roadmap-links.md)
- [Goal Tracking Center](../product/goal-tracking-center.md)
- [Static Goal Tracking Center](../../apps/web/goal-tracking.html)

This guide is intentionally bounded. Add a new schema, registry, or report only
when it owns information that does not already have a canonical source.
