# SEIS Design System

Status: active direction; implementation remains incremental

## Visual Language

SEIS uses a premium, calm, cinematic, structured visual language with deep
black, graphite, charcoal, warm gray, off-white, restrained cyan and violet,
small amber accents, green for healthy states, and red for critical warnings.

## Tokens

Color, typography, spacing, radius, elevation, icon, motion, and state values
must be reusable tokens. Platform-specific adaptations consume shared semantic
meaning rather than copying one surface pixel-for-pixel.

## Iconography

Interfaces are icon-first, not textless. Icons are semantic and functional.
Icon-only controls require an accessible name, visible focus, keyboard support
where applicable, and a tooltip when meaning is not obvious.

## Motion

Motion communicates navigation, hierarchy, state, progress, and command
feedback. Respect reduced motion. Cinematic quality must not increase startup
cost, interaction latency, or cognitive load.

## Accessibility

Contrast, dynamic text, readable hierarchy, focus, semantic roles, touch
targets, keyboard paths, and non-color state cues are part of design review.
See `docs/ACCESSIBILITY.md` for the release gate.
