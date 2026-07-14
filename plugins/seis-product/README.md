# SEIS Product Plugin

SEIS Product is a preserved SEIS-Agent source module. SEIS Product gives Codex a public SEIS plugin lane for product requirements, roadmap slices, acceptance criteria, UX outcomes, launch readiness, open-source positioning, prioritization, and validation-backed delivery plans under SEIS-Agent governance.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-product` MCP server.
- `skills/seis-product/SKILL.md` carries the lane workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-product-status.mjs` prints deterministic local readiness.
- `scripts/seis-product-mcp-server.mjs` exposes status and planning tools.

## Unified Module Use

SEIS-Agent embeds this lane through `plugins/seis-ai-agent/skills/seis-product/SKILL.md`. The repo marketplace does not expose this module as a separate public plugin card; install `seis-ai-agent@seis-repo` instead. Public availability does not imply live credentials, external account access, deployment authority, private data access, or destructive-action permission.

## Validate

```bash
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-product
node plugins/seis-product/scripts/seis-product-status.mjs
npm run check:seis-public-plugin-family
npm run check:seis-specialist-plugins
```
