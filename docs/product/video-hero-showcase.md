# Video Hero Showcase

## Purpose

Document the cinematic video hero showcase surface for `@seis-design` and the
web product lane.

## Scope

The current showcase includes four full-screen pages:

- Nature
- Still Life
- Materials
- Metal Parts

Each page uses a remote MP4 background, local CSS fallback surface, minimalist
copy, CTA controls, play/pause, mute, fullscreen, loading status, reduced-motion
handling, visibility-based pause, and next-video preload hooks.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Four showcase pages | Validated static product surface | `apps/web/showcase/*.html`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md` | No committed browser screenshot QA. | Add Playwright/browser visual QA later. |
| Media manifest | Validated | `apps/web/showcase/video-heroes.json` | Runtime video availability depends on remote host. | Add local posters or approved optimized media pipeline. |
| Shared runtime | Browser-smoked | `apps/web/showcase/video-hero.js`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md`, `npm run check:video-hero-browser-smoke` | In-app Browser interaction path timed out; fallback smoke uses headless Chrome DevTools. | Keep browser smoke passing. |
| Shared styles | Browser-smoked | `apps/web/showcase/video-hero.css`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md`, `npm run check:video-hero-browser-smoke` | No committed screenshot artifact or measured network-transfer budget. | Attach generated screenshots to PR evidence and add release-hosting performance budgets. |
| Loading budget | Validated static budget | `docs/reviews/VIDEO_HERO_PERFORMANCE_BUDGET.md`, `npm run check:video-hero-performance-budget` | No Lighthouse or CDN transfer evidence yet. | Keep static budget passing and add measured budgets after hosting selection. |
| Route/cache/sitemap | Validated | `apps/web/src/config/routes.json`, `apps/web/service-worker.js`, `apps/web/sitemap.xml` | Release mirror does not include every static route artifact. | Keep static route checks passing. |

## Rules / Policy

- Video pages must not require a model-provider key.
- Remote videos must keep source-page provenance in the manifest.
- Large video binaries must not be committed without asset review.
- Reduced-motion users must receive a calm fallback.
- Video controls must be real controls, not decorative buttons.
- Loading, autoplay-blocked, error, and paused states must be visible.

## Evidence Requirements

The showcase can move beyond static foundation only after:

- browser playback and controls are tested through `npm run check:video-hero-browser-smoke`,
- static loading/provenance budget is tested through `npm run check:video-hero-performance-budget`,
- mobile and desktop screenshots are generated and attached to PR evidence,
- remote media fallback behavior is verified,
- asset provenance is reviewed,
- performance and reduced-motion behavior are checked.

## Related Documents

- [plugin-interface-suite.md](plugin-interface-suite.md)
- [../design-system/seis-design-foundation.md](../design-system/seis-design-foundation.md)
- [../reviews/VIDEO_HERO_SHOWCASE_QA.md](../reviews/VIDEO_HERO_SHOWCASE_QA.md)
- [../reviews/VIDEO_HERO_PERFORMANCE_BUDGET.md](../reviews/VIDEO_HERO_PERFORMANCE_BUDGET.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Run `npm run check:video-hero-browser-smoke` before product-experience PRs and
attach `dist/qa/video-hero-smoke` screenshots when visual review is required.
