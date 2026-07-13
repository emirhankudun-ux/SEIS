# SEIS Command Center Architecture

SEIS Command Center is the local-first operating surface for the SEIS ecosystem. It consolidates dashboard status, God Mode missions, goals, repositories, documentation, agents, plugins, automation, security, architecture, and knowledge signals into one inspectable web application.

## Folder Structure

- `apps/seis-core/index.html` defines the static shell and module navigation.
- `apps/seis-core/styles.css` owns the command surface layout, tokens, and responsive behavior.
- `apps/seis-core/script.js` owns local data, rendering, command execution states, and browser persistence.
- `apps/seis-core/data/seis-core-ecosystem-registry.json` is the deterministic v2 bridge for product lanes, repository plugin/skill sources, provider states, MCP inventory, design/data evidence, and local launch routes.
- `packages/seis-ai/src/model/ecosystem-capability-snapshot.mjs` assembles that ecosystem bridge from canonical repository contracts and rejects unsafe execution or frontend-secret claims.
- `apps/seis-core/data/seis-ai-core-runtime-snapshot.json` is the deterministic browser bridge for provider, router, plugin, personal-lane, and MCP evidence.
- `packages/seis-ai/src/model/core-runtime-snapshot.mjs` assembles that bridge from canonical repository contracts without starting runtime execution.
- `apps/seis-core/test/seis-core-static.test.js` guards required modules, workflows, and design tokens; `seis-core-runtime.test.js` executes stale-state recovery, provider/scenario rendering, mission gating, snapshot failure, and primary-action flows in JSDOM.
- `docs/architecture/seis-command-center.md` documents the architecture contract for the command surface.

## Component Map

The shell is organized around eleven persistent modules: Dashboard, God Mode, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge. Cards are reserved for repeated operational entities such as plugins, automation workflows, security reports, model setup records, and system signals. Navigation changes state locally and re-renders the active command context without a backend dependency.

## Data Model

Command Center uses static local datasets in `script.js` for operations readiness, plugin families, automation workflows, workflow runs, approval gates, rollback evidence, God Mode lanes, God Mode protocol steps, SEIS AI setup records, God Mode guardrails, God Mode artifacts, security reports, permission reviews, dependency scans, security audits, AI systems, architecture signals, dependency graphs, module relationships, technical debt records, recent activity, repository dependencies, agent evidence, knowledge graph nodes, memory evidence, decision history, reusable patterns, and knowledge records. It also loads generated JSON adapters for the 10-lane command router, the ecosystem control plane, and AI Core runtime readiness. Each record keeps a stable label, status, owner or lane, and a concise operating signal so the UI can be scanned quickly and tested without network access.

Agent records must expose capabilities, tasks, logs, and outputs. Repository records must expose dependency overview and dependency risk. Operations readiness records must expose release, CI, security, rollback, handoff, owner, gate, evidence, and current decision state. Automation records must expose run history, approval requirements, validation evidence, and rollback paths. Architecture records must expose dependency graph nodes, module contracts, and technical debt actions. Security records must expose risk posture, permission review scope, dependency scan coverage, audit cadence, evidence, and next actions. Knowledge records must expose graph nodes, relationship contracts, memory freshness, decision impact, reusable patterns, evidence paths, and owners. Dashboard records must expose recent activity so the command surface can tell the operator what changed, who changed it, and which module owns the next review.

## God Mode Operations Model

God Mode is the controlled SEIS AI operating lane. It is not an unrestricted automation switch. It exposes a mission composer, lane selector, execution protocol, custom SEIS AI setup matrix, run timeline, guardrails, traceable artifacts, and feature growth ledger.

God Mode records must expose the mission, lane, owner, model role, safety gate, evidence requirement, and rollback posture. The SEIS AI setup matrix tracks permission policy, memory ranking, agent routing, and local draft model work as separate governed capabilities. No God Mode record may contain API keys, tokens, SSH material, provider credentials, or private cloud material.

The first implementation remains local-first and static. Future provider-backed or local-model execution must preserve the visible lane, evidence, and security boundary before a tool action can execute.

