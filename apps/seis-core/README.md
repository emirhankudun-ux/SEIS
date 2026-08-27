# SEIS Command Center

SEIS Command Center is the central operating interface for the SEIS ecosystem. Phase 1 is a dependency-free HTML/CSS/JavaScript app focused on usable local workflows before moving shared contracts into native SwiftUI and other platform adapters.

## Application Architecture

- `index.html`: semantic app shell, sidebar navigation, command-center modules, dialogs, and accessible landmarks.
- `styles.css`: design tokens, responsive layout, component variants, density mode, and reduced-motion support.
- `script.js`: local state, goal creation, repository filtering, agent mode switching, generated SEIS router artifact loading, architecture evidence, automation evidence, security evidence, knowledge graph evidence, command palette, settings, and dashboard rendering.
- `full-technology.html`: registry-backed Full Technology Center with Technology Atlas, accessible Cube Navigator, Workbench Composer, engine contract inspection and evidence boundaries.
- `full-technology-center.js`: thin browser controller for the Full Technology experience.
- `full-technology-runtime.js`: deterministic, UI-independent projection validation, Cube mapping, Workbench composition, state normalization and review-snapshot logic.
- `full-technology-service-worker.js`: same-origin, GET-only offline cache boundary for the app shell and canonical Full Technology records.
- `cloud-ssh-center.html`: browser-local Cloud / SSH Center for public-safe remote readiness planning.
- `data/seis-router-routes.json`: generated Command Center router artifact produced from `scripts/ai-routing-policy.cjs#chooseAutoRoute`.
- `manifest.webmanifest` and `icon.svg`: installable app metadata, Full Technology shortcut and SEIS Core visual identity.

## Folder Structure

```text
apps/seis-core/
  index.html
  styles.css
  script.js
  full-technology.html
  full-technology-center.css
  full-technology-center.js
  full-technology-runtime.js
  full-technology-service-worker.js
  cloud-ssh-center.html
  cloud-ssh-center.css
  cloud-ssh-center.js
  icon.svg
  manifest.webmanifest
  README.md
  test/
    seis-core-static.test.js
    full-technology-center.test.js
    full-technology-experience.test.js
    full-technology-runtime.test.js
    full-technology-offline.test.js
```

## Primary Product Surfaces

### Command Center

1. Sidebar: persistent module navigation for Dashboard, God Mode, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge.
2. Top navigation: global search, command palette, and settings.
3. Main workspace: selected module content with clear page header and primary action.
4. Right inspector: active agent mode, next actions, and MVP specification.
5. Dialogs: command palette and settings panel.

### Full Technology Center

1. Technology Atlas: searchable list of 16 domains, 96 capabilities and 48 first-wave tools loaded from canonical repository records.
2. Cube Navigator: six keyboard-accessible technology faces covering every canonical domain exactly once.
3. Workbench Composer: 12 bounded source-backed presets that load tool slots without executing them.
4. Active Workbench: persistent browser-local session, contextual inspector, Escape-to-close behavior and local review export.
5. Engine Foundation: read-only inspection of Game, Reality, 3D and Digital Human capability contracts.
6. Evidence Boundary: visibly separates browser-local validation from unbuilt native engine and cross-platform runtime claims.
7. Offline boundary: same-origin GET-only service worker with network-first JSON and cache-first shell behavior.

## Design System

- Palette: deep graphite and near-black surfaces, warm-white text, restrained cyan/blue/violet/gold semantic accents.
- Typography: Apple system stack, large editorial headers, compact control labels.
- Components: sidebar/rail items, top search, lists, tables, inspectors, status indicators, dialogs, Cube faces and Workbench tool slots.
- Accessibility: skip links, semantic landmarks, visible focus states, keyboard navigation, reduced motion, responsive mobile navigation, and non-color-only status labels.
- Density: lists, tables and inspectors are preferred over a generic card-dashboard layout.

## Command Center Component Structure

- App shell: sidebar, topbar, workspace grid, inspector.
- Dashboard: metrics, operations readiness, active goals, recent activity, repository health, architecture alerts, and recommended actions.
- Cloud / SSH Center: linked from dashboard recommended actions for local-only SSH/cloud readiness planning.
- God Mode: mission composer, live route preview, SEIS AI setup matrix, router ledger, execution protocol, run timeline, guardrails, artifacts, and feature growth ledger.
- Goals: creation form, editable status actions, risk and next-action fields.
- Repositories: filter chips, health cards, documentation coverage, security posture, testing status, and dependency overview.
- Documentation: index and coverage plan.
- Agents: mode cards, capabilities, tasks, logs, outputs, AI system support, orchestration lanes, routing matrix, handoff audit, and inspector sync.
- Plugins & Extensions: plugin family health, permission posture, update gates, and activation policy.
- Automation Center: workflows, triggers, run history, approval gates, rollback evidence, and execution gates.
- Security Center: risk reports, permission reviews, dependency scans, security audits, access model, and no-secret policy.
- Architecture Center: system map, module relationships, dependency graph, technical debt register, and platform phases.
- Knowledge: knowledge graph, relationship contracts, memory evidence, decision history, reusable patterns, and knowledge registry surfaces.

## Full Technology Truth Boundary

The Full Technology Center is a validated browser-local prototype. It does not prove that SEIS has built:

- a native AAA Game Engine;
- a complete 3D authoring/rendering engine;
- a MetaHuman-equivalent Digital Human runtime;
- native macOS, Windows or Linux packages;
- signed installers or notarized artifacts;
- live provider, plugin, MCP, SSH or cloud connectivity.

The accepted and blocked capability sets are recorded in:

```text
content/development/seis-full-technology-demo-acceptance.json
```

Loading a Workbench means composing a local inspection surface. It does not activate or execute its tools.

## Implementation Roadmap

1. Browser-local foundation: canonical registries, deterministic runtime, Atlas, Cube, Workbenches, review export, accessibility and offline boundary.
2. Shared contract extraction: move deterministic rules into reusable typed packages.
3. Apple-native foundation: Swift package and native macOS inspection surface.
4. Universal Viewport and Universal Inspector contracts.
5. Bounded Digital Human inspection prototype using original SEIS assets.
6. Small measured Game/Reality scene prototype.
7. Separate macOS, Windows and Linux build evidence tracks.

## Run

Serve the directory so canonical JSON fetches and service-worker registration use an HTTP origin:

```bash
python3 -m http.server 4174 --directory apps/seis-core
```

Open:

```text
http://127.0.0.1:4174/
http://127.0.0.1:4174/full-technology.html
```

Opening through `file:` is intentionally unsupported for offline registration and canonical JSON loading.

## Validate

Run all browser-local app tests:

```bash
node --test apps/seis-core/test/*.test.js
```

Run the focused Full Technology package exactly as CI does:

```bash
node scripts/check-seis-full-technology-foundation.mjs
node --test test/seis-full-technology-foundation.test.mjs
node --test apps/seis-core/test/full-technology-runtime.test.js
node --test apps/seis-core/test/full-technology-center.test.js apps/seis-core/test/full-technology-experience.test.js
node --test apps/seis-core/test/full-technology-offline.test.js
```

Existing Command Center router validation remains:

```bash
npm run check:seis-command-center-router
```
