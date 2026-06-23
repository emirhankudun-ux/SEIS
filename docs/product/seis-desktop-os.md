# SEIS Desktop OS

## Purpose

SEIS Desktop OS is the browser-based operating-system surface for the SEIS
product-experience suite. It proves that SEIS can expose a usable, no-key,
local-first desktop shell with many functional app surfaces before any live
cloud, SSH, or model-provider integration is attached.

## Scope

Current scope covers the static browser route:

- `apps/web/desktop.html`
- `apps/web/desktop.css`
- `apps/web/desktop.js`
- `scripts/check-desktop-os.mjs`
- `scripts/check-desktop-os-browser-smoke.mjs`

This is an original SEIS-branded browser desktop. It is not a real Linux
distribution, not a host OS emulator, and not a production remote-desktop
environment.

## Current Status

| Capability | Status | Evidence |
| --- | --- | --- |
| App catalog | Browser-smoked foundation | 66 app surfaces are exposed by the runtime and validated by `npm run check:desktop-os-browser-smoke`. |
| Desktop shell | Browser-smoked foundation | Top bar, dock, taskbar, launcher, command palette, desktop shortcuts, windows, and quick status are present. |
| Window system | Browser-smoked foundation | The smoke opens all 66 apps and verifies every app window appears. |
| Interactivity | Browser-smoked foundation | The smoke measured a 100% clickable-response rate across rendered buttons in the current run. |
| App workflows | Browser-smoked foundation | 43 app surfaces expose primary workflow actions; sampled workflows create or mutate browser-local state. |
| Terminal | Browser-smoked foundation | 38 browser-safe commands are available; the smoke writes and reads a virtual file. |
| SEIS Code handoff | Browser-smoked bridge | Desktop-created files under `/home/seis` are mirrored into the SEIS Code IndexedDB workspace under `/workspace`; the smoke verifies `cat qa/browser-smoke.txt` from SEIS Code. |
| Claude-style REPL | Local Demo only | `claude` enters a Local Demo REPL and does not claim Anthropic output. |
| Persistence | Browser-local foundation | Runtime uses IndexedDB where available with localStorage fallback; no provider credentials are stored. |
| Mobile shell | Browser-smoked foundation | The smoke verifies 390 x 844 mobile layout, zero horizontal overflow, and zero cramped targets in the latest run. |

## Validation Commands

```bash
npm run check:desktop-os
npm run check:desktop-os-browser-smoke
```

The browser smoke uses system Chrome through the Chrome DevTools Protocol and
writes ignored screenshots under `dist/qa/desktop-os-smoke/`.

## Non-Goals

- No host OS command execution.
- No SSH command execution.
- No provider API keys.
- No production credential storage.
- No claim that every app is production complete.
- No claim that this replaces native macOS, Linux, Windows, iOS, or Android
  implementations.

## Known Gaps

- Screenshot artifacts are generated locally and are not committed as visual
  regression baselines.
- The file system is still browser-local; the current bridge covers
  desktop-created `/home/seis` files into SEIS Code, not every product route or
  every future data store.
- App workflows are intentionally lightweight; several apps are useful
  browser-local stubs rather than full product modules.
- Keyboard navigation depth, screen-reader traversal, and app-by-app WCAG notes
  still need a dedicated accessibility pass.
- There is no release-hosted Lighthouse, bundle, or network performance report
  for this route yet.

## Next Safe Action

Keep `npm run check:desktop-os` and
`npm run check:desktop-os-browser-smoke` passing while expanding the most
important apps from browser-local foundations into deeper workflows. Prioritize
Files, Terminal, SEIS Code handoff, Settings, App Center, Tasks, Notes, and the
AI Assistant Local Demo before adding any live provider or SSH capability.
