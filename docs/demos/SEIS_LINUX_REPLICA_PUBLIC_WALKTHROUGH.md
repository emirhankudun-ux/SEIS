# SEIS Linux Replica Public Walkthrough

## Purpose

This walkthrough is the public operator script for the browser-local SEIS Linux
Replica demo. It exists so a reviewer can run the demo from GitHub/local files
without needing SSH, API keys, provider accounts, deployment access, private
vaults, or host shell execution.

The walkthrough preserves the supplied ZIP/reference-bank material. It does not
replace, delete, or rewrite the source assets under `apps/web/reference-banks/`.

## Demo Entry

From the repository root:

```bash
python3 -m http.server 50951 --bind 127.0.0.1 --directory apps/web
```

Open:

```text
http://127.0.0.1:50951/seis-linux-replica.html?demo=live
```

The `?demo=live` deep link auto-enters the browser-local shell and opens the
guided live demo surface.

Reviewer landing route:

```text
http://127.0.0.1:50951/seis-linux-replica-public-demo.html
```

Use this route when a public reviewer needs a concise entry page before opening
the live shell. It summarizes the demo flow, safety boundaries, current evidence,
and supplied asset contract from inside the static `apps/web` site.

## Seven Minute Demo Script

1. Open the live deep link and wait for the SEIS boot/login sequence.
2. Confirm the shell opens with the top system bar, icon-first pinned side rail,
   taskbar, launcher, and multiple app windows.
3. Start with the `AI Chat` / `Conversation Center` activity card or the `MSG`
   action in `Live Demo Console`; it must open `SEIS AI Chat`, not the legacy
   generic chat surface.
4. Use the `Live Demo Console` step buttons to open the connected SEIS
   surfaces.
5. Open `Demo Readiness` and review the evidence gates, source coverage, local
   mode boundaries, the `Local Functional Audit`, and remaining safe actions.
6. Open `SEIS App Library` and launch at least one iframe-backed supplied module
   from each visible lane when possible: `Website / AI Platform` and
   `Ubuntu Web Desktop`.
7. Open `Terminal` and run the browser-local demo commands:

```text
live
readiness
apps
refs
sources
website
ubuntu
```

8. Open `Search`, `Code`, `Design`, `Cloud`, `Store`, `Music`, and `AI Core`
   from the dock, side rail, launcher, or Live Demo Console. `SEIS Code AI`
   remains a separate coding lane from `SEIS AI Chat`.
9. Resize or move windows on desktop. On mobile, verify the shell keeps windows
   within the viewport.
10. Close with the local-only statement: no SSH, no provider calls, no secrets,
   no deployment, and no host shell access are enabled by this route.

## What Reviewers Should See

| Surface | Expected public-demo behavior |
| --- | --- |
| Boot/login | Real browser UI, no account or network credential required |
| Live Demo Console | Real guided launcher for the connected demo surfaces |
| Demo Readiness | Real browser-local evidence board with readiness gates and the Local Functional Audit |
| Icon-first OS chrome | Real semantic app symbols in the side rail, taskbar, desktop shortcuts, and launcher; accessible names stay in `aria-label` / `title` |
| Window arrangement | Real browser-local topbar control stages crowded window sessions into a compact workspace, keeps the contained Apple Native Shell capsule visible when open, and leaves overflow apps in the taskbar |
| Icon-first app actions | Settings, To-Do, Paint, Media, System Monitor, SEIS Code AI, SEIS SSH Control, and bridge workspaces use semantic action symbols with compact codes visually hidden |
| Functional apps | 67 browser-local core app workflows with audited actions |
| Enhanced app slots | 35 manifest slots: 34 local workbenches plus 1 SEIS AI Chat compatibility alias |
| Enhanced workbenches | 34 local workbenches with primary action, VFS snapshot, and reset coverage |
| SEIS AI Chat alias | 1 legacy `chat` id resolves to the Conversation Center, not a duplicate generic chat |
| Playable games | 8 local games with action controls and reset coverage |
| SEIS App Library | Real local catalog backed by Website / AI Platform and Ubuntu Web Desktop source-bank routes |
| Terminal | Browser-local command simulation only, including `apps` for functional app coverage, `refs` for the SEIS App Library, and `sources` / `website` / `ubuntu` lane commands |
| Search | Connected local demo results and module jump surface |
| Code | SEIS-branded IDE demo surface with local/mock-safe state |
| Design | Design studio/tokens demo surface with local/mock-safe state |
| Cloud/SSH | Status concept only, no real SSH execution |
| AI Core | Provider/model-router concept only, no frontend provider keys |

## Real, Local, Mock, Disabled

