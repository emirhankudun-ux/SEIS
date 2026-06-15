# SEIS-DATA Plugin

SEIS-DATA is the dedicated data and knowledge-governance lane for SEIS. It focuses Codex on schemas, analytics, generated reports, knowledge registries, RAG and memory planning, source provenance, privacy-aware transformation, and reproducible validation.

## Components

- `.codex-plugin/plugin.json` defines the Codex plugin card.
- `.mcp.json` exposes the local `seis-data` MCP server.
- `skills/seis-data/SKILL.md` carries the data workflow.
- `assets/lane-profile.json` records the lane contract and validation commands.
- `scripts/seis-data-status.mjs` prints a deterministic local readiness report.
- `scripts/seis-data-mcp-server.mjs` exposes MCP status and planning tools.

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-data
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis-data/skills/seis-data
node plugins/seis-data/scripts/seis-data-status.mjs
```

## Embedded Use

The repository marketplace publishes SEIS-Agent only. This lane is embedded at
`plugins/seis-ai-agent/skills/seis-data/SKILL.md` and installed through
`seis-ai-agent@seis-repo`; this directory remains the source mirror for focused
lane development and validation.
