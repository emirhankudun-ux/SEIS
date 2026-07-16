# SEIS AI Core Plugin Registry

Status: active repository foundation; public release remains approval-gated.

The canonical plugin registry for SEIS AI Desktop is
`content/development/seis-ai-core-plugin-registry.json`. Its owner is the SEIS
repository and its runtime surface is `packages/seis-ai` behind the single
public `seis-ai-agent@seis-repo` installation.

## 5000-entry contract

The registry contains exactly 5000 unique entries. The count is intentionally
split into two honest states:

- 70 physical repository plugin sources, including 60 app-owned local plugin
  packages under
  `plugins/seis-core`;
- 4930 deterministic catalog-only capability slots generated from the SEIS
  domain/operation taxonomy.

Catalog-only records are plan-only. They are not implemented, connected,
route-eligible, authenticated, public marketplace plugins, or proof of a
provider/MCP integration. This keeps the requested 5000 scale useful to AI
Core discovery without creating thousands of duplicate source folders.

The 60 app-owned packages currently share the internal Command Center release
train `0.000000012` (`0.0.12` strict semver). The release policy is recorded
in `content/development/seis-core-plugin-release-train.json`; catalog slots do
not inherit that app release. The public `seis-ai-agent` suite remains on its
separate release lifecycle.

## Source and marketplace boundary

All migrated personal plugin source is now represented inside the SEIS
repository. The personal marketplace was not mutated. The public marketplace
still exposes one card only:

```text
seis-ai-agent@seis-repo
```

Local-only licenses, missing licenses, provenance gaps, or unverified
permissions keep a source package repo-internal until a separate review.

## Validation

```bash
npm run automation:seis-ai-core-plugin-registry
npm run check:seis-ai-core-plugin-registry
npm run check:seis-core-plugin-release
npm run seis:plugin-registry
npm run seis:plugin-registry -- --query security --limit 20
npm test --prefix packages/seis-ai
```

The registry is also available through the read-only AI Core MCP tool
`seis_ai_core_plugin_registry_status` and resource
`seis://ai/plugin-registry.json`.

## Personal-source coverage and local validation

The checked-in coverage record
`content/development/seis-ai-core-personal-plugin-coverage.json` proves that
the selected personal marketplace currently contains 55 SEIS plugin IDs and
that all 55 have repository counterparts: five existing source modules and 50
marketplace-migrated packages owned by the SEIS Command Center under
`plugins/seis-core`; ten additional app-only audit plugins remain outside the
personal marketplace by design.

The app-source gate
`npm run check:seis-core-plugin-sources` validates each app-owned manifest,
profile, deny-by-default permission set, entrypoint and read-only `--status`
execution. It does not enable network, write or secret permissions and does
not make catalog-only records executable. `packages/seis-ai` retains only the
registry, contracts, permission policy, and read-only inspection runtime.

The application-owned catalog layer is separate from that core package:

- generator/check: `npm run automation:seis-core-plugin-catalog` and
  `npm run check:seis-core-plugin-catalog`;
- artifact: `apps/seis-core/data/seis-core-plugin-catalog.json`;
- runtime: `plugins/seis-core/runtime/plugin-catalog.mjs`;
- CLI: `node plugins/seis-core/bin/seis-core-plugins.mjs`.

This layer is intentionally local and read-only. It can prepare a status or
inspection plan. The ten app-only audit packages additionally expose declared
bounded reports; every other run, write, network, or secret action returns an
approval-required result and does not execute.
