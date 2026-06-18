# SEIS Command Center Architecture

SEIS Command Center is the local-first operating surface for the SEIS ecosystem. It consolidates dashboard status, goals, repositories, documentation, agents, plugins, automation, security, architecture, and knowledge signals into one inspectable web application.

## Folder Structure

- `apps/seis-core/index.html` defines the static shell and module navigation.
- `apps/seis-core/styles.css` owns the command surface layout, tokens, and responsive behavior.
- `apps/seis-core/script.js` owns local data, rendering, command execution states, and browser persistence.
- `apps/seis-core/test/seis-core-static.test.js` guards required modules, workflows, and design tokens.
- `docs/architecture/seis-command-center.md` documents the architecture contract for the command surface.

## Component Map

The shell is organized around ten persistent modules: Dashboard, Goals, Repositories, Documentation, Agents, Plugins, Automation, Security, Architecture, and Knowledge. Cards are reserved for repeated operational entities such as plugins, automation workflows, security reports, and system signals. Navigation changes state locally and re-renders the active command context without a backend dependency.

## Data Model

Command Center uses static local datasets in `script.js` for plugin families, automation workflows, workflow runs, approval gates, rollback evidence, security reports, permission reviews, dependency scans, security audits, AI systems, architecture signals, dependency graphs, module relationships, technical debt records, recent activity, repository dependencies, agent evidence, and knowledge records. Each record keeps a stable label, status, owner or lane, and a concise operating signal so the UI can be scanned quickly and tested without network access.

Agent records must expose capabilities, tasks, logs, and outputs. Repository records must expose dependency overview and dependency risk. Automation records must expose run history, approval requirements, validation evidence, and rollback paths. Architecture records must expose dependency graph nodes, module contracts, and technical debt actions. Security records must expose risk posture, permission review scope, dependency scan coverage, audit cadence, evidence, and next actions. Dashboard records must expose recent activity so the command surface can tell the operator what changed, who changed it, and which module owns the next review.

## AI Orchestration Model

The agent surface must support OpenAI, Claude, Gemini, Qwen, local models, and future AI systems through explicit orchestration lanes. Each lane records the primary system, collaborating agents, and the expected handoff artifact. Handoff audit records connect Architect, Builder, Security, Research, and Design work so multi-model collaboration remains inspectable instead of becoming hidden chat context.

## Automation Operations Model

The automation surface separates workflow definitions from execution evidence. `automationWorkflows` defines the available lanes and triggers, `workflowRuns` records actor, trigger, duration, evidence, approval, and rollback details, `approvalGates` records required human or agent review points, and `rollbackEvidence` records the latest reversible path for source changes, generated reports, and remote-access workflows.

Automation evidence must stay local-first, auditable, and safe to render without credentials. A workflow is not considered release-ready until its validation evidence and rollback path are visible in the command surface.

## Architecture Operations Model

The architecture surface separates high-level system map nodes from operational architecture evidence. `architectureNodes` describes the current structural map, `dependencyGraph` records dependency boundaries, risks, and mitigations, `moduleRelationships` records module-to-module contracts and ownership, and `technicalDebtRegister` records technical debt items with severity, owner, status, and next action.

Architecture evidence must stay close to implementation changes. Any future live adapter, provider integration, native shell, or release workflow should update the architecture operations model when it changes a module boundary, dependency relationship, or technical debt posture.

## Security Operations Model

The security surface separates security posture from secret-bearing data. `securityReports` records summary posture, `permissionReviews` records scoped access decisions, `dependencyScans` records supply-chain findings, and `securityAudits` records review evidence. These records must stay evidence-led, redact sensitive material at the boundary, and expose enough status for operators to decide whether a workflow can continue.

Security operations are approval-aware. Any action that changes permissions, publishes artifacts, touches external systems, or handles model/data governance must show review status, owner, evidence, and rollback path before it is treated as release-ready.

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
