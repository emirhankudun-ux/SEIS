# SEIS Design Studio Browser-Local Demo

`apps/web/seis-design-studio.html` is a standalone SEIS Design Studio demo for the public OS runway.

## What works

- Browser-local design canvas with selectable layers and tool states.
- Design token panel for accent colors and type scale state.
- Component cards for SEIS UI primitives.
- Prototype preview mode, local draft save, mock handoff export, and safe mock AI critique interactions.
- `localStorage` persistence under `seis.design.studio.v1`.
- Responsive layout, visible focus states, and `prefers-reduced-motion` support.

## Honest state model

- `local-demo`: canvas, token state, mode switching, and local draft persistence.
- `mock`: AI design assistant critique and handoff output.
- `planned`: cloud export and collaborative design sync.
- `disabled`: external assets, uploads, provider calls, and real file writes.

## Security boundary

The demo does not upload assets, call AI providers, fetch remote resources, execute shell commands, write design files, or read credentials. Live design collaboration and AI generation must be backend-isolated, permissioned, and clearly separated from Local Demo mode.

## Validation

Run the focused validator:

```bash
node scripts/check-seis-design-studio-demo.mjs
```

The validator checks required canvas, token, prototype, export, AI assistant, localStorage, state-label, accessibility, documentation, and no-network/no-execution markers.
