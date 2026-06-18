# SEIS Command Center

SEIS Command Center is the central operating interface for the SEIS ecosystem. Phase 1 is a dependency-free HTML/CSS/JavaScript app focused on usable local workflows before moving to React/Next.js or native SwiftUI.

## Application Architecture

- `index.html`: semantic app shell, sidebar navigation, command-center modules, dialogs, and accessible landmarks.
- `styles.css`: design tokens, responsive layout, component variants, density mode, and reduced-motion support.
- `script.js`: local state, goal creation, repository filtering, agent mode switching, command palette, settings, and dashboard rendering.
- `manifest.webmanifest` and `icon.svg`: installable app metadata and SEIS Core visual identity.

## Folder Structure

```text
apps/seis-core/
  index.html
  styles.css
  script.js
  icon.svg
  manifest.webmanifest
  README.md
  test/
    seis-core-static.test.js
```

## UI Wireframe Plan

1. Sidebar: persistent module navigation for Dashboard, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge.
2. Top navigation: global search, command palette, settings.
3. Main workspace: selected module content with clear page header and primary action.
4. Right inspector: active agent mode, next actions, and MVP specification.
5. Dialogs: command palette and settings panel.

## Design System

- Palette: black sidebar, white translucent surfaces, warm gray background, soft blue accent.
- Typography: Apple system stack, large editorial headers, compact control labels.
- Components: sidebar items, top search, dashboard cards, goal cards, repository cards, plugin cards, automation cards, security cards, status indicators, command results, settings rows.
- Accessibility: skip link, semantic landmarks, visible focus states, reduced-motion toggle, responsive mobile navigation.

## Component Structure

- App shell: sidebar, topbar, workspace grid, inspector.
- Dashboard: metrics, active goals, recent activity, repository health, architecture alerts, and recommended actions.
- Operating Model: ecosystem domains for repositories, AI agents, MCP systems, plugins, docs, roadmap, goals, automation, cloud, knowledge, and security.
- Goals: creation form, editable status actions, risk and next-action fields.
- Repositories: filter chips, health cards, documentation coverage, security posture, testing status, and dependency overview.
- Documentation: index and coverage plan.
- Agents: mode cards, capabilities, tasks, logs, outputs, AI system support, and inspector sync.
- Plugins & Extensions: plugin family health, permission posture, update gates, and activation policy.
- Automation Center: workflows, triggers, history, and execution gates.
- Security Center: risk reports, access model, permission reviews, dependency posture, and no-secret policy.
- Architecture and Knowledge: system map and knowledge registry surfaces.
- Platform Phases: Phase 1 static app, Phase 2 TypeScript/React/Next.js, and Phase 3 SwiftUI macOS/iOS.

## MVP Specification

- Create goals locally.
- Update goal status to Review or Done.
- Filter repositories by health and inspect dependency risk.
- Switch active AI agent mode and inspect capabilities, tasks, logs, and outputs.
- Inspect recent activity across builder, security, architecture, and automation lanes.
- Inspect plugin, automation, security, and AI system surfaces.
- Inspect the unified SEIS operating model across repositories, AI agents, MCP systems, plugins, automation, cloud, security, and knowledge.
- Use command palette with `Command/Ctrl + K`.
- Persist state in `localStorage`.
- Support desktop and mobile layouts.

## Implementation Roadmap

1. Phase 1: static app with local workflows and documented architecture.
2. Phase 2: TypeScript + React + Next.js, route-level modules, API contracts, authenticated repository data.
3. Phase 3: SwiftUI native macOS application with local-first SEIS workspace integration.

## Future Roadmap

- GitHub workflow and check-run integration.
- Documentation coverage scanner.
- ADR creation workflow.
- Agent handoff records.
- Plugin permission review workflow.
- Automation history storage.
- Security audit exports.
- Knowledge provenance and source citations.
- Ecosystem health automation.
- Operating model adapters for live GitHub, MCP, plugin, cloud, and knowledge graph signals.

## Run

```bash
python3 -m http.server 4174 --directory apps/seis-core
```

Open `http://127.0.0.1:4174/`.

## Validate

```bash
node --test apps/seis-core/test/*.test.js
```
