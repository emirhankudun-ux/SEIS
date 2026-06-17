---
name: seis-design
description: Use SEIS Design for product design, UI/UX architecture, design systems, interaction design, accessibility, motion, visual QA, frontend experience planning, Figma/Canva handoff, and design-governed web or app surfaces inside SEIS. Trigger when Codex needs to shape, audit, implement, or document a user-facing SEIS experience while preserving calm technology, accessibility, responsiveness, and premium design quality.
---

# SEIS Design

## Overview

Use this skill as the SEIS product-design and design-system lane. It turns visual or UX requests into maintainable product surfaces rather than decorative one-off screens.

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
- Keep controls familiar: icons for common tool actions, toggles for binary settings, sliders or inputs for numeric settings, and menus for option sets.
- Do not use external design or image tools unless the task benefits from them and the required access is actually available.
- Keep design decisions implementation-aware so engineering can validate and maintain them.

## Helper Routing

Use helper plugins only when they directly support the design task:

- Build Web Apps and Browser for runnable frontend implementation and screenshot QA.
- Figma, Canva, Product Design, Creative Production, and Adobe tools for design artifacts or visual exploration.
- Chrome when the task depends on the user's existing browser state.
- Wix, Base44, Hostinger, Replit, and Lovable only for scoped builder or prototype surfaces.

## Validation

Choose checks that match the artifact:

- Browser screenshots or Playwright checks for UI changes.
- `npm run check:motion-evidence` and `npm run check:mobile-ergonomics` when motion or responsive behavior changes.
- `npm run check:web` or `npm run seis:check` when the main SEIS web surface changes.
- Design documentation review when the output is a spec, system rule, or handoff rather than code.
