# SEIS Design Foundation

## Purpose

Define `@seis-design` as the design-system and experience-quality lane for
SEIS. Design is treated as product infrastructure, not decoration.

## Scope

The foundation includes:

- design tokens
- typography and spacing rules
- motion and reduced-motion policy
- component quality gates
- accessibility criteria
- visual QA evidence
- creative asset provenance

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Design tokens | Scaffolded | `packages/design-tokens/seis.tokens.css` | No token validation command found. | Add token inventory and usage checks. |
| Component inventory | Validator-backed | `content/development/seis-design-component-inventory.json`, `scripts/check-design-component-inventory.mjs` | No browser visual regression coverage. | Add viewport and focus-state QA. |
| Visual style | Documented | `AGENTS.md`, strategy docs, `docs/design-system/component-inventory.md` | Visual QA remains manual. | Add browser screenshots before release readiness. |
| Motion policy | Documented | `AGENTS.md`, motion checks | Coverage is partial. | Keep reduced-motion mandatory. |
| Asset registry | Scaffolded | `packages/asset-registry` | License/provenance review incomplete. | Add asset intake policy and attribution review. |

## Rules / Policy

- Calm, premium, accessible UI is the default.
- No fake clickable controls.
- No excessive animation or mobile GPU-heavy effects.
- Every media asset needs provenance or an approved source record.
- Reduced-motion mode is required for animated surfaces.
- Text must remain legible and responsive.

## Evidence Requirements

Design work needs:

- token record
- component inventory
- accessibility note
- reduced-motion behavior
- visual QA record
- source/provenance note for media

## Related Documents

- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)
- [component-inventory.md](component-inventory.md)
- [../quality/responsive-performance-accessibility.md](../quality/responsive-performance-accessibility.md)
- [../quality/manual-accessibility-review.md](../quality/manual-accessibility-review.md)

## Next Safe Action

Add browser visual QA evidence for the current component inventory before
broader product UI work.
