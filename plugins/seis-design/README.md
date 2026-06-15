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
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-design
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis-design/skills/seis-design
node plugins/seis-design/scripts/seis-design-status.mjs
```

## Embedded Use

The repository marketplace publishes SEIS-Agent only. This lane is embedded at
`plugins/seis-ai-agent/skills/seis-design/SKILL.md` and installed through
`seis-ai-agent@seis-repo`; this directory remains the source mirror for focused
lane development and validation.
