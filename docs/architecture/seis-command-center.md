# SEIS Command Center Architecture

SEIS Command Center is the local-first operating surface for the SEIS ecosystem. It consolidates dashboard status, goals, repositories, documentation, agents, plugins, automation, security, architecture, and knowledge signals into one inspectable web application.

## Folder Structure

- `apps/seis-core/index.html` defines the static shell and module navigation.
- `apps/seis-core/styles.css` owns the command surface layout, tokens, and responsive behavior.
- `apps/seis-core/ai-core-contract-fixture.js` projects the shared AI Core and
  Command Center fixture into the static browser shell.
- `apps/seis-core/script.js` owns local data, rendering, command execution states, and browser persistence.
- `apps/seis-core/test/seis-core-static.test.js` guards required modules, workflows, and design tokens.
- `docs/architecture/seis-command-center.md` documents the architecture contract for the command surface.

## Component Map

The shell is organized around eleven persistent modules: Dashboard, Goals,
Repositories, Documentation, Agents, AI Core, Plugins, Automation, Security,
Architecture, and Knowledge. Cards are reserved for repeated operational
entities such as AI Core contract records, plugins, automation workflows,
security reports, and system signals. Navigation changes state locally and
re-renders the active command context without a backend dependency.

## Data Model

Command Center uses static local datasets in `script.js` and
`apps/seis-core/ai-core-contract-fixture.js` for AI Core contract records,
plugin families, automation workflows, security reports, AI systems,
architecture signals, and knowledge records. Each record keeps a stable label,
status, owner or lane, evidence path, and a concise operating signal so the UI
can be scanned quickly and tested without network access.

## Operating Model

The core operating model connects repositories, AI agents, MCP systems, plugin systems, documentation, architecture decisions, roadmap planning, goal tracking, automation workflows, cloud infrastructure, knowledge systems, and security systems. Each domain maps to a visible module, a lane, a status, and a concise signal. This keeps the product aligned with the mission: Command Center is the operating system of SEIS, not a loose dashboard of unrelated cards.

## API Design

The current implementation is intentionally local-first. Browser APIs provide persistence through `localStorage`, while render functions act as the internal interface between data collections and UI sections. Future external APIs should preserve this boundary by returning typed command-center records instead of raw provider payloads.

## Testing Strategy

The primary check is `npm run test:seis-command-center`, which validates required modules, local workflows, and design tokens. The governance check `npm run check:seis-command-center` verifies required files, script signals, CSS selectors, manifest identity, README coverage, and this architecture document.

## Roadmap

The next evolution is to connect the local command model to repository health, plugin bundle status, CI signals, security reports, and AI-agent workflow evidence. These integrations should be added as small, reversible adapters that preserve the local-first shell and keep the command surface usable offline.

## AI Core And App Contracts

Command Center and SEIS AI Core share the same operational objects: model
routes, prompt versions, agent tasks, approval requests, evaluation results,
audit events, repository findings, documentation status, security findings,
roadmap items, and module maturity levels. The contract map is maintained at
`docs/architecture/ai-core-app-shared-contracts.md`.

The current shell renders those objects from
`apps/seis-core/ai-core-contract-fixture.js`, which is checked against
`packages/shared-types/fixtures/ai-core-command-center-foundation.json` by
`npm run check:ai-core-app-contracts`. This remains fixture-backed and does not
enable live provider routing or browser-side provider secrets.

The app-facing product foundation is maintained under `docs/product/`. These
documents describe intended Command Center views without claiming those views
are fully implemented in the current shell.

## Platform Phases

- Phase 1: HTML, CSS, and JavaScript static command shell with dependency-free local workflows.
- Phase 2: TypeScript, React, and Next.js modules with typed API adapters and authenticated live data.
- Phase 3: Native SwiftUI macOS and iOS applications once the workflow model is stable.

## Deployment Strategy

The app is static and can be hosted through the existing SEIS web publishing path or served directly from the repository for local review. Deployment should keep the manifest, service worker strategy, and generated readiness reports aligned with the broader SEIS release surface.

## Security Model

Command Center must not store secrets, tokens, credentials, or private cloud material in browser storage or repository data files. Security reports are rendered as evidence summaries, not as secret-bearing payloads. Any future provider integration must redact credentials at the adapter boundary and keep rollback behavior documented.
