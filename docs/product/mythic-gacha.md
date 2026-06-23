# Mythic Gacha

## Purpose

Document the current Shan Hai Jing inspired Mythic Gacha product surface for the
web lane.

## Scope

The current route is a playable static browser foundation at
`apps/web/mythic-gacha.html`. It includes:

- single draw,
- ten draw,
- daily free draw,
- fictional jade currency,
- duplicate conversion,
- Rare-or-better ten-draw guarantee,
- Legendary pity cap at 80 draws,
- persistent IndexedDB progress,
- bestiary grid,
- search and rarity/element/state filters,
- favorites,
- detail dialog,
- local JSON card export into the SEIS Code workspace,
- reduced-motion support,
- local atlas artwork.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Game route | Playable static foundation with browser smoke | `apps/web/mythic-gacha.html`, `apps/web/mythic-gacha.js`, `apps/web/mythic-gacha.css`, `npm run check:product-experience-browser-smoke` | No committed visual-regression baseline yet. | Keep browser smoke passing and attach generated screenshots when review requires them. |
| Creature records | Implemented as local runtime data | 60 `SHJ-*` creature records in `apps/web/mythic-gacha.js` | Lore/art provenance needs product review before public release. | Move creature records to a JSON manifest after review. |
| Artwork | Local atlas-backed | `apps/web/public/media/mythic/shan-hai-creature-atlas.png` | Atlas is reused through deterministic crops, not 60 separately reviewed production images. | Add per-card artwork provenance or approved generated asset set. |
| Persistence | Browser-local plus SEIS Code workspace export | IndexedDB state in `apps/web/mythic-gacha.js`, `/workspace/MythicArchive` export bridge, `npm run check:mythic-gacha`, `npm run check:product-experience-browser-smoke` | No full shared desktop VFS integration yet. | Keep export visibility covered in SEIS Code and Terminal smoke. |
| Validation | Static validator plus browser smoke | `npm run check:mythic-gacha`, `npm run check:product-experience-browser-smoke` | Refresh-persistence and reset coverage still need dedicated review. | Add interaction tests for ten draw, daily draw, reset, reduced-motion mode, and refresh persistence. |

## Rules / Policy

- Runtime play must not require an image-generation provider key.
- Local Demo or generated art labels must not imply live provider output.
- No real-money purchase path is allowed in this foundation.
- Every visible control must respond.
- Reduced-motion behavior must remain available.
- Public release requires asset provenance and license review.

## Evidence Requirements

The route can move beyond playable static foundation only after:

- mobile and desktop browser QA through `npm run check:product-experience-browser-smoke`,
- refresh-persistence QA,
- artwork provenance review,
- accessibility review,
- performance review,
- export visibility in SEIS Code and Terminal smoke.

## Related Documents

- [video-hero-showcase.md](video-hero-showcase.md)
- [seis-code-foundation.md](seis-code-foundation.md)
- [../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md)
- [../design-system/seis-design-foundation.md](../design-system/seis-design-foundation.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Extend the browser smoke beyond one draw to cover ten draw, daily draw, reset,
reduced-motion mode, and persistence after refresh.
