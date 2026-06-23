# Product Experience Browser Smoke

Date: 2026-06-23

## Purpose

Capture repeatable browser QA evidence for the current SEIS product-experience
slice covering SEIS Desktop OS, SEIS Code, Mythic Gacha, and the shared
browser-local workspace export path.

## Scope

This review covers:

- `apps/web/seis-code.html`
- `apps/web/seis-code.js`
- `apps/web/desktop.html`
- `apps/web/desktop.css`
- `apps/web/desktop.js`
- `apps/web/mythic-gacha.html`
- `apps/web/mythic-gacha.js`
- `scripts/check-desktop-os-browser-smoke.mjs`
- `scripts/check-product-experience-browser-smoke.mjs`

It does not claim deployment, public readiness, a production desktop operating
system, live AI provider readiness, or full visual-regression coverage.

## Browser Smoke Result

| Area | Result | Evidence |
| --- | --- | --- |
| SEIS Desktop app catalog | Passed | Dedicated Chrome smoke found 66 apps, 66 launcher app buttons, 8 dock targets, and 6 desktop shortcuts. |
| SEIS Desktop windows | Passed | Dedicated Chrome smoke opened all 66 app windows and found no unopened or weak app surfaces. |
| SEIS Desktop interactivity | Passed | Dedicated Chrome smoke measured 100% responsive clickable controls in the latest run and found 43 primary workflow app surfaces. |
| SEIS Desktop terminal | Passed | Dedicated Chrome smoke wrote and read `qa/browser-smoke.txt`, entered the Local Demo `claude` command, and verified Local Demo output. |
| SEIS Desktop to SEIS Code handoff | Passed | Dedicated Chrome smoke opened SEIS Code after the desktop terminal write, found `/workspace/qa/browser-smoke.txt`, and read `browser-smoke` through the SEIS Code terminal. |
| SEIS Desktop mobile | Passed | Dedicated Chrome smoke loaded 390 x 844 mobile layout with no horizontal overflow and zero cramped targets in the latest run. |
| SEIS Code shell | Passed | Headless Chrome loaded the route, found 8 top menus, 5 activity views, 4 bottom panels, and no horizontal overflow. |
| SEIS Code editor | Passed with Monaco | Headless Chrome loaded Monaco, kept the fallback editor visually hidden, and accepted the SEIS Code editor surface as ready. |
| SEIS Code terminal | Passed | Browser terminal wrote and read `smoke.txt`, entered the Local Demo REPL, reported status, streamed a local response, and exited to Shell. |
| Provider honesty | Passed | The terminal kept `AI: Local Demo, no cloud key required` and the REPL included the non-Anthropic disclaimer. |
| Mythic Gacha draw | Passed | Single draw updated lore, rarity, history, completion, and unlocked one bestiary card. |
| Mythic Gacha export | Passed | Export saved a JSON card into `/workspace/MythicArchive`. |
| Cross-app visibility | Passed | Returning to SEIS Code, terminal commands found the exported `SHJ-*` card under `MythicArchive`. |
| Mobile viewport | Passed | SEIS Code and Mythic Gacha loaded at 390 x 844 without horizontal overflow. |

## Latest Command

```bash
npm run check:desktop-os-browser-smoke
npm run check:product-experience-browser-smoke
```

Latest observed summary:

- Browser: Google Chrome through Chrome DevTools Protocol.
- SEIS Desktop OS: 66 apps, 38 terminal commands, 66 openable app windows,
  43 primary workflow surfaces, 100% measured clickable-response coverage,
  desktop-to-SEIS-Code workspace handoff, zero cramped mobile targets,
  screenshots under `dist/qa/desktop-os-smoke/`.
- SEIS Code: Monaco ready, fallback editor hidden, terminal ready, 8 menus,
  5 activity views, 4 bottom panels.
- Mythic Gacha: 60 cards, draw result recorded, export path created.
- Cross-app: Desktop terminal output and `MythicArchive` export visible through
  SEIS Code terminal.
- Screenshots were written under ignored `dist/qa/product-experience-smoke/`.

## Known Gaps

- Screenshot artifacts are not committed as baseline assets.
- SEIS Desktop OS app workflows are browser-local foundations, not production
  replacements for native applications.
- Monaco loaded in the latest smoke run; fallback editor behavior remains a
  required degraded path but is not a committed visual-regression baseline.
- This is not a full Playwright/Cypress suite.
- Refresh-persistence is sampled through IndexedDB reuse in one browser session,
  not through a full browser restart assertion.
- The desktop-to-SEIS-Code handoff covers desktop-created `/home/seis` files;
  it is not yet a complete route-wide shared virtual file system.
- Artwork provenance and public-release asset review remain incomplete.

## Security Notes

- This smoke does not require provider API keys, SSH access, deployment
  credentials, or live AI calls.
- The Claude-style REPL evidence is Local Demo only and must not be represented
  as Anthropic output.
- SEIS Desktop OS terminal evidence is browser-local only and must not be
  represented as host OS execution.
- Exported cards stay in the browser-local SEIS Code workspace store during the
  smoke run.

## Related Documents

- [../product/seis-desktop-os.md](../product/seis-desktop-os.md)
- [../product/seis-code-foundation.md](../product/seis-code-foundation.md)
- [../product/mythic-gacha.md](../product/mythic-gacha.md)
- [../design-system/component-inventory.md](../design-system/component-inventory.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Expand these smoke checks into focused interaction cases for desktop app
keyboard navigation, source-control staging, extension toggles, ten-draw
guarantees, daily draw state, reset confirmation, and persisted state after a
browser restart.
