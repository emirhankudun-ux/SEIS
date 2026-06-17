# Framework Decision Record

SEIS stays on the current static HTML, CSS, and JavaScript surface until a framework migration has measurable maintainability value.

## Current Decision

Status: deferred.

The current static-plus-modules surface is still the lowest-risk fit for the active portfolio, governance, locale, release, and server handoff work. Next.js, Astro, or another framework should be selected only when the static surface starts creating clear maintenance cost.

## Candidate Fit

| Candidate | Fit | Risk |
| --- | --- | --- |
| Next.js | Application routes, server components, API surfaces, and richer product workflows. | Dependency growth and heavier local development loops. |
| Astro | Content-heavy editorial surfaces, static-first delivery, and island-based interactivity. | Migration work may not pay off until content volume grows. |
| Static plus modules | Current low-power portfolio, governance, locale, and release surface. | Manual route maintenance can grow if case studies multiply. |

## Acceptance Criteria

A framework migration can be proposed when:

- Case study count or route complexity exceeds static maintenance comfort.
- Content loading needs shared templates instead of hand-edited HTML.
- 3D or cinematic surfaces need isolated progressive enhancement boundaries.
- Server-side API needs become confirmed rather than speculative.
- Accessibility, reduced motion, and release rollback contracts remain intact.

## Dependency Budget

Default: no new runtime framework dependency.

Written approval is required before adding a framework runtime, 3D rendering engine, animation timeline engine, CMS SDK, or server runtime adapter.

## Rollback Path

- Keep portable JSON content registries as the source of truth.
- Preserve the static build and server package scripts until replacement checks pass.
- Ship framework migration on an isolated branch before merging into the protected branch.
