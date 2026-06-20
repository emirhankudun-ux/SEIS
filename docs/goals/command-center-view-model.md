# SEIS Goal Command Center View Model

Date: 2026-06-20

This document defines the first static Command Center-facing view model for
Goal Tracking OS. The generated view is:

[`../../content/development/seis-goal-command-center-view.json`](../../content/development/seis-goal-command-center-view.json)

It is generated from:

- [`../../content/development/seis-goal-tracking.json`](../../content/development/seis-goal-tracking.json)
- [`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json)
- [`../../content/development/seis-goal-execution.json`](../../content/development/seis-goal-execution.json)
- [`../../content/development/seis-goal-review-cadence.json`](../../content/development/seis-goal-review-cadence.json)
- [`../../content/development/seis-goal-review-log.json`](../../content/development/seis-goal-review-log.json)
- [`../../content/development/seis-goal-planning-horizons.json`](../../content/development/seis-goal-planning-horizons.json)
- [`../../content/development/seis-goal-progress-ledger.json`](../../content/development/seis-goal-progress-ledger.json)
- [`../../content/development/seis-goal-objective-coverage.json`](../../content/development/seis-goal-objective-coverage.json)
- [`../../content/development/seis-goal-completion-gate.json`](../../content/development/seis-goal-completion-gate.json)
- [`../../content/development/seis-goal-requirement-matrix.json`](../../content/development/seis-goal-requirement-matrix.json)

The first generated static page is:

[`../../apps/command-center/goal-tracking/index.html`](../../apps/command-center/goal-tracking/index.html)

## Purpose

The view model gives Command Center a non-LLM Goal Tracking Center data surface.
It can render progress cards, active goals, blocked goals, category status,
next actions, blockers, validation status, review cadence, performed review
logs, planning horizons, active projects, objective coverage, decisions,
requirement matrix, completion gates, readiness connections, and UX guardrails
without any model provider or external API.

## Generated Panels

| Panel | Purpose |
| --- | --- |
| `progressCards` | Numeric status cards without fake percentages. |
| `activeGoals` | Active goals with evidence links and next actions. |
| `blockedGoals` | Blocked goals with blockers and validation method. |
| `categoryStatus` | One status row per strategic category. |
| `nextActionQueue` | Tasks ordered by priority with blockers and evidence ids. |
| `blockedItems` | Active blockers with required approval and next action. |
| `validationStatus` | Evidence records and limitations. |
| `reviewCadence` | Planned daily, weekly, and monthly review records. |
| `actualReviews` | Performed review logs backed by evidence. |
| `planningHorizons` | Yearly, quarterly, monthly, and weekly planning lanes. |
| `activeProjects` | Active project lanes linked to goals, tasks, horizons, and evidence. |
| `milestoneTimeline` | Static milestone timeline derived from goal, horizon, and active project records. |
| `completedItems` | Scoped completed work with evidence and limitations. |
| `deferredItems` | Deferred work with reasons, approval needs, and next actions. |
| `followUpActions` | Follow-up actions linked to goals, tasks, and evidence. |
| `objectiveCoverage` | Goal Tracking OS mission requirements mapped to evidence and limitations. |
| `requirementMatrix` | Requirement-level proof, gaps, evidence, and next safe actions. |
| `completionGate` | Strict full-objective completion gate and remaining gaps. |
| `decisions` | Accepted/proposed/deferred/superseded decisions. |
| `readinessConnections` | Public readiness, release readiness, AI Core, Command Center, and SEIS Universe status. |
| `uxGuards` | Rules that prevent fake progress and hidden blockers. |

## Commands

Generate:

```bash
npm run automation:goal-command-center-view
```

Check:

```bash
npm run check:goal-command-center-view
```

Generate the static page:

```bash
npm run automation:goal-command-center-static
```

Check the static page:

```bash
npm run check:goal-command-center-static
```

Full Goal Tracking OS check:

```bash
npm run check:goal-tracking
```

## Current Status

The current generated view state is `blocked_by_repository_hygiene`, because
critical repository hygiene blockers remain active. This is intentional: the
view must surface blockers rather than hide them.

## Non-Goals

- This is not a full routed Command Center application.
- This is not a live GitHub integration.
- This is not release or public readiness.
- This is not LLM-generated status.
