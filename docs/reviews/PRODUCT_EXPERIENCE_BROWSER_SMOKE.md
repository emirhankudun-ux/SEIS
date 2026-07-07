# Product Experience Browser Smoke

Date: 2026-06-24

## Purpose

Capture repeatable browser QA evidence for the current SEIS product-experience
slice covering SEIS Desktop OS, SEIS Code, SEIS Second Brain, Mythic Gacha, and
the shared browser-local workspace export path.

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
- `scripts/check-seis-second-brain-browser-smoke.mjs`
- `scripts/check-product-experience-browser-smoke.mjs`

It does not claim deployment, public readiness, a production desktop operating
system, live AI provider readiness, or full visual-regression coverage.

## Browser Smoke Result

| Area | Result | Evidence |
| --- | --- | --- |
| SEIS Desktop app catalog | Passed | Dedicated Chrome smoke found 80 apps, 80 launcher app buttons, 22 dock targets, and 10 desktop shortcuts including SEIS Demo Studio and SEIS Linux Replica. |
| SEIS Desktop boot and launcher | Passed | Dedicated Chrome smoke waited for the browser-local SEIS boot sequence to complete, verified the no-host/SSH boundary text, verified the launcher frequent-app strip, category set, and SEIS Prism Wave wallpaper catalog entry. |
| SEIS Desktop windows | Passed | Dedicated Chrome smoke opened all 80 app windows, found no unopened or weak app surfaces, verified a pointer-driven Terminal resize from 760 x 420 to 880 x 486, verified left/right snap positions with matching 628px widths, and confirmed sanitized route-reload restoration of Terminal snap, geometry, workspace, full-screen state, and session diagnostics. |
| SEIS Desktop shell context | Passed | Dedicated Chrome smoke opened the desktop canvas context menu, switched the wallpaper to SEIS Prism Wave, opened a Files context menu with rename/copy/delete actions, copied a browser-local path, dragged a file into a folder, opened the Terminal window context menu, toggled full-screen, and verified wallpaper, moved path, and full-screen state persisted after route reload. |
| SEIS Desktop OS profiles | Passed | Dedicated Chrome smoke switched through macOS, Windows, and Linux-style profiles and verified diagnostics, shell `data-os-profile`, and active pressed button state. |
| SEIS Desktop virtual workspaces | Passed | Dedicated Chrome smoke opened Notes in workspace 1, switched to workspace 2, verified Notes was hidden, opened Calculator in workspace 2, verified workspace-specific visibility in both directions, and confirmed active workspace 2 plus visible Terminal session state restored after route reload. |
| SEIS Desktop Control Center | Passed | Dedicated Chrome smoke opened the top-bar Control Center, verified the notification list, cleared notifications, toggled network to Offline and audio to Muted, recorded Notes in recents, and confirmed network/audio/notification/recent state persisted after route reload. |
| SEIS Desktop keyboard shortcuts | Passed | Dedicated Chrome smoke opened the shortcut overlay with `Ctrl/Cmd + /`, verified 12 executable shortcut rows across 3 groups, clicked a workspace shortcut row, dispatched `Ctrl/Cmd + Alt + 3` and `Ctrl/Cmd + Alt + T`, and verified shortcut state plus workspace 3 persisted after reload. |
| SEIS Desktop interactivity | Passed | Dedicated Chrome smoke measured 100% responsive clickable controls in the latest run, found 61 primary workflow app surfaces, executed all 61 primary workflows, observed 9 generated local workflow artifacts, reloaded `desktop.html`, and verified all 9 artifacts plus all 61 workflow statuses persisted. |
| SEIS Demo Studio | Passed | Dedicated Chrome smoke opened SEIS Demo Studio, selected the Builder Workflow, executed a Files step, ran the selected journey, and verified `/home/seis/Documents/seis-demo-studio-evidence.md` plus Demo Studio diagnostics. |
| SEIS Files workbench | Passed | Dedicated Chrome smoke verified Files diagnostics, search input, explicit grid/list view state, list-view switching, and query persistence through `fileManagerState()`. |
| SEIS Desktop terminal | Passed | Dedicated Chrome smoke wrote, read, moved, and removed browser-local files; it also entered the Local Demo `claude` command and verified Local Demo output. |
| SEIS Desktop demo routes | Passed | Dedicated Chrome smoke found launcher route cards, opened SEIS AI App through SEIS Search, and resolved the SEIS Code Web route from the command palette. |
| Sub-Agent OS demo | Passed | Dedicated Chrome smoke found the Sub-Agent OS Demo route, opened Sub-Agent Control, rendered Linux/macOS/Windows profile controls, verified six managed local sub-agent processes, wrote the process ledger, verified suspend/resume behavior, verified the 20-quarter compressed simulation, and verified local dry-run plus simulation artifact workflows. |
| SEIS AI Core spatial command surface | Passed | Dedicated Chrome smoke verified five AI Core version targets, six lane nodes, interactive orbit rotation, local snapshot evidence at `/home/seis/Documents/seis-ai-core-orbit-snapshot.md`, promotion preview to `v0.2-read-only-intelligence`, and five-year completion to `v1.0-public-enterprise-candidate`. |
| SEIS AI Plugin Center | Passed | Dedicated Chrome smoke opened the SEIS AI App, verified Plugin Center and Sub-Agent Plan tabs and controls, toggled a local plugin lane, and observed the generated tool-call history. |
| SEIS Installed AI Systems | Passed | Dedicated Chrome smoke verified six supervised AI/operator profiles, the Local Demo runtime profile, no-key provider language, the read-only AI Core Resource Bridge, the diagnostics API, `/home/seis/Documents/installed-ai-systems-audit.md`, and `/home/seis/Documents/seis-ai-core-resource-bridge.md` evidence. |
| SEIS Second Brain | Passed | Dedicated Chrome smoke opened the SEIS Second Brain desktop window, verified 6 vault notes, 6 graph nodes, 6 installed AI rows, 6 managed sub-agent rows, 12 autonomous-agent rows, and 5 real actions; saved snapshot, capture, graph, review, and GitHub-readiness artifacts under `/home/seis/SecondBrain`; verified reload persistence, SEIS AI Second Brain bridge rendering, mobile no-overflow, 21 mobile controls, and zero cramped mobile targets. |
| SEIS Desktop to SEIS Code handoff | Passed | Dedicated Chrome smoke opened SEIS Code after Desktop terminal operations, found created folders/files, verified moved paths, confirmed removed paths were absent, and read `browser-smoke` plus `moved-smoke` through the SEIS Code terminal. |
| SEIS Desktop mobile | Passed | Dedicated Chrome smoke loaded 390 x 844 mobile layout with 80 launcher apps, no horizontal overflow, and zero cramped targets. |
| SEIS demo 3D hero and AI Core constellation | Passed | Product smoke verified the standalone SEIS demo hero canvas is ready, animated, nonblank, exposes 32 graph nodes / 53 edges, records Rotate, Sync, Pause, and constellation Sync interactions, and surfaces six AI routes, five personal plugin lanes, 35 MCP tools, 30 MCP resources, and three MCP prompts without provider keys. |
| SEIS Code shell | Passed | Headless Chrome loaded the route, found 8 top menus, 6 activity views, 4 bottom panels, and no horizontal overflow. |
| SEIS Code interactivity | Passed | Browser smoke now measures the SEIS Code clickable-response rate against the 80% acceptance floor before and after core interactions. |
| SEIS Code editor | Passed with Monaco | Headless Chrome loaded Monaco, kept the fallback editor visually hidden, and accepted the SEIS Code editor surface as ready. |
| SEIS Code terminal | Passed | Browser terminal wrote and read `smoke.txt`, submitted `keyboard-persist.txt` through keyboard events, entered the Local Demo REPL, reported status, executed write/append/patch/diff/virtual-command tool calls, cancelled broad destructive deletion, streamed a local response, and exited to Shell. |
| SEIS Code persistence | Passed | Browser smoke reloads `seis-code.html` and verifies the terminal-created `keyboard-persist.txt` file remains in IndexedDB. |
| Provider honesty | Passed | The terminal kept `AI: Local Demo, no cloud key required` and the REPL included the non-Anthropic disclaimer. |
| Mythic Gacha draw | Passed | Single draw updated lore, rarity, history, completion, and unlocked one bestiary card. |
| Mythic Gacha export | Passed | Export saved a JSON card into `/workspace/MythicArchive`. |
| Cross-app visibility | Passed | Returning to SEIS Code, terminal commands found the exported `SHJ-*` card under `MythicArchive`. |
| Desktop shared VFS import | Passed | Product smoke opened Desktop after the Gacha export, verified the exported `SHJ-*` card under Desktop `/home/seis/MythicArchive`, and found it through Desktop terminal commands. |
| Mobile viewport | Passed | SEIS Code and Mythic Gacha loaded at 390 x 844 without horizontal overflow. |

