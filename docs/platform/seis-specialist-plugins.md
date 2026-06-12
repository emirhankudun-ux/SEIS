# SEIS Specialist Plugins

Date: 2026-06-12

SEIS now exposes three specialist Codex plugins in addition to the central `seis@personal` governance plugin.

## Plugin Cards

| Plugin | Purpose | Repo mirror | Local root |
|---|---|---|---|
| `seis-code` | Architecture-aware implementation, refactors, tests, CI, MCP/plugin code, and repo automation. | `plugins/seis-code` | `/Users/emirhankudun/plugins/seis-code` |
| `seis-design` | Product design, UI/UX, design systems, accessibility, motion, visual QA, and design handoff. | `plugins/seis-design` | `/Users/emirhankudun/plugins/seis-design` |
| `seis-data` | Data architecture, analytics, reports, schemas, knowledge registries, RAG/memory planning, and provenance. | `plugins/seis-data` | `/Users/emirhankudun/plugins/seis-data` |

Installed cache roots:

- `/Users/emirhankudun/.codex/plugins/cache/personal/seis-code/0.1.0`
- `/Users/emirhankudun/.codex/plugins/cache/personal/seis-design/0.1.0`
- `/Users/emirhankudun/.codex/plugins/cache/personal/seis-data/0.1.0`

## Contract

Each specialist plugin includes:

- `.codex-plugin/plugin.json` for the Codex plugin card.
- `.mcp.json` for a plugin-local MCP server.
- `skills/<plugin>/SKILL.md` for the specialist workflow.
- `skills/<plugin>/agents/openai.yaml` for UI metadata.
- `assets/lane-profile.json` for deterministic lane governance.
- `scripts/<plugin>-status.mjs` for readiness checks.
- `scripts/<plugin>-mcp-server.mjs` for status and planning MCP tools.

The central `seis` MCP server also exposes:

- `seis_specialist_lanes`
- `seis_specialist_lane_status`
- `seis_specialist_lane_plan`

## Marketplace

The personal marketplace file is `/Users/emirhankudun/.agents/plugins/marketplace.json`.
It contains local entries for:

- `seis-code@personal`
- `seis-design@personal`
- `seis-data@personal`

## Validate

```bash
npm run check:seis-specialist-plugins
```

For plugin ingestion checks:

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-code
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-design
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis-data
```

If system Python lacks `PyYAML`, use a temporary validation environment.
