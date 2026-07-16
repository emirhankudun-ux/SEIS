# SEIS Research Plugin

SEIS Research is a preserved SEIS-Agent source module. SEIS Research gives Codex a public SEIS plugin lane for official-source research, standards and version checks, source evaluation, product and architecture discovery, ecosystem analysis, and research-to-decision synthesis under SEIS-Agent governance.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-research` MCP server.
- `skills/seis-research/SKILL.md` carries the lane workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-research-status.mjs` prints deterministic local readiness.
- `scripts/seis-research-mcp-server.mjs` exposes status and planning tools.

## Unified Module Use

SEIS-Agent embeds this lane through `plugins/seis-ai-agent/skills/seis-research/SKILL.md`. The repo marketplace does not expose this module as a separate public plugin card; install `seis-ai-agent@seis-repo` instead. Public availability does not imply live credentials, external account access, deployment authority, private data access, or destructive-action permission.

## Validate

```bash
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-research
node plugins/seis-research/scripts/seis-research-status.mjs
npm run check:seis-public-plugin-family
npm run check:seis-specialist-plugins
```
