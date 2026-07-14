# SEIS Security Plugin

SEIS Security is a preserved SEIS-Agent source module. SEIS Security gives Codex a public SEIS plugin lane for threat modeling, secret-safety review, dependency and permission risk, CI/security gates, cloud access safety, SSH/VPN hardening, and release-blocking security checks under SEIS-Agent governance.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-security` MCP server.
- `skills/seis-security/SKILL.md` carries the lane workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-security-status.mjs` prints deterministic local readiness.
- `scripts/seis-security-mcp-server.mjs` exposes status and planning tools.

## Unified Module Use

SEIS-Agent embeds this lane through `plugins/seis-ai-agent/skills/seis-security/SKILL.md`. The repo marketplace does not expose this module as a separate public plugin card; install `seis-ai-agent@seis-repo` instead. Public availability does not imply live credentials, external account access, deployment authority, private data access, or destructive-action permission.

## Validate

```bash
python3 ${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-security
node plugins/seis-security/scripts/seis-security-status.mjs
npm run check:seis-public-plugin-family
npm run check:seis-specialist-plugins
```
