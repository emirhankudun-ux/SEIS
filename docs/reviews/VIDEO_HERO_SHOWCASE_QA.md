# Video Hero Showcase QA

Date: 2026-06-22

## Purpose

Capture review evidence for the four-page cinematic Video Hero showcase and keep
the `@seis-design` workstream tied to validation, provenance, and next safe
actions.

## Scope

This review covers:

- Nature showcase route: `apps/web/showcase/nature.html`
- Still Life showcase route: `apps/web/showcase/still-life.html`
- Materials showcase route: `apps/web/showcase/materials.html`
- Metal Parts showcase route: `apps/web/showcase/metal-parts.html`
- Shared runtime: `apps/web/showcase/video-hero.js`
- Shared styles: `apps/web/showcase/video-hero.css`
- Media manifest: `apps/web/showcase/video-heroes.json`
- Route, cache, sitemap, and static package bindings.

This review does not claim deployment, release readiness, local video ownership,
or production performance readiness.

## Current Status

| Area | Status | Evidence | Remaining gap |
| --- | --- | --- | --- |
| Route count | Validated | `npm run check:video-hero-showcase` confirms exactly four themed pages. | None for static contract. |
| Runtime controls | Browser-smoked | `npm run check:video-hero-browser-smoke` verifies play/pause, mute, fullscreen, and CTA scroll behavior on the Nature page. | In-app Browser click dispatch timed out, so interaction proof uses no-install Chrome DevTools fallback. |
| Loading behavior | Browser-smoked | `npm run check:video-hero-browser-smoke` verifies each route has the expected hero, video element, metadata preload, controls, and no horizontal overflow at desktop and mobile viewports. | Network-performance measurements are not captured. |
| Reduced motion | Browser-smoked | `npm run check:video-hero-browser-smoke` verifies `prefers-reduced-motion: reduce`, paused video state, and `is-reduced-motion` hero state on Materials. | Screenshot artifacts are generated under ignored `dist/qa/video-hero-smoke`; they are not committed. |
| Provenance | Documented | `apps/web/showcase/video-heroes.json` stores Pexels source pages and direct MP4 URLs. | Asset licensing and long-term hosting should be re-reviewed before public release. |
| Static package | Built | `npm run build:static` produced `dist/seis-static.zip` and includes `dist/seis-static/showcase/*`. | `release/web` mirror only syncs `index.html`, `styles.css`, and `app.js`; it is not the route-file evidence source. |
| Release readiness | Not ready | Repository hygiene and visual/performance QA remain incomplete. | Add screenshot, mobile, and media fallback QA before release. |

## Validation Performed

| Command | Result | Notes |
| --- | --- | --- |
| `npm run check:video-hero-showcase` | Passed | Validates pages, manifest, runtime hooks, CSS theme hooks, route config, service worker cache entries, and sitemap entries. |
| `npm run build:static` | Passed | Produces `dist/seis-static.zip`; generated package contains the showcase route files. |
| `npm run check:plugin-interface-roadmap` | Passed | Confirms the broader five-lane interface roadmap and 2026-2030 horizon remain valid. |
| `git diff --check` | Passed | No whitespace errors in the current diff. |
| In-app Browser route/screenshot check | Partial | Browser loaded and screenshotted the routes, but its low-level click dispatcher timed out on control interaction. |
| `npm run check:video-hero-browser-smoke` | Passed | Starts a local static server, drives system Chrome through DevTools, verifies all four routes at 1280x720 and 390x844, captures ignored screenshots, verifies Nature play/mute/fullscreen/CTA interactions, and verifies Materials reduced-motion behavior. |

## Manual Evidence Notes

- The showcase is implemented as a no-key product surface. It does not require a
  model provider, image generator, SSH access, deployment credential, or API key.
- Remote videos are referenced at runtime to avoid committing large binaries.
- The manifest keeps source-page provenance for every media asset.
- CTA and media controls are real links/buttons with runtime handlers.
- Loading, paused, muted, playback-error, and reduced-motion states are
  represented in the page and runtime model.
- Browser smoke writes screenshots to ignored `dist/qa/video-hero-smoke`.
- Static product pages now link the shared SVG favicon and `/favicon.ico`
  fallback, and the service worker caches both assets.

## Known Gaps

- Browser screenshots are generated locally but not committed or attached to a
  PR review artifact.
- No Lighthouse, bundle-size, or media transfer budget was recorded.
- No local poster/media optimization pipeline exists yet.
- No public-release attribution review has been completed.
- No committed icon visual audit exists yet.

## Release Boundary

The showcase is ready for internal product implementation review, not public
release. Public readiness requires:

- desktop and mobile screenshots,
- reduced-motion screenshots,
- playback and autoplay fallback verification,
- performance budget evidence,
- final asset provenance review,
- static asset visual audit,
- repository hygiene recovery.

## Related Documents

- [../product/video-hero-showcase.md](../product/video-hero-showcase.md)
- [../design-system/seis-design-foundation.md](../design-system/seis-design-foundation.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Run `npm run check:video-hero-browser-smoke` before product-experience PRs and
attach the generated `dist/qa/video-hero-smoke` screenshots to PR review
evidence when visual approval is required.
