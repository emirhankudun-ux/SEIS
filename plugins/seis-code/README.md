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
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-code
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" plugins/seis-code/skills/seis-code
node plugins/seis-code/scripts/seis-code-status.mjs
```

## Direct Repository Card and Embedded Module Use

This root package is directly available as `seis-code@seis-repo` and remains
embedded at `plugins/seis-ai-agent/skills/seis-code/SKILL.md`. The canonical
default installation is still `seis-ai-agent@seis-repo`. Public availability
does not imply write access, GitHub authentication, dependency installation,
or deployment approval.
