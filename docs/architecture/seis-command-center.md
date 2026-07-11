# SEIS Command Center Architecture

SEIS Command Center is the local-first operating surface for the SEIS ecosystem. It consolidates dashboard status, God Mode missions, goals, repositories, documentation, agents, plugins, automation, security, architecture, and knowledge signals into one inspectable web application.

## Folder Structure

- `apps/seis-core/index.html` defines the static shell and module navigation.
- `apps/seis-core/styles.css` owns the command surface layout, tokens, and responsive behavior.
- `apps/seis-core/script.js` owns local data, rendering, command execution states, and browser persistence.
- `apps/seis-core/test/seis-core-static.test.js` guards required modules, workflows, and design tokens.
- `docs/architecture/seis-command-center.md` documents the architecture contract for the command surface.

## Component Map

The shell is organized around eleven persistent modules: Dashboard, God Mode, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge. Cards are reserved for repeated operational entities such as plugins, automation workflows, security reports, model setup records, and system signals. Navigation changes state locally and re-renders the active command context without a backend dependency.

## Data Model

Command Center uses static local datasets in `script.js` for operations readiness, plugin families, automation workflows, workflow runs, approval gates, rollback evidence, God Mode lanes, God Mode protocol steps, SEIS AI setup records, God Mode guardrails, God Mode artifacts, security reports, permission reviews, dependency scans, security audits, AI systems, architecture signals, dependency graphs, module relationships, technical debt records, recent activity, repository dependencies, agent evidence, knowledge graph nodes, memory evidence, decision history, reusable patterns, and knowledge records. Each record keeps a stable label, status, owner or lane, and a concise operating signal so the UI can be scanned quickly and tested without network access.

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

The Command Center is the local source-backed control plane for ecosystem status and planning. Its `seis-cloud` lane exposes a sanitized `SEIS-SSH` binding from the repository contract and readiness evidence, preserving the existing server and port (`github.codespaces:22`) without executing SSH, reading credentials, or mutating external systems. The Core surface now renders four explicit SSH facts from those source records: public GitHub contract status, current transport posture, contributor-doctor readiness, and live-readiness blocker state. Status and plan surfaces remain read-only until strict online evidence and explicit human approval are available.

The same control plane exposes the source-visible plugin universe from `content/development/requested-plugin-inventory.json` and `content/development/plugin-capability-lanes.json`: 300 unique plugins, 301 submitted links, and 12 activation lanes. These totals are rendered as Core metrics and checked for parity with the source registries. They describe capability coverage, not blanket activation; authentication, task scope, least privilege, validation, and human approval remain required before any external connector or mutation.

## Operating Model

The core operating model connects repositories, AI agents, MCP systems, plugin systems, documentation, architecture decisions, roadmap planning, goal tracking, automation workflows, cloud infrastructure, knowledge systems, and security systems. Each domain maps to a visible module, a lane, a status, and a concise signal. This keeps the product aligned with the mission: Command Center is the operating system of SEIS, not a loose dashboard of unrelated cards.

## API Design

The current implementation is intentionally local-first. Browser APIs provide persistence through `localStorage`, while render functions act as the internal interface between data collections and UI sections. Future external APIs should preserve this boundary by returning typed command-center records instead of raw provider payloads.

## Testing Strategy

The primary check is `npm run test:seis-command-center`, which validates required modules, local workflows, and design tokens. The governance check `npm run check:seis-command-center` verifies required files, script signals, CSS selectors, manifest identity, README coverage, and this architecture document.

## Roadmap

The next evolution is to connect the local command model to repository health, plugin bundle status, CI signals, security reports, and AI-agent workflow evidence. These integrations should be added as small, reversible adapters that preserve the local-first shell and keep the command surface usable offline.

## Platform Phases

- Phase 1: HTML, CSS, and JavaScript static command shell with dependency-free local workflows.
- Phase 2: TypeScript, React, and Next.js modules with typed API adapters and authenticated live data.
- Phase 3: Native SwiftUI macOS and iOS applications once the workflow model is stable.

## Deployment Strategy

The app is static and can be hosted through the existing SEIS web publishing path or served directly from the repository for local review. Deployment should keep the manifest, service worker strategy, and generated readiness reports aligned with the broader SEIS release surface.

## Security Model

Command Center must not store secrets, tokens, credentials, or private cloud material in browser storage or repository data files. Security reports, permission reviews, dependency scans, and audits are rendered as evidence summaries, not as secret-bearing payloads. Any future provider integration must redact credentials at the adapter boundary, keep rollback behavior documented, and preserve least-privilege activation.
