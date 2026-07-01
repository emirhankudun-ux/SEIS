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
| Component inventory | Validator-backed with browser-smoked product surfaces | `content/development/seis-design-component-inventory.json`, `scripts/check-design-component-inventory.mjs`, `npm run check:product-experience-browser-smoke`, `npm run check:video-hero-browser-smoke` | No committed visual-regression baseline. | Add focused viewport and focus-state QA. |
| Agency kit | Validator-backed with editable browser-local draft workflow, client discovery intake matrix, brand and offer naming matrix, brand strategy workshop matrix, proposal scope estimator, agency quote comparator, agency cost control matrix, design sprint timeline matrix, competitive positioning matrix, brand voice messaging matrix, typography pairing and hierarchy matrix, color system accessibility matrix, print production readiness matrix, brand rationale deck, visual reference moodboard, creative asset shot list matrix, logo concept evaluation matrix, brand usage guideline, landing page blueprint matrix, creative director QA, design review decision matrix, approval state transition ledger, revision round plan, client feedback triage board, case study layout board, visual QA evidence ledger, production file manifest, asset size spec sheet, client approval packet, client-ready export index, brand audit scorecard, launch asset matrix, social content calendar matrix, social variant set, presentation system map, visible Agency Workboards, SEIS Code handoff export, SEIS Code review surface, and cross-route browser-smoke flow | `content/development/seis-design-agency-kit.json`, `docs/design-system/seis-design-agency-kit.md`, `apps/web/website/seis-design.html`, `apps/web/website/product-page.js`, `apps/web/seis-code.html`, `apps/web/seis-code.js`, `scripts/check-seis-design-agency-kit.mjs`, `scripts/check-seis-code.mjs`, `scripts/check-seis-design-agency-kit-browser-smoke.mjs` | Current local browser-smoke run needs Chrome/Chromium, so cross-route screenshot evidence is not generated in this environment. | Run smoke with `CHROME_PATH` when available, then add focused visual QA for generated workboards and approval-state transitions. |
| Visual style | Documented with browser smoke evidence | `AGENTS.md`, strategy docs, `docs/design-system/component-inventory.md`, `docs/reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md` | Visual-regression baselines remain absent. | Attach generated screenshots before release readiness. |
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
- [seis-design-agency-kit.md](seis-design-agency-kit.md)
- [component-inventory.md](component-inventory.md)
- [../quality/responsive-performance-accessibility.md](../quality/responsive-performance-accessibility.md)
- [../quality/manual-accessibility-review.md](../quality/manual-accessibility-review.md)

## Next Safe Action

Run the cross-route Design Agency Kit browser smoke with `CHROME_PATH`
available, then add focused visual QA for the proposal scope, agency quote
comparison, client discovery intake, brand and offer naming, brand strategy workshop, agency cost control, design sprint timeline, landing page blueprint, competitive positioning, brand voice messaging, typography hierarchy, color system, print production readiness, brand rationale, brand usage, creative QA, design review decision, approval state transition, revision, client
feedback triage, visual reference moodboard, creative asset shot list, logo concept evaluation, case study layout, visual QA evidence, production manifest,
asset size spec, client approval, client-ready export, brand audit, launch asset, social content calendar, social variant,
and presentation workboards before broader product UI release work.
