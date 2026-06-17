# SEIS Experience Budget

SEIS keeps cinematic expression inside a calm, mobile-safe budget. The first web surface should remain explainable, dependency-light, responsive, and reversible before heavier 3D or native app layers are promoted.

## Runtime Budget

- Keep the foundation dependency-free until a real interaction requires a library.
- Prefer static modules, readable HTML, and CSS tokens over framework-specific coupling.
- Preserve the page as a portable static package for server handoff.

## Motion Budget

- Respect `prefers-reduced-motion` and the explicit low-motion toggle.
- Keep canvas density capped on mobile and moderate on desktop.
- Use scroll, reveal, hover depth, and page transitions as atmosphere, not attention capture.

## Mobile Budget

- Maintain 44px minimum touch targets for primary controls.
- Keep touch feedback direct, short, and library-free.
- Avoid GPU-heavy effects on small viewports before measuring real need.

## Release Budget

- Package every server candidate before upload.
- Record bytes and SHA-256 in the handoff manifest.
- Preserve rollback backups so server work cannot erase a known-good local package.

## Promotion Rule

Add heavier animation, WebGL, native shells, backend services, or AI orchestration only after the current static surface passes lightweight quality checks and the new layer has a rollback path.