Real in this route:

- boot/login interaction
- SEIS Linux-like shell
- dock, icon-first side rail, launcher, taskbar, windows, and session behavior
- semantic app symbols for OS chrome, with visible side-rail text codes hidden
  and accessible names preserved internally
- semantic window header symbols via `data-window-head-symbol`, with raw
  text-glyph window marks removed from public demo chrome
- icon-first launcher category filters via `data-category-symbol`, with category
  labels kept in accessible names instead of visible pill text
- icon-first launcher close, lock, and route controls via
  `data-start-action-symbol` and `data-start-route-symbol`
- icon-first topbar quick actions and browser-local crowded-window staging via
  `data-topbar-action-symbol`, `data-window-arrange-symbol`, and
  `windowArrangementSnapshot`, with compact action codes visually hidden
- icon-first Files, Editor, App Switcher, and Logs toolbars via
  `data-file-action-symbol`, `data-editor-action-symbol`,
  `data-task-action-symbol`, and `data-log-action-symbol`
- icon-first Settings, To-Do, Paint, Media, System Monitor, SEIS Code AI,
  SEIS SSH Control, and bridge workspace actions via
  `data-settings-action-symbol`, `data-todo-action-symbol`,
  `data-paint-action-symbol`, `data-media-action-symbol`,
  `data-monitor-action-symbol`, `data-code-ai-action-symbol`,
  `data-ssh-control-action-symbol`, and `data-bridge-action-symbol`,
  with compact action codes visually hidden
- SEIS App Library hero, tile, index, and detail actions via
  `data-reference-hero-action-symbol`, `data-reference-action-symbol`,
  `data-reference-index-symbol`, and `data-reference-detail-action-symbol`,
  with compact action codes visually hidden
- Live Demo Console
- Demo Readiness
- Local Functional Audit evidence
- 67 functional core apps
- 35 enhanced app slots: 34 workbenches with snapshots/resets plus 1 SEIS AI Chat alias
- 34 enhanced workbenches with workbench snapshots and resets
- 1 SEIS AI Chat compatibility alias for the legacy `chat` id
- 8 playable games with action and reset coverage
- SEIS App Library catalog and iframe-backed local module opening
- Apple Native Shell contained as a Linux Replica capsule with no host-native launch
- Window arrangement keeps the contained Apple Native Shell capsule staged inside Linux Replica when it is open
- Website / AI Platform reference lane for the supplied web platform ZIP
- Ubuntu Web Desktop reference lane for the supplied desktop ZIP
- browser-local terminal UI and demo command history
- desktop and mobile browser smoke evidence

Local demo or mock-safe:

- AI provider/model-router status
- Cloud/SSH health panels
- Store install state
- Music player state
- Design token save state
- Code local check output

Explicitly disabled:

- real SSH execution
- `sudo`
- host OS shell access
- deployment commands
- live provider/API-key calls from the browser
- secret storage in frontend state

## Supplied Asset Boundary

The supplied ZIP/reference-bank assets are production demo inputs. Do not delete
or overwrite them as part of public-demo polish.

Current review evidence expects:

- `67` browser-local functional core app workflows
- icon-first OS chrome with semantic SVG app symbols
- icon-first local utility, Code AI, SSH Control, and bridge workspace actions
  with visible compact text codes hidden
- `35` enhanced app slots
- `34` enhanced workbenches
- `1` SEIS AI Chat compatibility alias
- `8` playable local games
- `219` supplied ZIP modules surfaced as SEIS App Library apps
- `148` Ubuntu Web Desktop modules from `stitch_web_based_linux_desktop`
- `71` Website / AI Platform modules from `stitch_yapay_zeka_web_platformu`
- source-focused deep links:
  `seis-linux-replica.html?demo=live&source=website` and
  `seis-linux-replica.html?demo=live&source=ubuntu`
- matching Apple-native route metadata in `SeisAppLibraryContract` and
  `SeisPublicDemoLaneRoute` so Xcode can keep Website and Ubuntu lanes aligned
  with the SEIS App Library public-demo boundary
- visible `Focused lane` copy in SEIS App Library so public reviewers can see
  whether the current pass is using the Website / AI Platform or Ubuntu Web
  Desktop source lane
- a Design Board that uses the actual supplied ZIP screenshots as hidden visual
  source material for Website and Ubuntu UI/UX review
- separate SEIS AI Chat and SEIS Code AI surfaces, with SEIS AI Chat presented
  as the local Conversation Center and live AI clearly gated behind backend
  provider isolation
- SEIS AI Chat contract markers: `data-ai-conversation-core`,
  `data-ai-intent-chip`, and `data-ai-chat-open-code`
