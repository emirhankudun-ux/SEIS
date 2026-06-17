# 3D Rendering Approach

## Decision

Use progressive 3D:

1. Start with dependency-free canvas and CSS depth for the first review.
2. Add Three.js only as a lazy-loaded island after asset direction and hero composition are approved.
3. Keep all core content outside the 3D scene.

## Why

- The legacy archive has strong content and asset material but no WebGL foundation.
- Jumping directly to a 3D dependency would increase mobile performance risk.
- A canvas-first scene lets the brand direction be reviewed before adding a heavier renderer.

## Future Three.js Gate

Introduce Three.js only when these are true:

- The Git branch is connected to the real repo.
- Hero visual direction is approved.
- Selected source assets are optimized.
- Reduced-motion poster fallback exists.
- Mobile frame budget has been measured.

## User Decision Slot

Choose the first approved cinematic hero direction before WebGL work starts:

- `editorial-depth`: calm typographic space, subtle planes, low battery use.
- `gallery-orbit`: curated drawing fragments in slow spatial motion.
- `studio-console`: premium system dashboard atmosphere with restrained signal motion.

