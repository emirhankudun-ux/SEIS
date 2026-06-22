# Long Development Roadmap

This roadmap turns SEIS development into a long-running modular process. It does not start with a heavy framework migration or dependency expansion. It starts by making each phase visible, reversible, and easy to verify.

## Operating Shape

- Work in small, explainable slices.
- Keep the public experience and governance documents aligned.
- Preserve reduced-motion behavior and accessibility expectations in every phase.
- Keep live publishing separate from local development until GitHub authentication and branch state are confirmed.
- Prefer static validation before heavy builds.

## Phases

| Phase | Status | Intent | Proof |
| --- | --- | --- | --- |
| Foundation hardening | Active | Keep the static shell, development process, and quality gates coherent. | `npm run check:foundation` and roadmap checks pass. |
| Experience expansion | Queued | Make the lab surface richer without increasing cognitive load. | Mobile, desktop, and reduced-motion views stay readable. |
| Content intelligence | Queued | Give artworks, case studies, and lab operations stronger metadata. | Content registries validate before framework migration. |
| Operations and server readiness | Blocked on input | Prepare live upload after server target and GitHub auth are confirmed. | `UIXAppTTR` is the only remote branch and target values are explicit. |
| Framework decision | Deferred | Choose Next.js, Astro, or another framework only when static constraints justify it. | Decision record proves maintainability gain and rollback path. |
| Release system maturity | Deferred | Make package, backup, upload, and recovery flows repeatable. | Release can be checked, restored, and explained from docs. |

## Current Long-Run Actions

| ID | Owner | Status | Action |
| --- | --- | --- | --- |
| `long-001` | Experience | Started | Build the roadmap surface into the static app. |
| `long-002` | Quality | Started | Create a manual accessibility review checklist. |
| `long-003` | Content | Route proposed | Model case study detail pages before choosing a framework. |
| `long-004` | Operations | Blocked on auth | Resolve GitHub auth and remote branch cleanup outside runtime changes. |

## Development Rhythm

1. Start with the narrowest target surface.
2. Add or update the registry first when the work changes system behavior.
3. Reflect durable decisions in docs.
4. Expose user-facing state only when it clarifies the product.
5. Run syntax and focused checks.
6. Stop before remote actions when auth or branch state is missing.

## What Stays Deferred

- Framework migration.
- Heavy animation systems.
- Backend services.
- Broad automated browser loops.
- New dependencies without a written decision record.

## Long-Horizon Alignment

- This roadmap remains the 3-6-12 month execution line.
- Strategic continuity is captured in `roadmap/seis-long-horizon-strategy.md`.
- If this roadmap reaches a steady state but long-term risks (security drift, AI policy erosion, onboarding fatigue) increase, pause feature expansion and execute the Strategy Recovery Loop:
  1. Freeze scope for two weeks.
  2. Fix governance and documentation drift first.
  3. Reopen one module with a measurable gate proof.
