# SEIS Demo Flow Runway

This document defines the browser-local demo runway added for the SEIS working demo.

## Artifact

- Demo file: `apps/web/seis-demo-runway.html`
- Validation script: `scripts/check-demo-flow-runway.mjs`
- Runtime mode: browser-local static HTML, CSS, and JavaScript

## Purpose

The runway turns the required SEIS presentation sequence into an interactive control surface. It is intentionally additive and does not replace the existing desktop, Linux replica, reference bank, AI Core, or product documentation.

## Demo sequence covered

1. Opening cinematic landing page
2. Command Center appears
3. User opens SEIS Desktop
4. Desktop shows apps and system status
5. User opens SEIS AI Core
6. Provider registry and model router shown
7. User opens SEIS Code
8. Browser IDE shows mock repo and AI panel
9. User opens SEIS Design
10. Design tokens and premium components shown
11. User opens SEIS Search
12. Search finds modules/docs/agents
13. User opens Cloud/SSH
14. GitHub/CI/status logs shown
15. Final Showcase summarizes SEIS ecosystem

## Interaction contract

- Timeline rows change the active presentation step.
- Dock buttons focus the corresponding SEIS app.
- Start, next, previous, reset, open, and reviewed controls all mutate browser-local state.
- Left and Right arrows move between steps.
- Home and End jump to the first and final steps.
- Active step and reviewed markers persist in `localStorage` only.

## Honesty and safety boundary

- Real: the runway page, interaction handlers, keyboard controls, local state persistence, and direct link to the Linux replica.
- Mock: AI Core, provider registry, model router, SEIS Code, SEIS Design, Search, Cloud/SSH, GitHub, CI, deployment, and agent status rows shown inside this standalone runway.
- Planned: backend-only live GitHub, cloud AI, SSH, deployment, and model-router mutation.

The runway does not execute SSH, call GitHub, deploy, call provider APIs, request credentials, store secrets, or weaken branch protection.

## Validation

Run:

```bash
node scripts/check-demo-flow-runway.mjs
```

The check verifies the artifact exists, includes the required 15-step flow, labels real/mock/planned states, exposes clickable controls, includes keyboard guidance, and preserves the local-only safety boundary.
