# SEIS MCP Permission Boundary

`seis-mcp-permission` is a retained SEIS Repo source capability distributed
through the optional `seis-application-bundle-03@seis-repo` card. It checks
the declared local stdio MCP boundary of every app source package without
starting a server or granting access. It is not a direct marketplace card.

## Public boundary

- Source: `plugins/seis-core/seis-mcp-permission`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Distribution card: `seis-application-bundle-03@seis-repo`
- Direct marketplace card: none
- Audience: everyone
- Ledger: `content/development/seis-mcp-permission-risk-matrix.json`
- Goal: `SEIS-GOAL-021`

It reconciles the curated 34-card marketplace (one canonical card and 33
optional bundle cards) with all 380 retained source capabilities (5 root, 75
application, and 300 topic). For each of the 75 app source packages, the
ledger proves exactly one application-bundle membership and records
`marketplaceCard: false` plus the bundle card id. It then checks the source
inventory, profile, manifest, and `.mcp.json` declaration. Every app source
package must declare one local `node` stdio server whose sole argument matches
the profile entrypoint, while write, network, and secret permissions remain
empty.

## Safety and authority

The plugin does not start or connect to MCP servers, install packages or
bundle members, change configuration, grant permissions, use credentials, or
access the network. A ready ledger validates only declared metadata and
distribution membership; it is not evidence of current enablement, external
connectivity, authorization, or public release approval.

Any permission change, remote endpoint, environment injection, credential,
network use, external write, or public release still requires explicit human
approval and its own validation.

## Regeneration and validation

```bash
npm run automation:seis-mcp-permission
npm run check:seis-mcp-permission
npm run check:seis-core-mcp-permission
node plugins/seis-core/seis-mcp-permission/scripts/seis-mcp-permission-mcp-server.mjs --validate
node plugins/seis-core/seis-mcp-permission/scripts/seis-mcp-permission-mcp-server.mjs --ledger --plugin seis-mcp-permission
```
