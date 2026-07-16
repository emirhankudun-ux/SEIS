# SEIS Store + Music Center Demo

This document describes the browser-local Store + Music Center route added for
the SEIS Core demo surface.

## Demo route

Open the static route from the SEIS Core app folder:

```text
apps/seis-core/store-music-center.html
```

The route is zero-key and browser-local. It does not require a backend service,
payment provider, license server, marketplace account, streaming service, audio
backend, model provider key, or remote system.

## What works now

- Catalog categories for apps, plugins, AI agents, themes, developer tools, and
  design tools.
- Search and package selection.
- Install, update, enable, and disable state for demo packages.
- Browser-local persistence under `seis.store.music.center.v1`.
- Music playlists, track queue, previous/play-pause/next controls, progress,
  and waveform animation.
- AI recommendations presented as mock/safe mode metadata.
- Explicit real/mock/blocked status for commerce and media behavior.

## Mock vs real status

| Surface | Status | Notes |
| --- | --- | --- |
| Store filters and selection | Real browser-local | Runs in static HTML/CSS/JS. |
| Install/update/enable state | Real browser-local | Stored in localStorage only. |
| Catalog inventory | Mock | Realistic SEIS metadata, not live marketplace inventory. |
| Music controls | Real browser-local UI | Changes play state and progress simulation. |
| Music playback | Mock | No audio file, no audio device, and no stream is used. |
| AI recommendations | Mock/safe mode | Static recommendation metadata only. |
| Payments and licensing | Blocked | No checkout, payment, or license issuance occurs. |
| Network requests | Blocked | No remote catalog, telemetry, download, or stream request is made. |

## Safety contract

The demo keeps these flags false by design:

```text
paymentExecuted: false
licenseIssued: false
streamingStarted: false
networkRequested: false
```

Any future live marketplace, plugin install runtime, license system, or music
streaming implementation must move through a separate review-gated backend PR.
Frontend code must not hold private marketplace, provider, payment, license, or
media-service credentials.

## Validation

Focused static validation lives at:

```text
apps/seis-core/test/seis-store-music-center-static.test.js
```

Run it with:

```bash
node --test apps/seis-core/test/seis-store-music-center-static.test.js
```
