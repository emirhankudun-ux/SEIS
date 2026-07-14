# SEIS Command Center

SEIS Command Center is the central operating interface for the SEIS ecosystem. Phase 1 is a dependency-free HTML/CSS/JavaScript app focused on usable local workflows before moving to React/Next.js or native SwiftUI.

## Application Architecture

- `index.html`: semantic app shell, sidebar navigation, command-center modules, dialogs, and accessible landmarks.
- `styles.css`: design tokens, responsive layout, component variants, density mode, and reduced-motion support.
- `script.js`: local state, goal creation, repository filtering, agent mode switching, generated 10-lane SEIS router artifact loading, source-backed AI Core runtime snapshot loading, architecture evidence, automation evidence, security evidence, knowledge graph evidence, command palette, settings, and dashboard rendering.
- `data/seis-router-routes.json`: generated Command Center router artifact produced from `scripts/ai-routing-policy.cjs#chooseAutoRoute`.
- `data/seis-core-ecosystem-registry.json`: generated schema v2 projection of SEIS, Cloud, Code, Design, Data, Store, repository plugin/skill sources, provider/MCP inventory, local routes, and fail-closed runtime boundaries.
- `data/seis-ai-core-runtime-snapshot.json`: deterministic bridge from the provider registry, executable read-only router, public 9-lane/13-agent registry, unified SEIS-Agent plugin audit, five personal lanes, and local MCP smoke contract into SEIS Core and the typed Swift consumer. Its plugin MCP mesh also records one allowlisted local status probe per bundled server, with no credentials, network, live session, or mutation; the runtime panel renders each verified probe as redacted status metadata.
- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIPersonalLaneRuntime.swift`: typed Swift Local Demo plan runtime for `seis`, `seis-cloud`, `seis-code`, `seis-design`, and `seis-data`; it exposes declared lane tools and quality gates without invoking MCP, providers, SSH, deployment, or GitHub mutation. Plan input is allow-listed to the tracked AI Core runtime snapshot and is returned as auditable plan provenance.
- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIExecutionEvidenceLedger.swift`: bounded, in-memory, metadata-only evidence ledger for agent plans, personal-lane plans, and provider execution results. It records no prompt, purpose, raw output, secret, or private-content text.
- `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Views/SeisAICoreLocalDemoView.swift`: Apple-native Local Demo controls for all five personal lanes and all 13 managed agents; every action is status-and-plan-only and refreshes the redacted evidence ledger.
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
  data/
    seis-ai-core-runtime-snapshot.json
    seis-core-ecosystem-registry.json
    seis-router-routes.json
  test/
    seis-core-runtime.test.js
    seis-core-static.test.js
