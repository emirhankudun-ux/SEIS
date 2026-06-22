# Video Hero Performance Budget

Date: 2026-06-22

## Purpose

Define the repeatable loading, provenance, and local-artifact budget for the
four-page Video Hero showcase.

## Scope

This budget covers the static showcase pages, shared runtime, shared styles,
and media manifest under `apps/web/showcase/`.

It does not claim live CDN performance, Lighthouse scores, public-release asset
approval, or local ownership of the remote video files.

## Current Status

| Area | Status | Evidence | Remaining gap |
| --- | --- | --- | --- |
| Remote video storage | Validated | `npm run check:video-hero-performance-budget` confirms no committed video binaries under `apps/web`. | Public release still needs final media-license and hosting review. |
| Metadata-first loading | Validated | The budget check confirms each page keeps `preload="metadata"` and does not rely on raw `autoplay`. | No measured network transfer budget yet. |
| Intent-based preload | Validated | The budget check confirms each page preloads only the next theme video through `data-next-video` intent hooks. | No CDN cache header evidence yet. |
| Reduced motion and fallback | Validated | The budget check confirms reduced-motion CSS/JS markers and CSS fallback surfaces. | No committed reduced-motion screenshot evidence. |
| Accessibility floor | Validated | The budget check confirms 320px minimum layout, 44px targets, focus-visible styling, and no negative letter spacing. | Full keyboard visual QA remains separate. |

## Budget Rules

- Do not commit `.mp4`, `.webm`, `.mov`, or `.m4v` files under `apps/web`
  without asset review.
- Keep video URLs remote and record source-page provenance in
  `apps/web/showcase/video-heroes.json`.
- Use `preload="metadata"` for hero videos.
- Do not rely on a raw `autoplay` attribute; runtime playback must handle
  autoplay-blocked state truthfully.
- Preload the next video only on intent through pointer, focus, or touch.
- Pause or hide motion for reduced-motion users.
- Preserve CSS fallback surfaces for loading, error, and reduced-motion states.
- Keep touch targets at least 44px and avoid negative letter spacing.

## Validation Performed

| Command | Result | Notes |
| --- | --- | --- |
| `npm run check:video-hero-performance-budget` | Passed | Static loading/provenance/artifact budget passed. |
| `npm run check:video-hero-browser-smoke` | Passed | Chrome DevTools smoke verified desktop/mobile routes, controls, fullscreen, CTA scroll, reduced-motion state, and ignored screenshot generation. |

## Validation Not Performed

- Lighthouse performance audit.
- Media transfer-size budget.
- CDN header review.
- Public-release asset/legal review.
- Committed visual regression baseline.

## Related Documents

- [VIDEO_HERO_SHOWCASE_QA.md](VIDEO_HERO_SHOWCASE_QA.md)
- [../product/video-hero-showcase.md](../product/video-hero-showcase.md)
- [../testing/lightweight-checks.md](../testing/lightweight-checks.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Keep `npm run check:video-hero-performance-budget` in the product-experience
validation set and add Lighthouse/media-transfer evidence only after release
hosting is selected.
