# Kubernetes — SEIS Topic Plugin

This is an objective-derived public SEIS topic package for the **Cloud Computing** family. It is published directly from the SEIS repository marketplace as `seis-topic-cloud-computing-kubernetes@seis-repo`.

The package gives Codex a bounded **Kubernetes** context lane: deterministic status, repository-shape evidence, and planning boundaries. It does not call external providers, read secrets, use the network, or write files.

## Package boundary

- `.codex-plugin/plugin.json` defines the public plugin card.
- `.mcp.json` exposes the local MCP server.
- `skills/seis-topic-cloud-computing-kubernetes/SKILL.md` defines the topic workflow.
- `assets/topic-profile.json` records source, audience, license, maturity, and permissions.
- `scripts/seis-topic-cloud-computing-kubernetes-mcp-server.mjs` exposes status and bounded report tools.

## Safety

Public repository availability is not authentication. Live cloud, provider, GitHub write, SSH, deployment, connector, destructive, and secret-bearing actions remain outside this package and require explicit approval in the relevant SEIS workflow.

## Validate

```bash
node plugins/seis-topics/seis-topic-cloud-computing-kubernetes/scripts/seis-topic-cloud-computing-kubernetes-mcp-server.mjs --status
npm run check:seis-topic-plugin-family
```
