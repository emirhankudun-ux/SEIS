---
name: seis-design
description: Use SEIS-Design for product design, UI/UX architecture, design systems, accessibility, responsive ergonomics, calm motion, visual QA, frontend experience planning, and design-governed SEIS app surfaces. Trigger when Codex needs a full design plugin lane rather than generic visual suggestions.
---

# SEIS-Design

## Workflow

1. Read the existing product, app, or docs surface before proposing visual changes.
2. Identify the audience, core workflow, accessibility needs, and target platform.
3. Keep the first screen useful: build the product experience, not a marketing shell, unless the task explicitly asks for a landing page.
4. Reuse existing typography, spacing, tokens, components, routes, and interaction patterns before inventing new ones.
5. Design for calm, responsive, accessible, low-motion operation with clear hierarchy and strong scanability.
6. Validate changed UI with browser or platform screenshots when a runnable surface exists.
7. Document durable design decisions in SEIS docs when they affect design systems, governance, or reusable patterns.

## Design Lanes

- Product surface: app cockpit, dashboard, workflow UI, onboarding, settings, and operational screens.
- Design system: tokens, components, states, accessibility rules, motion rules, and documentation.
- Content design: labels, empty states, error states, instructions, IA, navigation, and editorial hierarchy.
- Visual production: brand assets, generated images, screenshots, social materials, and design handoff.
- UX verification: responsive layout, keyboard/touch ergonomics, color contrast, reduced motion, and text fit.

## Guardrails

- Avoid visual clutter, weak hierarchy, inaccessible contrast, hidden controls, and motion that ignores reduced-motion preferences.
- Do not create isolated design flourishes that are hard to maintain or inconsistent with the existing product language.
- Keep controls familiar and implementation-ready.
- Do not use external design or image tools unless the task benefits from them and access is available.
- Keep design decisions engineering-aware so they can be validated and maintained.

## Validation

Choose checks that match the artifact:

- Browser screenshots or Playwright checks for UI changes.
- `npm run check:motion-evidence` and `npm run check:mobile-ergonomics` when motion or responsive behavior changes.
- `npm run check:web` or `npm run seis:check` when the main SEIS web surface changes.
- Design documentation review when the output is a spec, system rule, or handoff rather than code.
