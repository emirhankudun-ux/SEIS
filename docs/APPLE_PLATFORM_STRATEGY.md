# SEIS Apple Platform Strategy

Status: active long-term direction

## Platform Roles

- macOS is the primary native Command Center.
- iPadOS is the SEIS Brain, review, and creative-planning surface.
- iOS is the status, alert, search, and quick-note companion.
- visionOS is research-only until shared Apple foundations are healthy.
- Web remains the no-key public demo and GitHub showcase.

## Swift Package Direction

Reusable domain models, policies, design tokens, provider metadata, Brain
contracts, security rules, and tests should move into justified Swift packages.
Packages must expose useful interfaces, document ownership and dependencies,
and compile when toolchains are available.

## AI Core Runtime Contract

`SeisPlatformKit` consumes the generated SEIS AI Core runtime snapshot through
`SeisAICoreRuntimeSnapshotContract`. The decoder accepts injected `Data`; it
does not discover files, read environment variables, start MCP, or call external
model providers. The web artifact remains the source-backed delivery envelope,
while Swift supplies typed provider states, scenarios, personal lanes, MCP metrics,
and validation issues for future native views.

Every native consumer must reject snapshots that claim provider calls,
credential reads, frontend secrets, live MCP sessions, SSH, deployment, GitHub
mutation, private-content reads, or route execution outside the declared Local
Demo or approved local loopback modes.
The implemented Swift runtime defaults to deterministic Local Demo-only mode in
this branch. An opt-in Ollama-compatible loopback adapter exists for explicit
local-only routes, but it requires `approvedLocalLoopback`, a loopback HTTP
endpoint, bounded input/output, redacted evidence, and human approval. No live
Ollama service call is claimed unless the current environment verifies one.

The native shell also exposes `SeisAppleProductSurfaceCatalog`, a typed atlas
for Desktop OS, AI Core, Search, Code, Design, Cloud, Store, Music, Launchpad,
Files, Terminal/SSH Center, Website, Agents, Plugins, and Command Center. Each
surface carries an explicit `native-local-demo`, `browser-local-demo`, `planned`,
or `approval-required` state plus a boundary and evidence description. Selecting
a tile inspects the contract only; it does not imply live provider, MCP, SSH,
deployment, or filesystem execution.

The native shell also exposes `SeisAppleLocalWorkspaceIndex` and
`SeisAppleLocalWorkspaceFilesView`. This is a bounded, allow-listed metadata
index for the selected repository root. It records relative paths, entry kind,
and byte counts without reading file contents. Hidden paths, `.git`, build
output, `node_modules`, environment files, credentials, secrets, and symbolic
links are excluded. Refresh and filtering are local inspection actions only;
file creation, rename, deletion, opening, and external execution remain
disabled.

## Native Boundaries

Platform APIs remain isolated from shared models. SwiftUI surfaces preserve
accessibility, reduced motion, performance, privacy, and native interaction.
Metal is used only for measured rendering value.

## Adoption Gate

Do not add symbolic Swift files or copy Apple interfaces. Native expansion
requires a stable contract, tests, documentation, rollback, and evidence that
it improves the product rather than language statistics.