```

## Ecosystem Capability Snapshot

`packages/seis-ai/src/model/ecosystem-capability-snapshot.mjs` builds the browser artifact from canonical identities, capability, plugin, provider, MCP, agent, design, data, SSH, and Desktop sources. `npm run automation:seis-core-ecosystem-registry` regenerates it; `npm run check:seis-core-ecosystem-registry` fails when the tracked artifact drifts.

The current projection contains six Core lanes, six bundled plugin sources, 25 repository skills, seven providers, MCP coverage of 37 tools / 30 resources / three prompts, six local plugin MCP entrypoints, 18 product modules, 18 data contracts, 12 design components, and 13 managed agent roles. The 185 installed-enabled plugin value is a dated source audit, while the 300 helper-plugin value is only a catalogued universe. Neither value means every plugin is authenticated, active for the current task, or permitted to mutate an external system.

Lane selection is browser-local and opens a source-evidence detail view. Routes lead to verified local surfaces, including allow-listed Desktop app deep links. Every lane and MCP record remains execution-disabled; no provider calls, credentials, frontend secrets, live MCP sessions, background agents, SSH, deployment, package installation, private-content reads, or GitHub mutation occur from this panel.

## UI Wireframe Plan

1. Sidebar: persistent module navigation for Dashboard, God Mode, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge.
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
- Dashboard: metrics, operations readiness, active goals, recent activity, repository health, architecture alerts, and recommended actions.
- God Mode: mission composer, live route preview, SEIS AI setup matrix, source-backed AI Core Runtime Snapshot, 10-lane router ledger, execution protocol, run timeline, guardrails, artifacts, and feature growth ledger for controlled custom AI development.
- Operating Model: ecosystem domains for repositories, AI agents, MCP systems, plugins, docs, roadmap, goals, automation, cloud, knowledge, and security.
- Goals: creation form, editable status actions, risk and next-action fields.
- Repositories: filter chips, health cards, documentation coverage, security posture, testing status, and dependency overview.
- Documentation: index and coverage plan.
- Agents: mode cards, capabilities, tasks, logs, outputs, AI system support, orchestration lanes, 10-lane routing matrix, public 9-lane/13-agent managed registry, handoff audit, and inspector sync.
- Plugins & Extensions: Ecosystem Control Plane for SEIS, Cloud, Code, Design, Data, and Store; plus plugin family health, permission posture, update gates, and activation policy.
- Automation Center: workflows, triggers, run history, approval gates, rollback evidence, and execution gates.
- Security Center: risk reports, permission reviews, dependency scans, security audits, access model, and no-secret policy.
- Architecture Center: system map, module relationships, dependency graph, technical debt register, and platform phases.
- Knowledge: knowledge graph, relationship contracts, memory evidence, decision history, reusable patterns, and knowledge registry surfaces.
- Platform Phases: Phase 1 static app, Phase 2 TypeScript/React/Next.js, and Phase 3 SwiftUI macOS/iOS.

## MVP Specification

- Create goals locally.
- Compose God Mode missions and route them through Plan, Build, Review, and Validate lanes.
- Inspect the 10-lane SEIS router output as `tool`, `seisLane`, and `defaultGate` before handoff.
- Preview the active mission route while typing, using the generated `chooseAutoRoute` policy/model artifact.
- Persist `tool`, `laneId`, `defaultGate`, and `routeSource` on each God Mode run timeline entry.
- Regenerate the router ledger with `npm run automation:seis-command-center-router` when CLI routing policy changes.
- Inspect SEIS AI setup for permission policy, memory ranking, agent routing, and local draft model work.
- Inspect all seven provider profiles as `Available`, `Missing Key`, or `Disabled` without reading credentials or starting provider traffic.
- Switch among seven source-generated read-only route scenarios covering all five personal SEIS lanes plus private-vault and frontier-model blocks.
- Copy the selected decision handoff with provider, model, lane, gate, opaque decision trace, and blocked reasons; route execution remains false. The trace is correlation metadata, not integrity or authenticity proof.
- Inspect the unified plugin/MCP mesh as 185 installed-enabled audit records, 300 helper plugins, five embedded personal lanes, 37 MCP tools, 30 resources, and three prompts.
- Inspect and select all 13 public managed agents across nine SEIS lanes while execution authority, background runners, private content, provider calls, SSH, deployment, and GitHub mutation remain disabled.
- See the same provider state, selected provider/model, eligibility, fallback, and no-execution boundary in the live Mission Composer route preview and each new run record.
- Recover safely to Dashboard when an older browser session contains an unknown view, agent, lane, goal list, or run list.
- Use each view-specific primary action without being redirected to the unrelated Goals form.
- Inspect feature growth coverage across Dashboard, Goals, Repositories, Docs, Agents, Security, AI Policy, Rollback, Validation, and Handoff before any completion claim.
- Inspect Operations Readiness across release, CI, security, rollback, and handoff evidence before treating work as shippable.
- Update goal status to Review or Done.
- Filter repositories by health and inspect dependency risk.
- Switch active AI agent mode and inspect capabilities, tasks, logs, and outputs.
- Inspect multi-model orchestration across OpenAI, Claude, Gemini, Qwen, local models, and future AI systems.
- Review handoff audit records between Architect, Builder, Security, Research, and Design lanes.
- Inspect recent activity across builder, security, architecture, and automation lanes.
- Inspect plugin, automation run history, approval gate, rollback evidence, security operations, and AI system surfaces.
- Inspect permission reviews, dependency scans, and security audit evidence.
- Inspect architecture dependency graph, module contracts, and technical debt register.
- Inspect knowledge graph nodes, memory freshness, decision history, and reusable implementation patterns.
- Inspect the unified SEIS operating model across repositories, AI agents, MCP systems, plugins, automation, cloud, security, and knowledge.
- Select and persist each source-backed Ecosystem Control Plane lane, inspect its capabilities, skills, MCP inventory, quality gates, and source evidence, open its verified browser-local route, and copy the primary gate without activating remote tools.
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
- Automation history storage with approval gates and rollback evidence.
- Security audit exports.
- Knowledge graph adapters, memory provenance, source citations, and staleness scoring.
- Ecosystem health automation.
- Operations readiness adapters for GitHub checks, security gates, rollback manifests, and handoff evidence.
- Operating model adapters for live GitHub, MCP, plugin, cloud, and knowledge graph signals.

## Run

```bash
python3 -m http.server 4174 --directory apps
```

Open `http://127.0.0.1:4174/seis-core/`. Serving the shared `apps` root keeps the
source-backed routes to SEIS Desktop, Cloud, Code, Design, Data, and Store live.

## Validate

```bash
node --test apps/seis-core/test/*.test.js
node --test packages/seis-ai/test/ecosystem-capability-snapshot.test.mjs
npm run check:seis-core-ai-runtime-snapshot
npm run check:seis-command-center-router
npm run check:seis-core-ecosystem-registry
swift test --package-path packages/seis_platform_swift
```