The feature growth ledger keeps the broad objective honest. It maps Dashboard, Goals, Repositories, Docs, Agents, Security, AI Policy, Rollback, Validation, and Handoff to improvement evidence, quality gates, and remaining gaps. A topic can be visible in the UI without being complete; completion still requires commit, push, CI or explicit handoff evidence, and protected-user-work proof.

## Operations Readiness Model

Operations readiness is the Command Center release-decision surface. It connects release scope, local quality, external CI, security posture, rollback, and handoff evidence in the Dashboard before the operator treats a SEIS change as shippable.

The model is intentionally `review-before-release` until local quality, clean source boundary, push evidence, external CI or explicit no-CI handoff evidence, and rollback proof are all visible. The canonical contract is `content/development/seis-command-center-operations-readiness.json`, and the gate is `npm run check:seis-command-center-operations-readiness`.

## AI Orchestration Model

The agent surface must support OpenAI, Claude, Gemini, Qwen, local models, and future AI systems through explicit orchestration lanes. Each lane records the primary system, collaborating agents, and the expected handoff artifact. Handoff audit records connect Architect, Builder, Security, Research, and Design work so multi-model collaboration remains inspectable instead of becoming hidden chat context. God Mode builds on this model by selecting a lane for each mission and requiring evidence before release handoff.

## Automation Operations Model

The automation surface separates workflow definitions from execution evidence. `automationWorkflows` defines the available lanes and triggers, `workflowRuns` records actor, trigger, duration, evidence, approval, and rollback details, `approvalGates` records required human or agent review points, and `rollbackEvidence` records the latest reversible path for source changes, generated reports, and remote-access workflows.

Automation evidence must stay local-first, auditable, and safe to render without credentials. A workflow is not considered release-ready until its validation evidence and rollback path are visible in the command surface.

## Architecture Operations Model

The architecture surface separates high-level system map nodes from operational architecture evidence. `architectureNodes` describes the current structural map, `dependencyGraph` records dependency boundaries, risks, and mitigations, `moduleRelationships` records module-to-module contracts and ownership, and `technicalDebtRegister` records technical debt items with severity, owner, status, and next action.

Architecture evidence must stay close to implementation changes. Any future live adapter, provider integration, native shell, or release workflow should update the architecture operations model when it changes a module boundary, dependency relationship, or technical debt posture.

## Security Operations Model

The security surface separates security posture from secret-bearing data. `securityReports` records summary posture, `permissionReviews` records scoped access decisions, `dependencyScans` records supply-chain findings, and `securityAudits` records review evidence. These records must stay evidence-led, redact sensitive material at the boundary, and expose enough status for operators to decide whether a workflow can continue.

Security operations are approval-aware. Any action that changes permissions, publishes artifacts, touches external systems, or handles model/data governance must show review status, owner, evidence, and rollback path before it is treated as release-ready.

## Knowledge System Model

The knowledge surface separates searchable knowledge from loose notes. `knowledgeGraphNodes` records repository memory, research sources, decision history, reusable patterns, security policy, and AI agent handoffs as first-class nodes with owner, type, status, signal, and links. `knowledgeEdges` records the relationship contracts between nodes so memory, research, security, automation, and plugin work remain connected instead of becoming isolated cards.

Memory evidence records source, scope, freshness, status, and evidence path. This keeps memory-derived guidance staleness-aware and prevents old assumptions from being treated as current proof. Decision history records the owner, status, evidence, and impact of key architectural choices. Reusable patterns capture repeatable implementation and validation habits that can later become automation or typed adapters.

The first implementation stays static and credential-free. Future live knowledge adapters should return typed knowledge nodes, edges, memory evidence, decisions, and patterns rather than raw note or provider payloads.

## Ecosystem Control Plane

The Plugins surface renders the generated `apps/seis-core/data/seis-core-ecosystem-registry.json` schema v2 as the bounded capability control plane for `SEIS`, `SEIS Cloud`, `SEIS Code`, `SEIS Design`, `SEIS Data`, and `SEIS Store`. `scripts/create-seis-core-ecosystem-snapshot.mjs` joins operating identities, the runtime capability atlas, canonical SEIS-Agent integration, provider and MCP contracts, the managed agent registry, design and data inventories, sanitized SSH evidence, six repository plugin sources, and verified browser routes. The freshness gate rebuilds the artifact and rejects drift.

