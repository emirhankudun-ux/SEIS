# SEIS AI Core Plugin Registry

Status: active repository foundation; public release remains approval-gated.

The canonical plugin registry for SEIS AI Desktop is
`content/development/seis-ai-core-plugin-registry.json`. Its owner is the SEIS
repository and its runtime surface is `packages/seis-ai` behind the single
default public `seis-ai-agent@seis-repo` installation plus optional curated
bundle cards.

## 5000-entry contract

The registry contains exactly 5000 unique entries. The count is intentionally
split into two honest states:

- 85 physical repository plugin sources, including 75 app-owned local plugin
  packages under
  `plugins/seis-core`;
- 4915 deterministic catalog-only capability slots generated from the SEIS
  domain/operation taxonomy.

Catalog-only records are plan-only. They are not implemented, connected,
route-eligible, authenticated, public marketplace plugins, or proof of a
provider/MCP integration. This keeps the requested 5000 scale useful to AI
Core discovery without creating thousands of duplicate source folders.

The 75 app-owned packages currently share the public Command Center release
train `0.00000002` (`0.0.20` strict semver). The release policy is recorded
in `content/development/seis-core-plugin-release-train.json`; catalog slots do
not inherit that app release. The public `seis-ai-agent` suite remains on its
separate release lifecycle.

## Source and marketplace boundary

All 75 app-owned plugin packages are public MIT-licensed source in the SEIS
repository and are available to everyone. Historical personal-plugin evidence
is retained only for compatibility auditing. The current public marketplace is
the curated 34-card projection:

```text
1 canonical card: seis-ai-agent@seis-repo
6 application bundle cards
27 topic bundle cards
```

The card projection is distinct from the 380 retained repository sources: five
root modules, 75 application packages, and 300 topic packages. Every retained
application entry records `publicMarketplace: false`,
`directMarketplaceCard: false`, `discoverableViaBundle: true`, and exactly one
`bundleId` / bundle install ID. Source packages remain independently auditable
and route-eligible where declared; they are not presented as direct cards.

The previous 381-card direct-source projection is preserved only under
`historicalMarketplaceProjection` in the generated registry. Its
1 canonical + 5 root + 75 application + 300 topic count is compatibility
history, not current discovery state.

Local-only licenses, missing licenses, provenance gaps, or unverified
permissions keep a source package outside the public app-owned boundary until
a separate review.

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

## Legacy personal-source coverage and local validation

The checked-in coverage record
`content/development/seis-ai-core-personal-plugin-coverage.json` proves that
the selected historical personal marketplace currently contains 55 SEIS plugin
IDs and that all 55 have repository counterparts. This is compatibility
evidence only: the five historical root sources and 50 historical application
sources remain covered by the curated public `seis-repo` topology without
remaining direct cards. The active app-owned source boundary is the 75-package
public MIT repository set under `plugins/seis-core`, including 25 application
sources beyond those 50 historical counterparts.

The app-source gate
`npm run check:seis-core-plugin-sources` validates each app-owned manifest,
profile, deny-by-default permission set, entrypoint and read-only `--status`
execution. It does not enable network, write or secret permissions and does
not make catalog-only records executable. `packages/seis-ai` retains only the
registry, contracts, permission policy, and read-only inspection runtime.

`seis-mcp-permission` is the app-owned public boundary inspector for these
packages. `npm run check:seis-mcp-permission` verifies that every declared app
MCP server remains local stdio, has a matching package entrypoint, and retains
empty write, network, and secret permission sets without starting a server.

`seis-focus-navigation-audit` complements the metadata audit by reading
bounded Command Center and Desktop source files for static keyboard, focus,
semantic-control, ARIA, and reduced-motion evidence. Its ready state is not a
browser or assistive-technology certification; manual accessibility evidence
and human approval remain release gates.

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
