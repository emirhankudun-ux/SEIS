# Responsive, Performance, SEO, And Accessibility Strategy

## Responsive Strategy

- Build mobile first, then enhance for tablet and desktop.
- Use fixed layout constraints for toolbars, cards, and media frames to avoid layout shift.
- Avoid viewport-based font scaling; use rem sizes with media-query steps.
- Keep touch targets at least 44px.
- Use hover effects only behind `(hover: hover) and (pointer: fine)`.

## Performance Strategy

- Keep the first branch dependency-free.
- Do not import 3D libraries until the hero scene is approved.
- Use image manifests before copying assets.
- Convert selected JPEG assets to modern optimized derivatives later.
- Lazy load heavy embeds and non-critical media.
- Cap animation loops and pause them when the tab is hidden.
- Prefer transform and opacity over layout-affecting animation.

## SEO Strategy

- Preserve canonical, Open Graph, Twitter card, hreflang, sitemap, robots, manifest, and JSON-LD patterns from the legacy archive.
- Move metadata to a typed metadata layer when the production framework is selected.
- Avoid hiding primary content inside canvas/WebGL.
- Keep hero copy indexable HTML.

## Accessibility Strategy

- Keep skip links, visible focus states, semantic landmarks, and dialog roles.
- Add reduced-motion and low-motion controls.
- Avoid cursor-only affordances.
- Ensure every interactive card is keyboard reachable.
- Keep live regions short and purposeful.
- Test color contrast before production palette lock.

## Lightweight Check List

Run these before the first commit once the Git repo exists:

```bash
find . -maxdepth 4 -type f | wc -l
node --check apps/web/src/scripts/motion-system.js
```

Avoid full production builds until dependencies and framework are intentionally introduced.

