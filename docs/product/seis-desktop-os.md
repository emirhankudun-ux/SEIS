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
- `apps/web/seis-linux-replica.html`
- `scripts/check-desktop-os.mjs`
- `scripts/check-desktop-os-browser-smoke.mjs`
- `scripts/check-seis-linux-replica-browser-smoke.mjs`

This is an original SEIS-branded browser desktop. It is not a real Linux
distribution, not a host OS emulator, and not a production remote-desktop
environment.

## Current Status

| Capability | Status | Evidence |
| --- | --- | --- |
| App catalog | Browser-smoked foundation | 81 app surfaces are exposed by the runtime. The V17 Command Center, SEIS Demo Studio, SEIS Linux Replica, and SEIS Second Brain additions are validated by `npm run check:desktop-os`, `npm run check:seis-second-brain`, `npm run check:desktop-os-browser-smoke`, `npm run check:seis-linux-replica-browser-smoke`, and `npm run check:product-experience-browser-smoke`; the broader catalog remains covered by the dedicated Desktop Chrome smoke. |
| Desktop shell | Browser-smoked foundation | Browser-local boot sequence, clean Linux-profile first desktop, top bar, dock, taskbar, launcher, command palette, desktop shortcuts, windows, a persisted Control Center, and a keyboard-shortcut overlay are present. |
| Linux/macOS/Windows profiles | Browser-smoked foundation | The shell exposes Linux, macOS, and Windows-style profile controls; jsdom and Chrome smoke verify the active profile updates the diagnostics API, shell state, and pressed control state. |
| Window system | Browser-smoked foundation | The smoke opens all 81 apps and verifies every app window appears. Windows support drag, minimize, maximize, full-screen, close, left/right snapping, a browser-smoked resize handle, and sanitized route-reload session restoration for window geometry, workspace, z-index, snap state, and full-screen state. |
| Shell context menus | Browser-smoked foundation | Right-click context menus now exist for the desktop canvas, app windows, dock/desktop app targets, and file cards. The smoke opens desktop, file, and window menus and verifies real actions rather than decorative menu items. |
| Wallpaper manager | Browser-smoked foundation | Five SEIS-branded wallpapers are available from Settings and the desktop context menu, including SEIS Prism Wave inspired by the supplied LinuxOS reference screenshots. The smoke switches to Prism Wave and verifies the shell dataset plus persisted wallpaper diagnostics after route reload. |
| Launcher | Browser-smoked foundation | The launcher now includes a Kimi/LinuxOS-reference-inspired search-first layout, frequently used app strip, category navigation, 81 app buttons, Demo Studio shortcut access, SEIS Linux Replica access, SEIS Second Brain access, and preserved route cards below the app grid. The smoke verifies frequent apps, categories, route buttons, and app launch controls. |
| Virtual workspaces | Browser-smoked foundation | Workspace controls are action-wired; Chrome smoke opens Notes in workspace 1, Calculator in workspace 2, verifies inactive-workspace windows are hidden, and confirms active workspace 2 plus visible Terminal session state restore after route reload. |
| Control Center | Browser-smoked foundation | The top-bar status button opens a real Control Center with persisted notifications, network and audio toggles, theme access, clipboard preview, recent app/file rows, clear/dismiss actions, and reload-persistent offline/muted state. |
| Keyboard shortcuts | Browser-smoked foundation | The top-bar shortcut button and `Ctrl/Cmd + /` open a real overlay with 12 executable shortcut rows across 3 groups; smoke verifies overlay-row execution, `Ctrl/Cmd + Alt + 3` workspace switching, `Ctrl/Cmd + Alt + T` Terminal launch, and reload-persistent shortcut state. |
| Interactivity | Browser-smoked foundation | The smoke measured a 100% clickable-response rate across rendered buttons in the current run. |
| App workflows | Browser-smoked foundation | 61 app surfaces expose primary workflow actions; the latest Chrome smoke executed all 61, observed 9 generated local workflow artifacts, reloaded `desktop.html`, and verified all 9 artifacts plus all 61 workflow statuses persisted. |
| SEIS Demo Studio | Browser-smoked foundation | Demo Studio adds guided Executive, Builder, AI Core/Agent, and Cloud/Security journeys with executable per-step actions, a full journey runner, readiness checklist, status legends, and `/home/seis/Documents/seis-demo-studio-evidence.md` browser-local evidence. It opens connected OS, AI, Search, Code, Design, Cloud, Store, Music, Files, Terminal, Agents, Plugins, and Website surfaces without live provider, SSH, deploy, push, or merge claims. |
| Files workbench | Browser-smoked foundation | Files now includes search, grid/list view switching, metadata/content preview, recent files, manual SEIS Code workspace sync, and diagnostics through `fileManagerState()` while keeping the VFS browser-local. |
| Files drag/drop | Browser-smoked foundation | File cards are draggable and folders are drop targets in the browser-local VFS. The smoke creates a source file and folder, opens the file context menu, copies the path, drags the file into the folder, and verifies the moved path persists after route reload. |
| Managed sub-agent processes | Browser-smoked foundation | Sub-Agent Control, System Monitor, and Task Manager expose six bounded local sub-agent processes with pulse, suspend, resume, next-cycle execution, `/home/seis/Documents/sub-agent-process-ledger.md`, and `/home/seis/Documents/sub-agent-cycle-report.md` evidence. |
| Terminal | Browser-smoked foundation | 38 browser-safe commands are available; the smoke writes and reads a virtual file. |
| Single demo entry | Browser-smoked foundation | SEIS Desktop is the current single browser demo shell, with launcher and command-palette routes to SEIS AI App, Sub-Agent OS Demo, SEIS Code Workspace, SEIS Code Web, Mythic Gacha, and Video Hero Showcase. |
| SEIS Linux Replica | Standalone browser-smoked route | `apps/web/seis-linux-replica.html` adapts the supplied OS/Linux shell references into a SEIS-branded local-only route with boot, login, SEIS System OS top bar, quick app controls, pinned side rail, five live activity cards, dock/taskbar, launcher, resizable/draggable windows, VFS, terminal, safe session persistence, 64 app launch targets, connected Search/Code/Design/Cloud/Store/Website/Music/AI Core bridge cards, and mini Code/Design/Cloud/Store/Music/AI workspaces with browser-local actions. `npm run check:seis-linux-replica-browser-smoke` verifies the route through Chrome/CDP and writes ignored screenshot evidence under `dist/qa/seis-linux-replica-smoke/`. |
| SEIS Command Center | Browser-local V17 operating center | The Command Center route opens a first-class desktop app that maps Desktop OS, AI Core, model scaling, Search, Code, Design, Cloud, Store, Music, Launchpad, Files, Terminal, Website, Agents, Plugins, and Command Center status. It labels working, Local Demo, mock-safe, and planned/gated states, renders the 10-row Master Objective Coverage matrix, creates `/home/seis/Documents/seis-v17-command-center-snapshot.md`, exports `/home/seis/Documents/seis-20b-local-preflight.md` as a dry-run 20B / 16GB+ checklist, and keeps the 20B / 16GB+ plus future 70B and 150B frontier model-scaling lanes explicitly evidence-gated. |
| SEIS Second Brain | Local Demo knowledge OS | The Second Brain app opens from Desktop shortcuts, System OS, SEIS Search, SEIS AI, Command Center, Favorites, and Launchpad. It renders an Obsidian-style browser-local Markdown vault, graph nodes/backlinks, installed AI and sub-agent lane duties, capture/link/review actions, `/home/seis/SecondBrain/seis-second-brain-vault-snapshot.md`, `graph-links.json`, `second-brain-review-gate.md`, and a human-review-required GitHub readiness export without private vault import, provider calls, SSH, deployment, push, or merge. |
| SEIS Search routes | Browser-smoked foundation | The launcher exposes route cards for the primary demo surfaces, the command palette resolves the SEIS Code Web route, and the SEIS Search app now exposes actionable AI, Web, Code, Design, Cloud, Apps, Plugins, and Files result tabs. |
| Code IDE cockpit | Validator-backed foundation | The dedicated Code IDE app now exposes Explorer, Search, Source Control Safe Mock, Preview, AI Code Assistant Local Demo, Extensions, command chips, command history, and a status bar. `npm run check:desktop-os` opens the IDE, clicks source-control, assistant, search, and preview panels, and verifies diagnostics without executing Git writes, SSH, provider calls, push, merge, or deployment. |
| AI Plugin Center | Browser-local foundation | The SEIS AI App includes tabs for Overview, Installed AI, Plugin Center, Sub-Agent Plan, Second Brain, Tool Calls, and History, with persisted plugin lane enable/disable state. |
| Installed AI Systems | Browser-smoked foundation | The SEIS AI App exposes six supervised AI/operator profiles, truthfully marks Local Demo and missing/disabled external providers, shows the read-only AI Core Resource Bridge, and saves `/home/seis/Documents/installed-ai-systems-audit.md` plus `/home/seis/Documents/seis-ai-core-resource-bridge.md` without storing provider credentials. |
| Sub-Agent Control | Browser-smoked foundation | The Sub-Agent OS Demo route opens a first-class desktop app with Linux/macOS/Windows profile controls, six managed sub-agent process rows, five-year lane cards, safety gates, a 20-quarter compressed simulation timeline, a next-cycle runner that saves `/home/seis/Documents/sub-agent-cycle-report.md`, a local dry-run workflow that saves `/home/seis/Documents/sub-agent-control-dry-run.md`, a process ledger at `/home/seis/Documents/sub-agent-process-ledger.md`, and a simulation artifact at `/home/seis/Documents/sub-agent-five-year-simulation.md`. |
| AI Core spatial command surface | Browser-smoked foundation | Sub-Agent Control now links the five-year simulation to five SEIS AI Core version targets, six managed lane nodes, interactive orbit rotation, promotion preview, and `/home/seis/Documents/seis-ai-core-orbit-snapshot.md` evidence. This is a no-dependency CSS 3D-style planning surface, not WebGL, not a live provider call, and not model promotion. |
| SEIS Code handoff | Browser-smoked bridge | Desktop-created files and folders under `/home/seis` are mirrored into the SEIS Code IndexedDB workspace under `/workspace`; the smoke verifies create, move/rename, delete, and `cat` visibility from SEIS Code. |
| Shared VFS import | Browser-smoked bridge | SEIS Code and Mythic Gacha exports under `/workspace` are imported back into Desktop under `/home/seis`, including exported `MythicArchive` cards. |
| Claude-style REPL | Local Demo only | `claude` enters a Local Demo REPL and does not claim Anthropic output. |
| Persistence | Browser-local foundation | Runtime uses localStorage plus IndexedDB for browser-local state, including sanitized session-window snapshots, wallpaper selection, and browser-local VFS moves; no provider credentials are stored. |
| Mobile shell | Browser-smoked foundation | The smoke verifies 390 x 844 mobile layout, zero horizontal overflow, 81 launcher apps, and zero cramped targets. |

