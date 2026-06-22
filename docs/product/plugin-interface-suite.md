# SEIS Plugin Interface Suite

## Purpose

Define the first visible interface foundation for `@seis`, `@seis-cloud`,
`@seis-code`, `@seis-design`, and `@seis-data`.

## Scope

This page covers the read-only Command Center slice added to the static web
surface. It is a local interface and roadmap view, not a live plugin runtime,
deployment console, AI provider gateway, SSH surface, or production dashboard.
It now includes an interactive 2026-2030 development program so each lane has a
year-by-year focus, interface outcome, validation gate, and H1/H2 development
cadence. The interface also surfaces coverage metrics so the five-lane,
five-year scope is visible as 25 lane-year commitments with zero live actions.

## Current Status

| Lane | Interface status | Evidence | Next safe action |
| --- | --- | --- | --- |
| `@seis` | Static lane detail | `apps/web/index.html`, `content/development/seis-plugin-interface-roadmap.json`, `npm run check:plugin-interface-roadmap` | Keep source-of-truth docs aligned. |
| `@seis-cloud` | Static dry-run lane | `docs/operations/seis-cloud-foundation.md`, `deploy/cloud-environment.json` | Add approval and rollback evidence before live cloud actions. |
| `@seis-code` | Planned MVP lane | `docs/product/seis-code-foundation.md` | Build a browser-safe editor/file slice before Monaco and terminal expansion. |
| `@seis-design` | Quality-gate lane | `docs/design-system/seis-design-foundation.md` | Add component inventory and visual QA evidence. |
| `@seis-data` | Schema/freshness lane | `docs/data/seis-data-foundation.md` | Add a schema registry for current JSON records. |

## Rules / Policy

- The interface must remain useful with zero cloud-provider keys.
- A selected lane card may show evidence and next action; it must not claim live
  integration.
- Year controls may switch the displayed development program, but they are
  planning controls, not delivery guarantees.
- H1/H2 cadence controls define the recurring build and hardening rhythm for
  every plugin lane; they do not authorize live deployment, provider calls, or
  SSH execution.
- Cloud, SSH, deployment, provider, repository-write, and destructive actions
  stay approval-gated.
- Five-year roadmap phases and lane commitments are planning horizons, not
  implementation or release claims.
- Coverage metrics must be derived from local records and must not be used as a
  fake health score.
- Every clickable item either selects a local lane/year state or opens a real
  source file path.

## Evidence Requirements

The interface can move beyond `documented-static-interface` only when the next
phase provides:

- updated source JSON
- validation command: `npm run check:plugin-interface-roadmap`
- manual/browser QA note: [../reviews/PLUGIN_INTERFACE_SUITE_QA.md](../reviews/PLUGIN_INTERFACE_SUITE_QA.md)
- screenshot or browser QA evidence
- rollback or disabled-state note for gated actions
- development-program records for all five years and all five plugin lanes
- development-cadence records for H1 and H2 routines across all five plugin
  lanes
- browser QA evidence that coverage metrics render 25 lane-year commitments and
  0 live actions

## Related Documents

- [command-center-foundation.md](command-center-foundation.md)
- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)
- [../STATUS.md](../STATUS.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)

## Next Safe Action

Keep `npm run check:plugin-interface-roadmap` passing and refresh the manual
browser QA record whenever lane tabs, year controls, mobile layout, or evidence
links change. Include H1/H2 cadence controls in the same QA pass.
