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
| SEIS Code components | Browser-smoked foundation | `npm run check:seis-code`, `npm run check:product-experience-browser-smoke` | No committed visual-regression baseline or Playwright suite yet. | Keep browser smoke passing and add focused interaction cases. |
| Video Hero components | Browser-smoked foundation | `npm run check:video-hero-showcase`, `npm run check:video-hero-browser-smoke`, `npm run check:video-hero-performance-budget` | No committed visual-regression baseline or measured hosted transfer budget. | Attach generated viewport screenshots and add hosted media-transfer evidence. |

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

Expand browser QA evidence for viewport fit, focus states, reduced-motion
behavior, control response, and committed visual-regression baselines across
desktop and mobile.
