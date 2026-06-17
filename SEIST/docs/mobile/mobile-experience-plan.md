# Mobile Experience Plan

## Goal

Make the first SEIS mobile surface feel premium without behaving like a heavy desktop scene squeezed into a phone.

## Mobile Rules

- Hero canvas stays capped to a small particle count.
- Hover-only effects are disabled on coarse pointers.
- Touch feedback uses short transform/opacity response.
- The artwork grid collapses to one column before text becomes cramped.
- Navigation becomes horizontally scrollable before wrapping into visual noise.
- WebGL is deferred until a static poster and reduced-motion state exist.

## PWA Path

The current app includes:

- `manifest.webmanifest`
- SVG app icons
- mobile theme color
- standalone display mode

Do not add a service worker yet. Add it only when offline behavior and cache invalidation rules are clear.

## Native Wrapper Path

Use Capacitor only if the product needs native capabilities such as:

- push notifications
- camera/media import
- native sharing
- app store distribution

Until then, responsive PWA is the correct mobile-first strategy.

