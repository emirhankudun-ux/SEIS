# Animation System Plan

## Motion Principles

- Motion must clarify hierarchy, not steal attention.
- Every animation must have a reduced-motion fallback.
- Mobile must use fewer particles, shorter transitions, and no expensive continuous blur.
- WebGL must be progressive enhancement, never the core reading path.

## System Layers

| Layer | Purpose | Default |
| --- | --- | --- |
| Intro | short loading reveal | 650 ms max, disabled in reduced motion |
| Reveal | section entrance | IntersectionObserver, once per section |
| Scroll | parallax/depth | throttled through `requestAnimationFrame` |
| Hover | depth cards | pointer-fine only |
| Touch | mobile feedback | short scale/opacity response |
| Transition | page/view changes | opacity + transform, no route-blocking animation |
| 3D | cinematic hero depth | canvas/CSS first, WebGL island later |

## 3D Approach

Start with a low-cost canvas/CSS depth field:

- capped device pixel ratio
- limited particles
- no postprocessing
- pause in hidden tabs
- static composition in reduced motion

Graduate to Three.js only when the content direction is locked:

- lazy load the scene
- use compressed textures
- keep model/poly budgets documented
- disable postprocessing on low-end/mobile
- provide poster image fallback

## Animation Budget

| Target | Budget |
| --- | --- |
| Hero intro | under 1 second perceived duration |
| Continuous animation | one active scene at a time |
| Mobile particles | 24 or fewer |
| Desktop particles | 72 or fewer |
| Blur/glass | static or transition-only on mobile |
| Scroll handler | one shared `requestAnimationFrame` loop |