## Latest Command

```bash
npm run check:desktop-os-browser-smoke
npm run check:seis-second-brain-browser-smoke
npm run check:product-experience-browser-smoke
```

## Combined WOW Design Check

The 2026-06-24 design pass uses the imported SEIS_WOW page packs and the
user-supplied Kimi LinuxOS / VS Code Web references as visual direction for an
original SEIS surface. Command Center now renders a dark command-home shell
with bright app tiles, right-side Local Demo/status panels, and a source
reference ribbon. System OS and WOW Gallery now expose the same combined design
language as reference-backed cards.

Visual QA screenshots were generated locally under
`dist/qa/combined-wow-design/`:

- `command-center.png`
- `system-os.png`
- `wow-gallery.png`

These screenshot artifacts are local review evidence and are not committed
visual-regression baselines.

The broader product smoke remains a required cross-app regression gate; this
latest update reran the dedicated Desktop OS Chrome smoke for the boot sequence,
launcher frequent strip, SEIS Prism Wave wallpaper, context-menu, drag/drop, and
full-screen work.

## Supplied Web Linux Code Integration

The SEIS Linux Replica route at `apps/web/seis-linux-replica.html` adapts the
user-supplied Web Linux / NebulaOS-style pasted code into an original SEIS
browser-local shell. The pasted source was incomplete and included placeholder
app comments, so it was not copied directly as a broken route. The implemented
route preserves the working product pattern: boot screen, local login, taskbar,
start menu with categories/search, draggable/minimize/maximize/close windows,
browser-local VFS, Linux-like terminal commands, TR/EN locale switching through
the shared `seis.locale.v1` key, 291 launcher targets including Website /
Ubuntu app surfaces and the contained Apple Native Shell capsule, and 67
audited browser-local functional core app workflows.
It also exposes a
connected SEIS bridge for Search, Code, Design, Cloud, Store, Website, Music,
AI Core, SEIS AI Chat, SEIS Code AI, SEIS AGI Control, SEIS SSH Control, and
Apple Native Shell without running live providers, SSH, deployment, native host
launches, or host shell actions. The Code, Design, Cloud, Store, Music, and AI
Core bridge entries render mini workspaces that execute browser-local state
changes, including local code-check output, design-token save, cloud health
refresh, store install state, music playback state, and bounded AI agent
activity labels.