The current source projection exposes six lanes, six bundled plugin sources, 25 repository skills, seven provider records, 35 MCP tools, 30 resources, three prompts, 18 product modules, 18 data contracts with 16 validated, 12 validated design components, and 13 managed agent roles. The `185` installed-enabled value is explicitly a dated 2026-06-19 source audit, not a live rescan; the `300` helper-plugin value is a catalogued universe, not blanket activation. The canonical runtime remains `seis-ai-agent`; the `SEIS` lane records the capability atlas's historical `seis-governance` server label as source evidence without treating it as runtime authority.

Operators select a lane from a keyboard-accessible list and inspect its capabilities, repository skills, MCP tool names, quality gates, source paths, plugin binding, and direct local launch route. Selection persists in browser-local state. Desktop routes use an allow-listed `desktop.html?app=<id>` handoff that opens one maximized target in an isolated window session without replacing the operator's saved normal Desktop layout. Missing or unknown app ids retain normal startup/session restoration, and SEIS Code keeps its verified standalone route.

This is a visibility and handoff contract, not a remote execution plane. Every lane and MCP record has `executionAuthority: false`; the browser never authenticates connectors, starts an MCP session, reads credentials, calls providers, installs packages, starts background agents, deploys, executes SSH, reads private content, or mutates GitHub. Cloud remains `Mock Safe` with strict SSH readiness false and the existing server/port policy preserved. Store remains `Local Demo` because it records browser-local catalog state only. Copying a gate only copies a local validation command.

## AI Core Runtime Snapshot

`packages/seis-ai/src/model/core-runtime-snapshot.mjs` joins four existing source-of-truth surfaces: `content/development/seis-ai-core-provider-registry.json`, the executable provider-neutral read-only router, `content/development/seis-agent-plugin-integration.json`, and `content/development/seis-ai-core-mcp-runtime-contract.json`. `scripts/create-seis-core-ai-runtime-snapshot.mjs` writes the deterministic browser artifact at `apps/seis-core/data/seis-ai-core-runtime-snapshot.json`; `npm run check:seis-core-ai-runtime-snapshot` fails when the artifact drifts from those sources.

The God Mode AI Core Runtime panel renders seven provider profiles, seven route scenarios, all five personal SEIS lanes, the unified plugin audit, and MCP tool/resource/prompt counts. Scenario selection is browser-local and changes only the visible source-generated decision. Copying a decision produces a credential-free handoff containing the selected provider, actual model fixture, lane, gate, opaque trace identifier, and blocked reasons. The trace supports correlation only; it is not an authenticity or payload-integrity proof because the public snapshot is a projection of the internal decision.

Mission Composer uses the same snapshot as a readiness join. Its local 10-lane classifier still chooses the tool, SEIS lane, and quality gate, while the matching snapshot scenario supplies provider state, selected provider/model fixture, fallback, eligibility, and blocked reasons. Submitting a mission records `Review` plus `executionPerformed: false` and `providerCallsPerformed: false`; it never claims an active provider execution. The legacy AI-system cards also derive `Missing Key`, `Disabled`, and other public states from this snapshot instead of presenting intended orchestration roles as connectivity status.

Persisted browser state is treated as untrusted input. Unknown views fall back to Dashboard, unknown agents and God Mode lanes return to seeded values, and malformed goal/run collections are replaced with public-safe seeds. View-specific primary actions target their own operational surfaces so a Plugins, Security, Automation, Architecture, or Knowledge command cannot silently redirect to an unrelated workflow.

The current snapshot is real repository evidence but not live AI execution. Every route remains `routeEligible: false`, `executionPerformed: false`, and `providerCallsPerformed: false`. Missing Key remains distinct from Error; private-vault and frontier-model scenarios remain blocked; browser secrets, live MCP sessions, SSH, deployment, GitHub mutation, and private content reads remain disabled. Any future live adapter requires backend-only credential isolation, typed environment validation, redacted logs, explicit provider/model display, and human approval.

