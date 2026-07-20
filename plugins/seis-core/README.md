# SEIS Core public repository plugin source boundary

`plugins/seis-core/` is the public, canonical repository source boundary for the
63 app-owned plugins used by the SEIS Command Center application. Everyone can
read and reuse these MIT-licensed source packages directly from the SEIS repo.
The directory remains separate from the ten public source modules directly
under `plugins/` so ownership and runtime boundaries stay explicit.

Each package contains a strict `plugin.json`, a local profile, a read-only MCP
entrypoint, and a skill contract. The application runtime in this directory
does not grant network, secret, or write permissions by default.

## Release policy

All 63 packages move together on the gradual release train:

```text
0.000000001 -> 0.00000001 -> 0.000000011 -> ... -> 1.0000 -> 1.0001 -> ... -> 45.0000
```

The current release is `0.000000013`, represented as strict package semver
`0.0.13`. A large, measured code change advances exactly one micro/revision
step. An approved annual update advances exactly one major step. A bulk jump
to `45.0000` is prohibited.

```bash
npm run promote:seis-core-plugin-release:dry-run
npm run promote:seis-core-plugin-release
npm run promote:seis-core-plugin-annual-release:dry-run
npm run promote:seis-core-plugin-annual-release
npm run check:seis-core-plugin-release
```

## Local runtime

`runtime/plugin-contract.mjs` validates package identity, strict semver,
release metadata, relative entrypoints, and deny-by-default permissions.
`scripts/run-plugin-matrix.mjs` then executes only each plugin's `--status`
command in a bounded child process. It never invokes a plugin audit action,
reads credentials, enables network access, or writes into a plugin source.
`runtime/plugin-catalog.mjs` and `bin/seis-core-plugins.mjs` are the
application-owned discovery surface for list/search/inspect/status workflows.
An activation plan can describe a read-only status check, while run/write,
network, and secret actions return `approval-required` without executing.

The ten expansion packages are declared read-only audit plugins. Their shared
`runtime/plugin-audit-runtime.mjs` exposes a bounded `--report --path <workspace>`
mode and two MCP tools (status and report); reports read only the declared
repository evidence checks, reject paths outside the SEIS workspace, and never
call providers or mutate source files. The remaining packages stay
status-only until a separate permission review approves another capability.

```bash
npm run automation:seis-core-plugin-matrix
npm run check:seis-core-plugin-matrix
node plugins/seis-core/scripts/run-plugin-matrix.mjs --json --strict
node plugins/seis-core/bin/seis-core-plugins.mjs search release --status --json
node plugins/seis-core/bin/seis-core-plugins.mjs activation-plan seis-release-readiness --action run --json
npm run automation:seis-core-plugin-release-readiness
```

The generated matrix is
`content/development/seis-core-plugin-matrix.json`. The AI Core package may
index this metadata and expose read-only status, but it does not own source
packages under this directory.

The Command Center reads the generated app catalog at
`apps/seis-core/data/seis-core-plugin-catalog.json`; this keeps the UI backed
by the same 63 public repository manifests instead of a second static source of truth.
Its release panel reads
`apps/seis-core/data/seis-core-plugin-release-readiness.json`, which reports
the next large-code and annual transitions plus measured working-tree code
evidence. Large-code application is refused until the 500-line evidence gate
is met.

## Direct repository distribution

This directory is the direct public repository source for the SEIS Command
Center application. The canonical public install card remains
`seis-ai-agent@seis-repo`; the 63 app-owned packages are not personal plugins,
are not copied into `packages/seis-ai`, and are also published as individual
MIT packages in the public `seis-repo` marketplace. Each package is available
to everyone directly from this repository through the generated marketplace,
source inventory, and catalog:

```bash
npm run automation:seis-core-plugin-sources
npm run check:seis-core-plugin-public-repository
npm run automation:seis-core-plugin-catalog
npm run check:seis-core-public-distribution-audit
npm run automation:seis-unified-plugin-suite
npm run seis:core:surface
npm run check:seis-agent-plugin-integration
```

Every new app package must be created under
`plugins/seis-core/<plugin-name>`, pass the public app plugin contract, appear in
`apps/seis-core/data/seis-core-plugin-sources.json` and the catalog, receive a
`<plugin-name>@seis-repo` marketplace entry, and then appear in
`plugins/seis-ai-agent/assets/unified-suite.json`. This keeps the public
repository as the source of truth while preserving the app-owned runtime boundary.
`seis:core:surface` is a read-only status and install-plan entrypoint for
anyone working from the repository; it never copies packages into
`packages/seis-ai`, creates personal ownership, or performs external writes.

## Ownership and publication

- canonical owner: `SEIS` repository, `plugins/seis-core/`
- application surface: `apps/seis-core`
- AI Core role: registry, contracts, permission policy, and read-only inspection
- public audience: everyone
- public source license: MIT
- public marketplace app section: one canonical orchestrator card plus 63 public app package cards
- complete `seis-repo` marketplace: 369 cards, including five migrated root cards and 300 objective-derived `plugins/seis-topics` packages
- marketplace identity: `seis-repo` (audience: everyone)
- public `seis-ai-agent` suite: separate release lifecycle
- live runtime status: local demo/auth-gated; network, secrets, writes, and provider calls remain approval-gated
