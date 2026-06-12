# SEIS-Design Plugin

SEIS-Design is the dedicated product design lane for SEIS. It focuses Codex on UI/UX architecture, design systems, accessibility, calm motion, responsive ergonomics, visual QA, and implementation-aware handoff.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-design` MCP server.
- `skills/seis-design/SKILL.md` carries the design workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-design-status.mjs` prints a deterministic local readiness report.
- `scripts/seis-design-mcp-server.mjs` exposes MCP status and planning tools.

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-design
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/emirhankudun/plugins/seis-design/skills/seis-design
node /Users/emirhankudun/plugins/seis-design/scripts/seis-design-status.mjs
```

## Install

The personal marketplace entry points at `/Users/emirhankudun/plugins/seis-design` as `seis-design@personal`.
