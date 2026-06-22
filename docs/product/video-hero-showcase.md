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
| Shared runtime | Browser-smoked | `apps/web/showcase/video-hero.js`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md` | In-app Browser interaction path timed out; fallback smoke used headless Chrome DevTools. | Make browser smoke repeatable. |
| Shared styles | Browser-smoked | `apps/web/showcase/video-hero.css`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md` | No committed screenshot artifact or performance budget. | Add viewport, reduced-motion, and performance screenshots/evidence. |
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

- browser playback and controls are tested through a repeatable command,
- mobile and desktop screenshots are committed or attached to PR evidence,
- remote media fallback behavior is verified,
- asset provenance is reviewed,
- performance and reduced-motion behavior are checked.

## Related Documents

- [plugin-interface-suite.md](plugin-interface-suite.md)
- [../design-system/seis-design-foundation.md](../design-system/seis-design-foundation.md)
- [../reviews/VIDEO_HERO_SHOWCASE_QA.md](../reviews/VIDEO_HERO_SHOWCASE_QA.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Add a browser smoke test for each page: load, pause, mute, fullscreen fallback,
CTA scroll, reduced-motion state, and mobile viewport rendering.
