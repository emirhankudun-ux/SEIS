# SEIS Demo Status

## Purpose

This document defines the current browser demo boundary for the SEIS product
experience. It separates working local demo behavior from planned platform,
provider, cloud, and production capabilities.

## Scope

The current demo is anchored on SEIS Desktop as the single browser entry point
for product exploration. From that shell, users can reach SEIS AI App, SEIS
Code, SEIS Second Brain, SEIS Demo Studio, Files, Terminal, SEIS Website product
pages, Mythic Gacha, Video Hero pages, and other browser-local app surfaces.

The five-year roadmap boundary stays explicit: Year 1 is the working local
demo; Year 5 is the full ecosystem target, not a current production-readiness
claim.

This document covers:

- `apps/web/desktop.html`
- `apps/web/desktop.css`
- `apps/web/desktop.js`
- `apps/web/website/index.html`
- `apps/web/website/product-page.js`
- `apps/web/website/product-page.css`
- `apps/web/seis-code.html`
- `apps/web/seis-code.js`
- `apps/web/seis-linux-replica.html`
- `apps/web/mythic-gacha.html`
- `apps/web/mythic-gacha.js`
- `content/development/seis-second-brain-system.json`
- `apps/seis-demo-web/index.html`
- `apps/seis-demo-web/script.js`
- `content/development/seis-sub-agent-5-year-plan.json`
- `reports/seis-sub-agent-five-year-demo-evidence.json`
- `reports/seis-sub-agent-five-year-demo-evidence.md`
- `reports/seis-sub-agent-five-year-demo-run.json`
- `reports/seis-sub-agent-five-year-demo-run.md`
- `scripts/check-desktop-os.mjs`
- `scripts/check-desktop-os-browser-smoke.mjs`
- `scripts/check-seis-second-brain.mjs`
- `scripts/check-seis-second-brain-browser-smoke.mjs`
- `scripts/check-seis-linux-replica-browser-smoke.mjs`
- `scripts/check-product-experience-browser-smoke.mjs`
- `scripts/check-seis-ultimate-demo.mjs`
- `scripts/check-sub-agent-5-year-plan.mjs`
- `scripts/create-sub-agent-five-year-demo-evidence.mjs`
- `scripts/run-sub-agent-five-year-demo.mjs`

## Current Demo Entry

SEIS Desktop is the single demo entry for the browser product slice.

The SEIS Search launcher now exposes route-level entries for:

- SEIS Desktop Demo
- SEIS Demo Studio
- SEIS AI App
- SEIS Second Brain
- SEIS Website Hub and product pages
- SEIS Code Workspace
- SEIS Code Web
- Mythic Gacha
- Video Hero Showcase

The route entries are intentionally inside the desktop launcher and command
palette so the demo keeps one operating shell instead of fragmenting into
unrelated standalone pages.

## Current Working Surfaces