- SEIS AI Chat intent chips and dock controls use semantic icon symbols via
  `data-ai-intent-symbol` and `data-ai-dock-symbol`, while compact text codes
  remain accessible but visually hidden in the dock
- first-interaction entry points route to SEIS AI Chat: the desktop
  `data-quick-app="ai-chat"` activity card and Live Demo `MSG` action
- the legacy `chat` app id is only a compatibility alias for SEIS AI Chat, not
  a separate generic chat surface or duplicate pinned rail item
- a contained Apple Native Shell capsule that mirrors the Swift/Xcode direction
  without launching host-native apps from the browser
- Apple Native Shell capsule dock controls use semantic icon symbols via
  `data-native-dock-symbol`, while compact app codes remain accessible and
  visually hidden in the capsule dock
- About, Demo Readiness, Live Demo, and Launchpad quick action strips use
  semantic icon symbols via `data-about-action-symbol`,
  `data-readiness-action-symbol`, `data-live-action-symbol`, and
  `data-launchpad-action-symbol`, while compact action codes remain accessible
  and visually hidden
- Launchpad core app and Website / Ubuntu app cards use semantic card symbols
  via `data-launchpad-card-symbol` instead of visible text-glyph prefixes
- Files, Editor, App Switcher, and Logs use icon action strips for local actions,
  while compact action codes remain accessible and visually hidden
- Window headers use semantic app symbols via `data-window-head-symbol` instead
  of raw text-glyph marks
- Launcher category filters use semantic category symbols via
  `data-category-symbol`, while readable category names remain in `title` and
  `aria-label`
- Launcher close/lock/footer controls and SEIS App Library actions use semantic
  icons via `data-start-action-symbol`, `data-start-route-symbol`,
  `data-reference-action-symbol`, and `data-reference-index-symbol`; compact
  codes remain accessible but visually hidden
- SEIS AGI Control and SEIS SSH Control surfaces, with AGI capability and live
  SSH explicitly blocked until evidence, private config, and human approval exist
- valid route paths and valid available thumbnail paths from the `apps/web`
  static root
- SEIS placeholder previews for the `4` supplied modules without thumbnails
- visible no-key/no-SSH state-flow evidence in `Live Demo Console` and
  `Demo Readiness`

If those counts change, update the review packet with a reason and rerun the
focused smoke check.

## Focused Validation

Use these checks for this walkthrough slice:

```bash
node scripts/check-seis-linux-replica-public-walkthrough.mjs
node scripts/check-seis-static-demo-routes.mjs
npm run check:seis-reference-banks
node scripts/check-seis-linux-replica-browser-smoke.mjs --static
npm run check:seis-linux-replica-browser-smoke
```

The browser smoke check starts a local server and headless browser. It may
require local execution permissions that simple syntax checks do not require.
Use `--static` when Chrome/Chromium is unavailable but the route contract,
reference-bank counts, Website / AI Platform lane, Ubuntu Web Desktop lane, and
no-key/no-SSH source checks still need to be verified.

## Public Demo Acceptance Criteria

- The live deep link opens the browser-local shell.
- Live Demo Console is visible.
- Demo Readiness is visible.
- Local Functional Audit evidence is visible in the live console/readiness
  surfaces.
- SEIS App Library opens local supplied modules.
- SEIS App Library can focus Website / AI Platform or Ubuntu Web Desktop lanes
  from the public route buttons or `?demo=live&source=website` /
  `?demo=live&source=ubuntu`.
- The focused lane strip stays visible after a source deep link, lane button,
  or live demo tour opens SEIS App Library.
- The Design Board stays populated from the same supplied screenshots,
  not placeholder marketing art.
- SEIS AI Chat and SEIS Code AI remain separate surfaces.
- SEIS AGI Control and SEIS SSH Control show backend/evidence/approval gates
  instead of fake live AI, AGI, or SSH claims.
- Terminal responds to `live`, `readiness`, `apps`, `refs`, `sources`,
  `website`, and `ubuntu`.
- Landing and SEIS OS product CTAs route to `seis-linux-replica.html?demo=live`.
- Mobile smoke evidence shows no horizontal overflow.
- The demo states local/mock/disabled boundaries clearly.
- No real credentials, provider calls, SSH commands, or deployment actions are
  required.

## PR Notes

Suggested PR title:

```text
docs(seis): add Linux replica public walkthrough
```

Suggested PR scope:

- public walkthrough document
- narrow walkthrough validation script
- README and live-demo review packet links

Rollback is safe by reverting this walkthrough document, the walkthrough check,
and the README/review packet link updates. Do not remove `apps/web/reference-banks/`.
