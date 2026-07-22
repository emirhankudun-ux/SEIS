# PANTECHNOEPISTEMONOESIS — SEIS Topic Plugin

This is an objective-derived retained SEIS topic source package for the **PANTECHNOEPISTEMONOESIS** family. It is discoverable through the optional `seis-topic-bundle-21@seis-repo` card and is not a direct marketplace card.

The package gives Codex a bounded **PANTECHNOEPISTEMONOESIS** context lane: deterministic status, repository-shape evidence, and planning boundaries. It does not call external providers, read secrets, use the network, or write files.

## Package boundary

- `.codex-plugin/plugin.json` defines the retained source-package identity.
- `.mcp.json` exposes the local MCP server.
- `skills/seis-topic-pantechnoepistemonoesis/SKILL.md` defines the topic workflow.
- `assets/topic-profile.json` records source, audience, license, maturity, and permissions.
- `scripts/seis-topic-pantechnoepistemonoesis-mcp-server.mjs` exposes status and bounded report tools.

## Safety

Public repository availability is not authentication. Live cloud, provider, GitHub write, SSH, deployment, connector, destructive, and secret-bearing actions remain outside this package and require explicit approval in the relevant SEIS workflow.

## Validate

```bash
node plugins/seis-topics/seis-topic-pantechnoepistemonoesis/scripts/seis-topic-pantechnoepistemonoesis-mcp-server.mjs --status
npm run check:seis-topic-plugin-family
```
