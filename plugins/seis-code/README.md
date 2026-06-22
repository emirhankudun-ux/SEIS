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
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-code
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis-code/skills/seis-code
node plugins/seis-code/scripts/seis-code-status.mjs
```

## Embedded Use

The repository marketplace publishes SEIS-Agent only. This lane is embedded at
`plugins/seis-ai-agent/skills/seis-code/SKILL.md` and installed through
`seis-ai-agent@seis-repo`; this directory remains the source mirror for focused
lane development and validation.
