# Product Experience Browser Smoke

Date: 2026-06-22

## Purpose

Capture repeatable browser QA evidence for the current SEIS product-experience
slice covering SEIS Code, Mythic Gacha, and the shared browser-local workspace
export path.

## Scope

This review covers:

- `apps/web/seis-code.html`
- `apps/web/seis-code.js`
- `apps/web/mythic-gacha.html`
- `apps/web/mythic-gacha.js`
- `scripts/check-product-experience-browser-smoke.mjs`

It does not claim deployment, public readiness, a production desktop operating
system, live AI provider readiness, or full visual-regression coverage.

## Browser Smoke Result

| Area | Result | Evidence |
| --- | --- | --- |
| SEIS Code shell | Passed | Headless Chrome loaded the route, found 8 top menus, 5 activity views, 4 bottom panels, and no horizontal overflow. |
| SEIS Code editor | Passed with fallback | Chrome used the local fallback editor path when Monaco was not available in the smoke run. |
| SEIS Code terminal | Passed | Browser terminal wrote and read `smoke.txt`, entered the Local Demo REPL, reported status, streamed a local response, and exited to Shell. |
| Provider honesty | Passed | The terminal kept `AI: Local Demo, no cloud key required` and the REPL included the non-Anthropic disclaimer. |
| Mythic Gacha draw | Passed | Single draw updated lore, rarity, history, completion, and unlocked one bestiary card. |
| Mythic Gacha export | Passed | Export saved a JSON card into `/workspace/MythicArchive`. |
| Cross-app visibility | Passed | Returning to SEIS Code, terminal commands found the exported `SHJ-*` card under `MythicArchive`. |
| Mobile viewport | Passed | SEIS Code and Mythic Gacha loaded at 390 x 844 without horizontal overflow. |

## Latest Command

```bash
npm run check:product-experience-browser-smoke
```

Latest observed summary:

- Browser: Google Chrome through Chrome DevTools Protocol.
- SEIS Code: Monaco or fallback editor ready, terminal ready, 8 menus,
  5 activity views, 4 bottom panels.
- Mythic Gacha: 60 cards, draw result recorded, export path created.
- Cross-app: `MythicArchive` export visible through SEIS Code terminal.
- Screenshots were written under ignored `dist/qa/product-experience-smoke/`.

## Known Gaps

- Screenshot artifacts are not committed as baseline assets.
- Monaco CDN availability is not required by this smoke; fallback editor
  behavior is accepted.
- This is not a full Playwright/Cypress suite.
- Refresh-persistence is sampled through IndexedDB reuse in one browser session,
  not through a full browser restart assertion.
- Artwork provenance and public-release asset review remain incomplete.

## Security Notes

- This smoke does not require provider API keys, SSH access, deployment
  credentials, or live AI calls.
- The Claude-style REPL evidence is Local Demo only and must not be represented
  as Anthropic output.
- Exported cards stay in the browser-local SEIS Code workspace store during the
  smoke run.

## Related Documents

- [../product/seis-code-foundation.md](../product/seis-code-foundation.md)
- [../product/mythic-gacha.md](../product/mythic-gacha.md)
- [../design-system/component-inventory.md](../design-system/component-inventory.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Expand this smoke into focused interaction cases for source-control staging,
extension toggles, ten-draw guarantees, daily draw state, reset confirmation,
and persisted state after a browser restart.
