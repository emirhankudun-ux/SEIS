# SEIS Cloud Plugin

SEIS Cloud is the dedicated cloud, deployment, and infrastructure-readiness lane for SEIS. It focuses Codex on provider-neutral deployment planning, public cloud targets for everyone, team/workplace VPN cloud targets, GCP Compute preflight, static hosting handoff, rollback contracts, cloud reports, and secret-safe automation.

## Access Model

- Public cloud is for everyone: product, documentation, release, and preview surfaces.
- VPN cloud is for workplaces and teams: private Codex remote hosts, engineering workspaces, handoff flows, and operational surfaces.
- Team VPN cloud requires approved peers, scoped source ranges, and no committed private keys.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-cloud` MCP server.
- `skills/seis-cloud/SKILL.md` carries the cloud workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-cloud-status.mjs` prints a deterministic local readiness report.
- `scripts/seis-cloud-mcp-server.mjs` exposes MCP status and planning tools.

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-cloud
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/emirhankudun/plugins/seis-cloud/skills/seis-cloud
node /Users/emirhankudun/plugins/seis-cloud/scripts/seis-cloud-status.mjs
npm run check:cloud-access-policy
```

## Install

The personal marketplace entry points at `/Users/emirhankudun/plugins/seis-cloud` as `seis-cloud@personal`.