| Surface | Current status | Evidence |
| --- | --- | --- |
| SEIS Desktop | Browser-smoked local foundation | `apps/web/desktop.html`, `npm run check:desktop-os`, `npm run check:desktop-os-browser-smoke` |
| SEIS Linux Replica | Standalone browser-smoked local route | `apps/web/seis-linux-replica.html`, `npm run check:seis-linux-replica-browser-smoke`; verifies boot/login, SEIS System OS top bar, quick app controls, pinned side rail, five activity cards, safe session persistence, 64 app launcher, terminal `neofetch`, terminal `seis` bridge listing, connected Search/Code/Design/Cloud/Website result cards, mini SEIS Code/Design/Cloud/Store/Music/AI workspaces with local state actions, local-only SSH/host-shell boundary, resizable/draggable windows, VFS, and screenshot evidence. |
| SEIS Demo Studio | Browser-smoked local foundation | `apps/web/desktop.js`, `apps/web/desktop.css`, `scripts/check-desktop-os.mjs`; guided journeys open OS, AI, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Agents, Plugins, and Website surfaces and save `/home/seis/Documents/seis-demo-studio-evidence.md` inside the browser-local VFS. |
| SEIS Search launcher | Browser-smoked route launcher | `apps/web/desktop.js`, `scripts/check-desktop-os.mjs`, `scripts/check-desktop-os-browser-smoke.mjs` |
| SEIS Search tabs | Validator-backed gateway tabs | `apps/web/desktop.js`, `scripts/check-seis-ultimate-demo.mjs`, `npm run check:seis-ultimate-demo` |
| SEIS AI App | Local Demo AI shell with Plugin Center tabs | `apps/web/desktop.js`, `scripts/check-desktop-os.mjs` |
| SEIS Second Brain | Browser-local knowledge OS foundation | `apps/web/desktop.js`, `apps/web/desktop.css`, `content/development/seis-second-brain-system.json`, `docs/product/seis-second-brain.md`, `scripts/check-seis-second-brain.mjs`, `scripts/check-seis-second-brain-browser-smoke.mjs`, `npm run check:seis-second-brain`, `npm run check:seis-second-brain-browser-smoke`; maps an Obsidian-style Markdown vault, all 6 current installed AI profiles, all 6 current managed sub-agent lanes, the 12-agent target roster, graph/backlink display, AI bridge, mobile-safe surface, reload-persistent VFS artifacts, and GitHub readiness exports without private vault import, provider calls, SSH, deployment, push, or merge. |
| SEIS Website | Static product hub and product pages for AI, OS, Code, Design, Search, Cloud, Store, and Agents | `apps/web/website/`, `apps/web/desktop.js`, `scripts/check-seis-website-pages.mjs`, `npm run check:seis-website-pages` |
| AI Plugin Center | Browser-local plugin lane controls | `apps/web/desktop.js`, `apps/web/desktop.css`, `scripts/check-desktop-os-browser-smoke.mjs` |
| 5-year sub-agent demo | Browser-local quarter selector, bounded lane visualization, interactive 3D SEIS AI Core map, persistent Local Demo pulse ledger, one-click five-year dry-run, exportable evidence JSON, repository-local deterministic evidence report, and terminal-runnable CLI dry-run transcript | `apps/seis-demo-web/index.html`, `apps/seis-demo-web/script.js`, `content/development/seis-sub-agent-5-year-plan.json`, `reports/seis-sub-agent-five-year-demo-evidence.json`, `reports/seis-sub-agent-five-year-demo-run.json`, `npm run demo:seis-sub-agent-five-year`, `npm run check:seis-sub-agent-five-year-demo-run`, `npm run check:seis-sub-agent-5-year-plan`, `npm run check:seis-sub-agent-five-year-demo-evidence`, `npm run check:product-experience-browser-smoke` |
| Files and Terminal | Browser-local virtual file operations | `apps/web/desktop.js`, `npm run check:desktop-os-browser-smoke` |
| SEIS Code | Browser IDE route and desktop app surface | `apps/web/seis-code.html`, `apps/web/seis-code.js`, `npm run check:seis-code` |
| Mythic Gacha export | Browser-local card export path | `apps/web/mythic-gacha.js`, `npm run check:product-experience-browser-smoke` |
| Shared VFS bridge | Desktop `/home/seis` and SEIS Code `/workspace` sync path | `apps/web/desktop.js`, `apps/web/seis-code.js`, `docs/product/shared-vfs-contract.md`, `scripts/check-product-experience-browser-smoke.mjs` |

## Current vs Planned Boundary

