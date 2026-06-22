# SEIS Component Inventory

## Purpose

Track reusable interface components across the current SEIS web surfaces so
`@seis-design` has a validator-backed inventory instead of scattered CSS and
HTML evidence.

## Scope

The inventory currently covers:

- shared accessibility affordances,
- home and Command Center lane components,
- SEIS Code browser IDE components,
- Video Hero showcase components.

It is a static inventory, not a complete design-system package or visual
regression suite.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Inventory record | Validated | `content/development/seis-design-component-inventory.json` | It covers current static surfaces only. | Expand when new app surfaces land. |
| Validator | Validated | `scripts/check-design-component-inventory.mjs` | It checks selector/source evidence, not rendered screenshots. | Add browser visual QA later. |
| SEIS Code components | Validated | `npm run check:seis-code` | No Playwright interaction coverage. | Add interaction tests. |
| Video Hero components | Validated | `npm run check:video-hero-showcase` | No playback screenshot QA. | Add viewport screenshots. |

## Rules / Policy

- Every component record must name source files, selectors, accessibility notes,
  motion policy, and validation commands.
- Selectors must exist in at least one declared source file.
- Source paths must be repository-relative.
- Component inventory does not prove production readiness without browser QA.
- Reduced-motion behavior remains mandatory for animated surfaces.

## Evidence Requirements

Each component record needs:

- component id,
- surface,
- current status,
- source files,
- selectors,
- accessibility note,
- motion policy,
- validation command.

## Related Documents

- [seis-design-foundation.md](seis-design-foundation.md)
- [../product/seis-code-foundation.md](../product/seis-code-foundation.md)
- [../product/video-hero-showcase.md](../product/video-hero-showcase.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Add browser visual QA evidence for viewport fit, focus states, reduced-motion
behavior, and control response across desktop and mobile.
