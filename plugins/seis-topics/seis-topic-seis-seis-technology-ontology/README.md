# SEIS Technology Ontology — SEIS Topic Plugin

This is an objective-derived public SEIS topic package for the **SEIS** family. It is published directly from the SEIS repository marketplace as `seis-topic-seis-seis-technology-ontology@seis-repo`.

The package gives Codex a bounded **SEIS Technology Ontology** context lane: deterministic status, repository-shape evidence, and planning boundaries. It does not call external providers, read secrets, use the network, or write files.

## Package boundary

- `.codex-plugin/plugin.json` defines the public plugin card.
- `.mcp.json` exposes the local MCP server.
- `skills/seis-topic-seis-seis-technology-ontology/SKILL.md` defines the topic workflow.
- `assets/topic-profile.json` records source, audience, license, maturity, and permissions.
- `scripts/seis-topic-seis-seis-technology-ontology-mcp-server.mjs` exposes status and bounded report tools.

## Safety

Public repository availability is not authentication. Live cloud, provider, GitHub write, SSH, deployment, connector, destructive, and secret-bearing actions remain outside this package and require explicit approval in the relevant SEIS workflow.

## Validate

```bash
node plugins/seis-topics/seis-topic-seis-seis-technology-ontology/scripts/seis-topic-seis-seis-technology-ontology-mcp-server.mjs --status
npm run check:seis-topic-plugin-family
```