## Supplied Visual References

The user supplied `/Users/emirhankudun/Downloads/Öğelerle Yeni Klasör/`,
`/Users/emirhankudun/Downloads/Öğelerle Yeni Klasör 3/`,
`/Users/emirhankudun/Downloads/Öğelerle Yeni Klasör 4/`, and
`/Users/emirhankudun/Downloads/SEIS Wow/SEIS_WOW_MORE_PAGES_PART7/` as OS and
SEIS WOW reference material. The implementation used these files as design
direction for boot rhythm, clean first desktop composition, side navigation,
activity cards, app switching, bottom dock, launcher density, and connected
Code/Design/Cloud/Store/Search surfaces. Raw screenshots, browser chrome, Kimi
UI, Ubuntu/LinuxOS names, watermarks, and photographed screen glare were not
copied into product UI.

## Validation Commands

```bash
npm run check:desktop-os
npm run check:seis-second-brain
npm run check:desktop-os-browser-smoke
npm run check:seis-linux-replica-browser-smoke
npm run check:seis-ultimate-demo
npm run check:product-experience-browser-smoke
```

The browser smoke uses system Chrome through the Chrome DevTools Protocol and
writes ignored screenshots under `dist/qa/desktop-os-smoke/`.

## Non-Goals

- No host OS command execution.
- No SSH command execution.
- No provider API keys.
- No production credential storage.
- No claim that every app is production complete.
- No claim that Linux Replica bridge cards execute live providers, SSH, deploys,
  host shell commands, or production cloud actions.
