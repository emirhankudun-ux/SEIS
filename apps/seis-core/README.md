# SEIS Command Center

SEIS Command Center is the central operating interface for the SEIS ecosystem. Phase 1 is a dependency-free HTML/CSS/JavaScript app focused on usable local workflows before moving to React/Next.js or native SwiftUI.

## Application Architecture

- `index.html`: semantic app shell, sidebar navigation, command-center modules, dialogs, and accessible landmarks.
- `styles.css`: design tokens, responsive layout, component variants, density mode, and reduced-motion support.
- `ai-core-contract-fixture.js`: browser-safe projection of the shared AI Core
  and Command Center contract fixture.
- `script.js`: local state, goal creation, repository filtering, agent mode switching, command palette, settings, and dashboard rendering.
- `manifest.webmanifest` and `icon.svg`: installable app metadata and SEIS Core visual identity.

## Folder Structure

```text
apps/seis-core/
  index.html
  styles.css
  ai-core-contract-fixture.js
  script.js
  icon.svg
  manifest.webmanifest
  README.md
  test/
    seis-core-static.test.js
```

## UI Wireframe Plan

1. Sidebar: persistent module navigation for Dashboard, Goals, Repositories, Documentation, Agents, AI Core, Plugins, Automation, Security, Architecture, and Knowledge.
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
- Dashboard: metrics, active goals, repository health, architecture alerts.
- Operating Model: ecosystem domains for repositories, AI agents, MCP systems, plugins, docs, roadmap, goals, automation, cloud, knowledge, and security.
- Goals: creation form, editable status actions, risk and next-action fields.
- Repositories: filter chips, health cards, documentation coverage.
- Documentation: index and coverage plan.
- Agents: mode cards, AI system support, and inspector sync.
- AI Core: fixture-backed model routes, prompt versions, supervised agent tasks,
  approval gates, evaluation results, audit events, safety findings, roadmap
  items, AI Operating Model evidence gates, Local Retrieval adapters, Retrieval
  Result Cards, No-Content Search Transcripts, and goal evidence from the shared
  contract fixture.
- Plugins & Extensions: plugin family health, permission posture, update gates, and activation policy.
- Automation Center: workflows, triggers, history, and execution gates.
- Security Center: risk reports, access model, permission reviews, dependency posture, and no-secret policy.
- Architecture and Knowledge: system map and knowledge registry surfaces.
- Platform Phases: Phase 1 static app, Phase 2 TypeScript/React/Next.js, and Phase 3 SwiftUI macOS/iOS.

## MVP Specification

- Create goals locally.
- Update goal status to Review or Done.
- Filter repositories by health.
- Switch active AI agent mode.
- Inspect AI Core shared-contract routes, prompts, approvals, evaluations, and evidence without live provider access.
- Inspect the fixture-backed AI Operating Model panel and its goal evidence
  gates without live subagent orchestration, provider calls, GitHub mutation,
  SSH execution, deployment, training, benchmark, or model-card claims.
- Inspect local-only retrieval adapters, blocked archive guards, and no-content
  source boundaries without raw-content ingestion.
- Inspect Retrieval Result Cards and No-Content Search Transcripts from
  `local-readonly-retrieval-search-transcript.json` without live search,
  provider calls, embeddings, persistent memory writes, secret lookup, or raw
  content return.
- Filter local retrieval metadata by query text, source class, and transcript
  state. These controls work only on already-loaded fixture records and do not
  perform network requests.
- Validate those local retrieval filters with a JSDOM interaction test that
  exercises query, source-class, transcript-state, reset, and rendered
  empty-state output.
- Preserve keyboard focus order and visible focus states for the local
  retrieval filter controls without introducing live retrieval behavior.
- Preserve mobile viewport behavior for the local retrieval toolbar with a
  single-column layout and 44px touch targets.
- Preserve desktop and mobile viewport smoke contracts for the local retrieval
  toolbar in JSDOM. This validates rendered DOM, ARIA wiring, populated fixture
  panels, security boundary chips, and responsive CSS contracts without
  claiming pixel-level browser visual regression coverage.
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
- Live AI Core adapters after provider privacy, approval, and evaluation gates are implemented.
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

The app-level test suite includes Local Retrieval viewport-contract smoke
coverage for desktop and mobile rendering. Browser screenshot regression should
remain a separate review slice.

## Visual QA

Run the browser-backed Local Retrieval visual QA path with:

```bash
npm run qa:seis-core:local-retrieval:visual
```

The command starts a temporary local server, seeds browser-safe AI Core state,
captures desktop-width and mobile-width screenshots with a tall evidence
viewport, drives query/source-class/transcript-state/reset interactions in a
real browser, dumps rendered DOM, writes sanitized interaction reports, and
writes a local manifest under
`reports/tmp/seis-core-local-retrieval-visual/`. Those artifacts are
intentionally ignored by Git. The committed evidence contract lives in
`reports/evals/local-retrieval-browser-visual-qa.md`.

This visual QA path is fixture-backed only. It does not call providers, run live
retrieval, create embeddings, write memory, inspect secrets, execute SSH,
deploy, or mutate infrastructure.

Run the browser-backed AI Core panel navigation QA path with:

```bash
npm run qa:seis-core:ai-core-panels
```

Run the browser-backed panel QA and require the generated manifest/JSON
artifacts to match the committed evidence contract with:

```bash
npm run qa:seis-core:ai-core-evidence
```

The command starts a temporary local server, opens the Command Center from the
Dashboard, navigates to AI Core through sidebar navigation, the command palette,
and global search, then verifies route, prompt, agent, approval, evaluation,
evidence, and Local Retrieval sections across desktop and mobile browser
viewports. It writes ignored DOM dumps, sanitized JSON interaction reports, and
a manifest under `reports/tmp/seis-core-ai-core-panel-navigation/`. The
committed evidence contract lives in
`reports/evals/ai-core-panel-navigation-browser-qa.md`.

This panel QA path is fixture-backed only. It does not call providers, run live
retrieval, create embeddings, write memory, inspect secrets, execute SSH,
deploy, or mutate infrastructure.

Run the browser-run AI Core QA evidence drift check with:

```bash
npm run check:ai-core-browser-qa-evidence
```

The check verifies that the panel navigation report, browser QA script, fixture
evaluation report, schema, Command Center validator, README, evaluation
strategy, five-year roadmap, and five-year review all keep the same
fixture-backed browser-run AI Core QA evidence contract. It does not launch a
browser or call any provider; use `npm run qa:seis-core:ai-core-panels` for the
actual browser run.

Run the metadata-only AI Core evaluation evidence aggregate with:

```bash
npm run check:ai-core-eval-evidence
```

The aggregate runs the fixture evaluation freshness check, the browser QA
evidence drift check, and the Command Center validator. It remains read-only and
does not launch a browser.

CI should use the metadata-only gates. The browser artifact gate requires a
Chrome/Chromium-compatible binary and is documented in
`docs/evals/ai-core-browser-evidence-gates.md`.