The full-stack interpretation for SEIS is now explicit: the current route is
the tested frontend/client shell, while the next implementation slice must add
a server/API/data boundary for durable sessions, user projects, app install
state, AI provider routing status, audit logs, and safe agent task records. It
must not replace the zero-key Local Demo mode or store secrets in browser
storage.

Standalone Chrome smoke evidence is now repeatable through
`npm run check:seis-linux-replica-browser-smoke` and verifies:

- boot/login completion
- TR default language, EN toggle, `document.documentElement.lang`, and
  `localStorage["seis.locale.v1"]` persistence
- `window.__SEIS_LINUX_REPLICA__.appCount === 291`
- `window.__SEIS_LINUX_REPLICA__.functionalAppCount() === 67`
- terminal `neofetch` output with `Apps: 291` and `Functional Apps: 67`
- terminal `apps` output with Workbench and Playable coverage rows
- terminal `sources`, `website`, and `ubuntu` output for Website / Ubuntu lane
  coverage
- terminal `live` output opening the guided live tour
- terminal `seis` bridge output for connected SEIS surfaces
- mini SEIS Code, Design, Cloud, Store, Music, AI Core, AI Chat, Code AI, AGI,
  SSH, and Apple Native Shell surfaces
- 67/67 functional app audit pass coverage
- 35/35 enhanced workbench primary-action, snapshot, and reset coverage
- 8/8 playable game reset coverage
- visible Local Functional Audit evidence in Live Demo Console and Demo
  Readiness