- No claim that the five-year sub-agent simulation is elapsed real-world
  autonomous development.
- No claim that this replaces native macOS, Linux, Windows, iOS, or Android
  implementations.

## Known Gaps

- Screenshot artifacts are generated locally and are not committed as visual
  regression baselines.
- The file system is still browser-local; the current bridge covers
  desktop-created `/home/seis` files and folders into SEIS Code, plus current
  SEIS Code/Mythic Gacha `/workspace` exports back into Desktop. It is not a
  production storage, permissions, or cloud-sync layer.
- App workflows are intentionally lightweight; several apps are useful
  browser-local stubs rather than full product modules.
- Virtual workspaces are browser-local window groups. They isolate visible
  windows and persist the selected workspace, but do not claim host-level
  Linux workspace integration.
- Control Center notifications, network/audio state, clipboard preview, and
  recents are browser-local state. They do not prove host network status,
  host audio status, or native notification-center integration.
- Keyboard shortcuts are browser-local handlers. They do not execute host OS
  shortcuts or native window-manager commands.
- Window geometry and session restoration are browser-local. The latest smoke
  verifies pointer-driven resizing, left/right snapping, and route-reload
  restoration for an open Terminal window, including full-screen state, but this is not a host
  window-manager integration.
- Sub-Agent Control compresses the five-year objective into a deterministic
  browser-local demo timeline and records the active OS-style profile in local
  artifacts. The managed process monitor, Installed AI Systems profile bridge,
  and AI Core Resource Bridge are also browser-local and do not run background
  agents, connect external providers, or mutate infrastructure. The AI Core
  spatial command surface is CSS transform-based because this route has no
  committed Three.js/WebGL dependency.
