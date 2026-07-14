# SEIS Automation Plugin

SEIS Automation is a preserved SEIS-Agent source module. SEIS Automation gives Codex a public SEIS plugin lane for repeatable scripts, checks, generators, scheduled jobs, CI steps, runbooks, agent loops, and human-approved automation gates under SEIS-Agent governance.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-automation` MCP server.
- `skills/seis-automation/SKILL.md` carries the lane workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-automation-status.mjs` prints deterministic local readiness.
- `scripts/seis-automation-mcp-server.mjs` exposes status and planning tools.

## Unified Module Use

SEIS-Agent embeds this lane through `plugins/seis-ai-agent/skills/seis-automation/SKILL.md`. The repo marketplace does not expose this module as a separate public plugin card; install `seis-ai-agent@seis-repo` instead. Public availability does not imply live credentials, external account access, deployment authority, private data access, or destructive-action permission.

## Validate

```bash
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-automation
node plugins/seis-automation/scripts/seis-automation-status.mjs
npm run check:seis-public-plugin-family
npm run check:seis-specialist-plugins
```
