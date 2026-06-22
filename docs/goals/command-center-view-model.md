# Goal Command Center View Model

Generated source:

- `content/development/seis-goal-command-center-view.json`

Generated page:

- `apps/web/goal-tracking.html`

Generator:

- `scripts/create-goal-command-center-view.mjs`

## Purpose

The view model converts file-backed Goal Tracking OS records into a static
Command Center Goal Tracking Center surface without an LLM or external API.

## Source Records

- `content/development/seis-goal-tracking.json`
- `content/development/seis-goal-evidence.json`
- `content/development/seis-goal-execution.json`

## Required Panels

| Panel | Purpose |
| --- | --- |
| `progressCards` | Counts only; no fake percentages. |
| `goalList` | Goals with status, category, evidence, blockers, and next action. |
| `milestoneTimeline` | Static milestone timeline derived for the foundation scope. |
| `nextActionQueue` | Task-backed next safe actions. |
| `blockedItems` | Blockers kept visible. |
| `evidence` | Evidence records with limitations. |
| `readinessConnections` | Public/release/AI Core/Command Center/research states. |
| `decisions` | Current operating decisions and consequences. |

## Commands

Generate:

```bash
npm run automation:goal-command-center-view
```

Check:

```bash
npm run check:goal-command-center-view
npm run check:goal-tracking
```

## Non-Goals

- Not a live GitHub integration.
- Not a routed SPA module.
- Not a public-readiness or release-readiness claim.
- Not an LLM-generated status surface.
