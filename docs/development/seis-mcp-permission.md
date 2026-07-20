# SEIS MCP Permission Boundary

`seis-mcp-permission@seis-repo` is a public, app-owned SEIS Repo card for
checking the declared local stdio MCP boundary of every app package without
starting a server or granting access.

## Public boundary

- Source: `plugins/seis-core/seis-mcp-permission`
- Marketplace: `SEIS Repo` (`seis-repo`)
- Audience: everyone
- Ledger: `content/development/seis-mcp-permission-risk-matrix.json`
- Goal: `SEIS-GOAL-021`

It verifies the fixed public marketplace card, app-source inventory, profile,
manifest, and `.mcp.json` declarations. Every app package must declare a
single local `node` stdio server whose sole argument matches the profile
entrypoint, and its write, network, and secret permissions must stay empty.

## Safety and authority

The plugin does not start or connect to MCP servers, install packages, change
configuration, grant permissions, use credentials, or access the network. A
ready ledger validates only declared metadata; it is not evidence of current
enablement, external connectivity, authorization, or public release approval.

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
