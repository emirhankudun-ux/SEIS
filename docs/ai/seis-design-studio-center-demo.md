# SEIS Design Studio Center Demo

This document describes the browser-local Design Studio Center route added for
the SEIS Core demo surface.

## Demo route

Open the static route from the SEIS Core app folder:

```text
apps/seis-core/design-studio-center.html
```

The route is zero-key and browser-local. It does not require a backend service,
cloud sync, model provider key, asset upload service, export pipeline, or remote
workspace.

## What works now

- Selectable canvas layers.
- Token controls for accent color, typography scale, radius, and glass depth.
- Live prototype preview text for overview, handoff, review, and launch states.
- Component cards for reusable SEIS design system pieces.
- Browser-local snapshot saving under `seis.design.studio.center.v1`.
- Local export contract preview that writes nothing to disk.
- AI design assistant mock/safe mode with deterministic local suggestions.
- Explicit real/mock/blocked status for design-tool behavior.

## Mock vs real status

| Surface | Status | Notes |
| --- | --- | --- |
| Token controls | Real browser-local | Updates the canvas immediately. |
| Prototype states | Real browser-local | Updates copy and state labels in the page. |
| Snapshot save | Real browser-local | Persists to localStorage only. |
| Export preview | Mock/safe mode | Shows a local JSON contract preview, not a file export. |
| AI design assistant | Mock/safe mode | Static deterministic suggestions only. |
| Asset upload | Blocked | No upload, cloud sync, or network request occurs. |
| Provider call | Blocked | No model provider call or API key is used. |

## Safety contract

The demo keeps these flags false by design:

```text
providerCallStarted: false
assetUploaded: false
exportWritten: false
networkRequested: false
```

Any future live design export, asset pipeline, Figma-like sync, provider-backed
AI design assistant, or collaborative backend must move through a separate
review-gated implementation PR. Frontend code must not hold private provider,
asset, workspace, or design-service credentials.

## Validation

Focused static validation lives at:

```text
apps/seis-core/test/seis-design-studio-center-static.test.js
```

Run it with:

```bash
node --test apps/seis-core/test/seis-design-studio-center-static.test.js
```
