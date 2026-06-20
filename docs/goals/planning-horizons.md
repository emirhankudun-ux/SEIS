# SEIS Goal Planning Horizons

Date: 2026-06-20

This document defines the non-LLM planning horizons for SEIS Goal Tracking OS.
It connects yearly goals, quarterly goals, monthly goals, weekly priorities, and
active projects without claiming completion ahead of evidence.

The structured planning horizon registry is
[`../../content/development/seis-goal-planning-horizons.json`](../../content/development/seis-goal-planning-horizons.json).

## Horizons

| Horizon | Record | Status | Purpose |
| --- | --- | --- | --- |
| Yearly | `SEIS-HORIZON-001` | active | Track the 2026 foundation year across repository recovery, Goal Tracking OS, Command Center, and governance. |
| Quarterly | `SEIS-HORIZON-002` | active | Track the current foundation recovery quarter and repository hygiene blockers. |
| Monthly | `SEIS-HORIZON-003` | active | Track the June 2026 monthly foundation review lane with evidence-backed readiness blockers. |
| Weekly | `SEIS-HORIZON-004` | active | Track the 2026-W25 weekly priorities lane with evidence-backed readiness blockers. |

## Active Projects

| Project | Status | Next safe action |
| --- | --- | --- |
| `SEIS-PROJECT-001` Repository hygiene recovery | blocked | Restore, replace, or explicitly approve removal of missing governance files in a dedicated hygiene PR. |
| `SEIS-PROJECT-002` Goal Tracking OS structured foundation | active | Keep structured records validated and limitation-aware while repository hygiene is recovered. |
| `SEIS-PROJECT-003` Command Center Goal Tracking surface | planned | Wire the generated static page into a broader Command Center shell after repository hygiene blockers are isolated. |

## Rules

- Yearly and quarterly horizons can be active only when they describe current
  strategic lanes and keep blockers visible.
- Monthly and weekly horizons can become active only when a real review record
  exists for the actual period.
- Active projects must link to goal ids, task ids, evidence ids, and horizon
  ids.
- Do not mark a horizon or project completed without evidence.
- Do not use horizon records to hide repository hygiene blockers.

## Validation

Run:

```bash
npm run check:goal-tracking
```

The validator checks required horizon records, active projects, cross-reference
ids, safe text, relative paths, and evidence-backed completion rules.