| Capability | Current | Planned / not claimed |
| --- | --- | --- |
| Desktop operating shell | Browser-local demo shell with responsive app windows and launcher routes | Host OS replacement, native Linux distribution, remote desktop, or privileged system control |
| Terminal | Browser-safe virtual terminal commands | Real host shell execution, SSH execution, or production remote command execution |
| Linux Replica SEIS bridge | Local route cards and mini workspaces for SEIS Search, Code, Design, Cloud, Store, Website, Music, and AI Core | Live provider routing, production cloud access, host OS command execution, SSH execution, or external mutation from the replica route |
| SEIS Website | Static product pages connected to OS routes and Local Demo status | Hosted marketing site, live analytics, live account system, paid store, or deployed production docs portal |
| AI App | Local Demo assistant, Plugin Center tabs, local tool-call history | Live model provider gateway, production provider registry, credential broker, or autonomous write runtime |
| Second Brain | Browser-local Markdown vault, installed AI/sub-agent index, graph, review gate, and GitHub readiness export | Private Obsidian vault import, Obsidian plugin sync, host filesystem note access, live provider calls, SSH, deployment, GitHub push/merge/release/Pages publication, or public-ready community launch without approval |
| 5-year sub-agent plan | Local Demo visualization of lanes, quarters, gates, selected-quarter telemetry, interactive 3D AI Core version mesh, browser-persisted pulse records, one-click recording of all 20 planned quarters, local evidence JSON export, and CLI dry-run transcript for all 20 quarters | Autonomous background agents, elapsed five-year execution, write authority, deploys, SSH execution, secret access, or GitHub merge/push authority |
| Claude command | Compatibility command name with Local Demo identity when no provider exists | Anthropic Claude output unless a backend Anthropic integration is configured and verified |
| Plugins | Browser-local capability lane enable/disable state | Production plugin marketplace, signed packages, remote installation, or unrestricted MCP tools |
| VFS | Browser-local IndexedDB/localStorage-backed file bridge between Desktop, SEIS Code, Terminal, and Mythic exports | Production storage, cloud sync, multi-user permissions, or encrypted secret storage |
| Gacha artwork and lore | Playable no-key local catalog and export flow | Runtime image generation requirement or paid gacha economy |
| Video Hero | Static showcase routes with local product validation | Deployment, CDN performance evidence, or public campaign readiness |

## Evidence Requirements

Current demo claims require local validation evidence from:

```bash
npm run check:desktop-os
npm run check:seis-second-brain
npm run check:seis-second-brain-browser-smoke
npm run check:desktop-os-browser-smoke
npm run check:seis-linux-replica-browser-smoke
npm run check:seis-code
npm run check:seis-website-pages
npm run check:seis-ultimate-demo
npm run check:seis-sub-agent-5-year-plan
npm run demo:seis-sub-agent-five-year
npm run check:seis-sub-agent-five-year-demo-run
npm run check:seis-sub-agent-five-year-demo-evidence
npm run check:mythic-gacha
npm run check:product-experience-browser-smoke
```

`npm run demo:seis-sub-agent-five-year` writes
`reports/seis-sub-agent-five-year-demo-run.json` and `.md`, a deterministic
terminal transcript for all 20 planned quarters. It explicitly records
`local-demo-only`, no elapsed five-year execution, no external mutation, no
credential access, no deployment, no SSH execution, and no GitHub write.

`npm run check:seis-sub-agent-five-year-demo-run` verifies that the CLI dry-run
artifacts are current.

`npm run check:seis-sub-agent-five-year-demo-evidence` verifies that
`reports/seis-sub-agent-five-year-demo-evidence.json` and `.md` are current
deterministic artifacts derived from the five-year plan.

`npm run check:product-experience-browser-smoke` now includes the sub-agent
five-year demo path: it serves `apps/seis-demo-web`, records one quarter,
records all 20 planned quarters through the `Dry-run 5 years` control, verifies
the `20/20` Local Demo boundary text, exports the local evidence JSON report,
checks telemetry events, validates the 3D AI Core map controls and canvas pixel
signal, and verifies reset clears the local ledger and export.

Any future claim about live AI, remote SSH, production storage, deployment,
public readiness, provider routing, or trained SEIS models must be backed by a
separate source-of-truth document and observed validation evidence.

## Related Documents

- [seis-desktop-os.md](seis-desktop-os.md)
- [seis-second-brain.md](seis-second-brain.md)
- [shared-vfs-contract.md](shared-vfs-contract.md)
- [seis-code-foundation.md](seis-code-foundation.md)
- [mythic-gacha.md](mythic-gacha.md)
- [video-hero-showcase.md](video-hero-showcase.md)
- [../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Keep the single-entry Desktop route, launcher routes, AI Plugin Center tabs,
Second Brain vault/index, shared VFS bridge, and sub-agent pulse ledger under
browser smoke coverage before adding any live model provider, private Obsidian
vault import, SSH, deployment, GitHub publication, or production plugin
capability.
