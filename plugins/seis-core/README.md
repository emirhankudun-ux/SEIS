# SEIS Core personal plugin source boundary

`plugins/seis-core/` is the canonical source boundary for the 50 local plugins
used by the SEIS Command Center application. The directory is connected to the
SEIS repository and is intentionally separate from the ten public source
modules directly under `plugins/`.

Each package contains a strict `plugin.json`, a local profile, a read-only MCP
entrypoint, and a skill contract. The application runtime in this directory
does not grant network, secret, or write permissions by default.

## Release policy

All 50 packages move together on the gradual release train:

```text
0.000000001 -> 0.00000001 -> 0.000000011 -> ... -> 1.0000 -> 1.0001 -> ... -> 45.0000
```

The current baseline is `0.00000001`, represented as strict package semver
`0.0.10`. A large, measured code change advances exactly one micro/revision
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
by the same 50 local manifests instead of a second static source of truth.
Its release panel reads
`apps/seis-core/data/seis-core-plugin-release-readiness.json`, which reports
the next large-code and annual transitions plus measured working-tree code
evidence. Large-code application is refused until the 500-line evidence gate
is met.

## Ownership and publication

- canonical owner: `SEIS` repository, `plugins/seis-core/`
- application surface: `apps/seis-core`
- AI Core role: registry, contracts, permission policy, and read-only inspection
- public marketplace: unchanged
- public `seis-ai-agent` suite: separate release lifecycle
- source status: internal local demo until license, provenance, and public-release reviews pass