- SEIS Command Center is a browser-local review cockpit. Its 20B local preflight
  export is a dry-run checklist, not a memory benchmark. It does not prove live
  provider routing, live SSH, deployment, trained SEIS model weights, 20B/70B/150B
  inference, 16GB+ compatibility, or production Command Center readiness.
- SEIS Second Brain is a browser-local Markdown knowledge OS. It does not import
  private Obsidian vaults, install Obsidian plugins, read host filesystem notes,
  call providers, execute SSH, deploy, push, merge, or publish to GitHub without
  explicit human approval.
- Code IDE Source Control is safe/mock and AI Code Assistant is Local Demo. The
  IDE does not execute Git writes, SSH, provider calls, push, merge, deployment,
  or live AI routing from the browser.
- Keyboard navigation depth, screen-reader traversal, and app-by-app WCAG notes
  still need a dedicated accessibility pass.
- There is no release-hosted Lighthouse, bundle, or network performance report
  for this route yet.

## Next Safe Action

Keep `npm run check:desktop-os` and
`npm run check:desktop-os-browser-smoke` passing while expanding the most
important apps from browser-local foundations into deeper workflows. Prioritize
Files, Terminal, SEIS Code handoff, Settings, App Center, Tasks, Notes, and the
AI Assistant/Sub-Agent Control Local Demo before adding any live provider,
background automation, or SSH capability.

## Related Documents

- [seis-demo-status.md](seis-demo-status.md)
- [shared-vfs-contract.md](shared-vfs-contract.md)
- [../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md)