The same tracked artifact is also the canonical input for `SeisPlatformKit`'s `SeisAICoreRuntimeSnapshotContract`. The Swift decoder accepts injected `Data` and exposes typed, validation-only provider, scenario, lane, plugin, MCP, and runtime-boundary records. It does not rediscover repository files, start a provider or MCP client, or reproduce the JavaScript router. Native validation must fail closed when any snapshot claims credential access, provider calls, route execution, live MCP, SSH, deployment, GitHub mutation, private-content reads, frontend secrets, or missing human approval for future live actions.

## Managed Agent Registry

The runtime snapshot projects the public roster from the canonical scoped contract at `content/development/seis-second-brain-system.json` into `agentRegistry`. The generated report under `reports/seis-public-demo` remains audit evidence and is not runtime authority. Only nine managed SEIS lane labels, thirteen agent names/statuses/duties, the review-only decision, plan-only permission state, and false safety claims are delivered to the browser. Installed AI profiles, generated reports, vault and training paths, prompt bodies, credentials, and private note content are intentionally excluded.

The Agents surface renders the nine lanes as a compact index and the thirteen agents as selectable rows with a source-backed detail view. Selection is browser-local and grants no authority. Every record has `executionAuthority: false`; Security Agent remains a visible `blocking-review-gate`; all mutation requires human approval. Snapshot generation fails when source counts drift or when the source registry claims provider calls, credential validation, autonomous writes, background execution, connector mutation, SSH, deployment, GitHub mutation, private-vault reads, private-note copying, prompt storage, browser-secret exposure, or release approval.

## Operating Model

The core operating model connects repositories, AI agents, MCP systems, plugin systems, documentation, architecture decisions, roadmap planning, goal tracking, automation workflows, cloud infrastructure, knowledge systems, and security systems. Each domain maps to a visible module, a lane, a status, and a concise signal. This keeps the product aligned with the mission: Command Center is the operating system of SEIS, not a loose dashboard of unrelated cards.

## API Design

The current implementation is intentionally local-first. Browser APIs provide persistence through `localStorage`, while render functions act as the internal interface between data collections and UI sections. Future external APIs should preserve this boundary by returning typed command-center records instead of raw provider payloads.

## Testing Strategy

The primary check is `npm run test:seis-command-center`, which validates required modules, local workflows, generated AI Core and ecosystem evidence, and design tokens. `npm run check:seis-core-ecosystem-registry` proves the v2 artifact matches all canonical source contracts; `node --test packages/seis-ai/test/ecosystem-capability-snapshot.test.mjs` verifies counts, routes, no-execution boundaries, artifact freshness, and fail-closed provider-secret behavior. `npm run check:seis-core-ai-runtime-snapshot` separately proves the AI runtime artifact matches the provider/router/plugin/MCP sources. The governance check `npm run check:seis-command-center` verifies required files, script signals, CSS selectors, manifest identity, README coverage, and this architecture document.

## Roadmap

The next evolution is to connect the local command model to repository health, plugin bundle status, CI signals, security reports, and AI-agent workflow evidence. These integrations should be added as small, reversible adapters that preserve the local-first shell and keep the command surface usable offline.

## Platform Phases

- Phase 1: HTML, CSS, and JavaScript static command shell with dependency-free local workflows.
- Phase 2: TypeScript, React, and Next.js modules with typed API adapters and authenticated live data.
- Phase 3: Native SwiftUI macOS and iOS applications once the workflow model is stable.

## Deployment Strategy

The app is static and can be hosted through the existing SEIS web publishing path or served from the repository's shared `apps` root for local review. Use `python3 -m http.server 4174 --directory apps` and open `http://127.0.0.1:4174/seis-core/`; this mount preserves the sibling `../web/` routes used by the ecosystem control plane. Deployment should keep the manifest, service worker strategy, and generated readiness reports aligned with the broader SEIS release surface.

## Security Model

Command Center must not store secrets, tokens, credentials, or private cloud material in browser storage or repository data files. Security reports, permission reviews, dependency scans, and audits are rendered as evidence summaries, not as secret-bearing payloads. Any future provider integration must redact credentials at the adapter boundary, keep rollback behavior documented, and preserve least-privilege activation.