- 291 launcher tiles
- Files, Terminal, Calculator, Settings, Search, and SEIS Code windows open
  together
- 10 SEIS Search scopes and connected Search/Code/Design/Cloud/Website result
  cards
- no desktop horizontal overflow
- screenshot evidence at `dist/qa/seis-linux-replica-smoke/desktop.png`

This route does not execute SSH, host shell commands, deployments, Git
operations, provider calls, or external network mutations.

Latest observed summary:

- Browser: Google Chrome through Chrome DevTools Protocol.
- SEIS Desktop OS: 80 apps, 38 terminal commands, 80 openable app windows,
  61 primary workflow surfaces, 61 executed primary workflows,
  9 generated local workflow artifacts, 9 persisted artifacts,
  61 persisted workflow statuses, 100% measured clickable-response coverage,
  validated browser-local boot sequence completion and no-host/SSH boundary copy,
  validated launcher frequent apps, category strip, route cards, SEIS Linux
  Replica, and 80 app buttons,
  validated Linux/macOS/Windows-style profile switching,
  validated virtual workspace isolation and selected-workspace reload persistence,
  validated a real window resize handle, left/right snap controls, and
  route-reload restoration of Terminal window geometry, snap state, and
  full-screen state,
  validated desktop/file/window context menus, SEIS Prism Wave wallpaper switching, file path
  copy, browser-local file drag/drop into a folder, and route-reload persistence
  for the wallpaper and moved file path,
  validated Control Center notification clearing, network/audio toggles,
  recent app rows, and reload-persistent offline/muted state,
  validated keyboard shortcut overlay opening, executable shortcut rows,
  workspace switching, Terminal launch, and reload-persistent shortcut state,
  SEIS Demo Studio guided Builder Workflow execution with local evidence export,
  Files search/grid-list view diagnostics and preview workbench,
  six managed local sub-agent processes with a process-ledger artifact,
  Installed AI Systems profile bridge, read-only AI Core Resource Bridge, and audit artifacts,
  desktop-to-SEIS-Code workspace handoff for create/move/delete operations,
  launcher route cards for SEIS AI App, Sub-Agent OS Demo, and SEIS Code Web,
  Sub-Agent Control 20-quarter local simulation, AI Plugin Center plus
  Sub-Agent Plan tabs, AI Core spatial command surface with version-target
  promotion preview and local snapshot artifact,
  Desktop import of SEIS Code/MythicArchive workspace exports,
  zero cramped mobile targets, screenshots under
  `dist/qa/desktop-os-smoke/`.
- SEIS Code: Monaco ready, fallback editor hidden, terminal ready, 8 menus,
  6 activity views, 4 bottom panels, measured clickable-response coverage above
  the 80% acceptance floor, and route-reload IndexedDB persistence for a
  terminal-created file. The Local Demo REPL also exercises executable
  browser-local tool calls for write, append, patch, diff, virtual command, and
  policy-cancelled destructive operations.
