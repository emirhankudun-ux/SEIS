# SEIS-Code Plugin

SEIS-Code is the dedicated engineering lane for SEIS. It focuses Codex on architecture-aware implementation, refactors, tests, CI quality gates, MCP/plugin engineering, Apple-first platform packages, and rollback-safe repository automation.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-code` MCP server.
- `skills/seis-code/SKILL.md` carries the engineering workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-code-status.mjs` prints a deterministic local readiness report.
- `scripts/seis-code-mcp-server.mjs` exposes MCP status and planning tools.

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-code
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/emirhankudun/plugins/seis-code/skills/seis-code
node /Users/emirhankudun/plugins/seis-code/scripts/seis-code-status.mjs
```

## Install

The personal marketplace entry points at `/Users/emirhankudun/plugins/seis-code` as `seis-code@personal`.
