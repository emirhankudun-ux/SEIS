# SEIS WOW Extended Pages

This package contains high-impact visual references and matching HTML pages for a SEIS OS-style demo.

## Contents

- `png/` — 18 high-resolution PNG visual references.
- `html/` — 18 editable HTML pages.
- `assets/css/seis.css` — shared visual system.
- `assets/js/seis.js` — small interaction layer.
- `index.html` — gallery index.
- `CODEX_IMPLEMENTATION_PROMPT.md` — instructions for Codex.

## Pages

- `01_boot_screen` — Boot Screen: AI Core initialization and cinematic startup.
- `02_login_screen` — Login Screen: Glass login card, guest session and power controls.
- `03_desktop_overview` — Desktop Overview: Unified desktop with Files, Browser, Terminal and SEIS Code.
- `04_launchpad_all_apps` — Launchpad / All Apps: Searchable application grid with categories.
- `05_settings_appearance` — System Settings: Appearance, colors, wallpapers and UI scaling.
- `06_file_manager` — File Manager: Projects, SEIS Drive and virtual folders.
- `07_terminal_ssh` — Terminal / SSH Center: Local demo terminal and Claude-style REPL entry.
- `08_seis_code_workspace` — SEIS Code Workspace: IDE, Git client, terminal, API tester and JSON tool.
- `09_seis_ai_core` — SEIS AI Core: Agent runtime, AI chat and goal progress.
- `10_seis_search` — SEIS Search: Search across AI, code, docs, files, cloud and web.
- `11_seis_design_studio` — SEIS Design Studio: Canvas, components, design tokens and checks.
- `12_seis_cloud` — SEIS Cloud: Infrastructure, deployment, sync and SSH status.
- `13_seis_store` — SEIS Store: Apps, plugins, agents, themes and install states.
- `14_seis_music` — SEIS Music: Player, playlists and focus audio experience.
- `15_seis_agents` — SEIS Agents: Autonomous agent cards and active mission.
- `16_workflow_automation` — Workflow Automation: Plan → Build → Validate → Ship workflow.
- `17_command_center` — Command Center: Central dashboard and system status.
- `18_website_landing` — Website Landing: Premium product landing page.

## How to preview

Open `index.html` in a browser.

For a local server:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/index.html
```

## Design direction

SEIS should feel like a unified AI-native creative operating system, not a generic Linux clone or static dashboard.

Core visual style:

- premium dark UI
- purple neon accent
- orange/magenta cinematic wave wallpaper
- glassmorphism panels
- real app-window hierarchy
- launchpad + dock + left activities bar
- SEIS AI, Code, Search, Design and Cloud as first-class apps