- Mythic Gacha: 60 cards, draw result recorded, export path created.
- Cross-app: Desktop terminal output and `MythicArchive` export visible through
  SEIS Code terminal. Product smoke also observed 10 Desktop route buttons and 6
  SEIS AI tabs in the shared-VFS desktop pass.
- Standalone SEIS demo: AI Core 3D hero canvas ready, animated, nonblank, 32
  graph nodes, 53 edges, three hero controls, AI Core constellation Sync,
  6 installed AI routes, 5 personal plugin lanes, 35 MCP tools,
  30 MCP resources, 3 MCP prompts, 20-quarter sub-agent run, and v0.1-to-v1.0
  local evidence export.
- Screenshots were written under ignored `dist/qa/product-experience-smoke/`.

## Known Gaps

- Screenshot artifacts are not committed as baseline assets.
- SEIS Desktop OS app workflows are browser-local foundations, not production
  replacements for native applications.
- SEIS Desktop virtual workspaces are browser-local visibility groups, not
  host-level Linux workspaces.
- SEIS Desktop resize, snap, and session-restore evidence is browser-local
  window geometry only; it is not a native host window manager.
- SEIS Desktop context menus, wallpaper changes, full-screen state, and file
  drag/drop are browser-local shell behavior, not native OS file-manager or
  compositor integration.
- User-supplied Linux clone images were used as visual references for boot
  rhythm, launcher density, and the Prism Wave wallpaper direction. Raw Kimi,
  Ubuntu/LinuxOS, browser chrome, watermark, and photographed screen content was
  not copied into product UI.
- SEIS Desktop Control Center evidence is browser-local state only; the network
  and audio controls are real app-state controls, not host network/audio
  controls.
- SEIS Desktop keyboard shortcut evidence is browser-local only; it does not
  prove native host shortcuts, global OS shortcuts, or host window-manager
  commands.
- Sub-Agent Control is a local status/plan-only demo with a compressed
  five-year simulation. It does not prove elapsed five-year autonomous
  execution, SSH/cloud execution, or GitHub mutation.
- Monaco loaded in the latest smoke run; fallback editor behavior remains a
  required degraded path but is not a committed visual-regression baseline.
- This is not a full Playwright/Cypress suite.
- Refresh-persistence is covered for the SEIS Code route through an IndexedDB
  reload assertion; full browser-restart persistence remains unclaimed.
- The desktop-to-SEIS-Code handoff covers desktop-created `/home/seis` files and
  folders, and the reverse import now covers SEIS Code/Mythic Gacha `/workspace`
  exports into Desktop. It is still browser-local and not a production storage
  or cloud-sync system.
- Artwork provenance and public-release asset review remain incomplete.

## Security Notes

- This smoke does not require provider API keys, SSH access, deployment
  credentials, or live AI calls.
- The Claude-style REPL evidence is Local Demo only and must not be represented
  as Anthropic output.
- SEIS Desktop OS terminal evidence is browser-local only and must not be
  represented as host OS execution.
- Sub-Agent Control evidence is local dry-run and local simulation handoff only
  and must not be represented as autonomous background development.
- Exported cards stay in the browser-local SEIS Code workspace store during the
  smoke run.

## Related Documents

- [../product/seis-desktop-os.md](../product/seis-desktop-os.md)
- [../product/seis-demo-status.md](../product/seis-demo-status.md)
- [../product/shared-vfs-contract.md](../product/shared-vfs-contract.md)
- [../product/seis-code-foundation.md](../product/seis-code-foundation.md)
- [../product/mythic-gacha.md](../product/mythic-gacha.md)
- [../design-system/component-inventory.md](../design-system/component-inventory.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Expand these smoke checks into focused interaction cases for desktop app
keyboard navigation, source-control staging, extension toggles, ten-draw
guarantees, daily draw state, reset confirmation, and persisted state after a
browser restart.
