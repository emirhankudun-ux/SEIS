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
| Runtime controls | Browser-smoked | Headless Chrome DevTools smoke verified play/pause, mute, fullscreen, and CTA scroll behavior on the Nature page. | In-app Browser click dispatch timed out, so interaction proof used no-install Chrome DevTools fallback. |
| Loading behavior | Browser-smoked | Desktop and mobile smoke verified each route has the expected hero, video element, metadata preload, controls, and no horizontal overflow. | Network-performance measurements are not captured. |
| Reduced motion | Browser-smoked | Chrome media emulation verified `prefers-reduced-motion: reduce`, paused video state, and `is-reduced-motion` hero state on Materials. | No committed screenshot artifact. |
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
| Headless Chrome DevTools browser smoke | Passed | Verified all four routes at 1280x720 and 390x844, page identity, hero/video/control presence, no framework overlay text, no horizontal overflow, and temporary screenshot capture outside the repo. |
| Headless Chrome DevTools interaction smoke | Passed | Verified Nature play toggled to `Play` with paused status, mute toggled to `Mute`, fullscreen entered, and CTA scroll moved focus/scroll to `#story`. |
| Headless Chrome DevTools reduced-motion smoke | Passed | Verified Materials route under reduced-motion emulation with `reducedMotion: true`, paused video, and `is-reduced-motion` class. |

## Manual Evidence Notes

- The showcase is implemented as a no-key product surface. It does not require a
  model provider, image generator, SSH access, deployment credential, or API key.
- Remote videos are referenced at runtime to avoid committing large binaries.
- The manifest keeps source-page provenance for every media asset.
- CTA and media controls are real links/buttons with runtime handlers.
- Loading, paused, muted, playback-error, and reduced-motion states are
  represented in the page and runtime model.
- Browser smoke generated temporary screenshots outside the repository; no
  screenshot artifacts were committed.
- The only observed browser console/network issue in the smoke run was a local
  `/favicon.ico` 404, which is unrelated to the showcase route behavior but
  should be cleaned before public readiness.

## Known Gaps

- No committed visual screenshot comparison exists yet.
- No Lighthouse, bundle-size, or media transfer budget was recorded.
- No local poster/media optimization pipeline exists yet.
- No public-release attribution review has been completed.
- `/favicon.ico` still returns 404 in the local static smoke context.

## Release Boundary

The showcase is ready for internal product implementation review, not public
release. Public readiness requires:

- desktop and mobile screenshots,
- reduced-motion screenshots,
- playback and autoplay fallback verification,
- performance budget evidence,
- final asset provenance review,
- favicon/static asset cleanup,
- repository hygiene recovery.

## Related Documents

- [../product/video-hero-showcase.md](../product/video-hero-showcase.md)
- [../design-system/seis-design-foundation.md](../design-system/seis-design-foundation.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)
- [../roadmap/NEXT_PR_QUEUE.md](../roadmap/NEXT_PR_QUEUE.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Turn the no-install Chrome DevTools smoke into a repeatable lightweight command
or keep running equivalent browser QA before each product-experience PR.
