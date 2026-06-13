# SEIS Specialist Plugins

Date: 2026-06-13

SEIS now exposes four specialist Codex plugins in addition to the central `seis` governance plugin.

The canonical local marketplace is repo-contained at `.agents/plugins/marketplace.json` with marketplace name `seis-repo`. The older `personal` marketplace can remain installed as a compatibility mirror, but SEIS repo development should use the repo marketplace as the source of truth.

## Plugin Cards

| Plugin | Purpose | Repo root | Install id |
|---|---|---|---|
| `seis-cloud` | Public cloud for everyone, team/workplace VPN cloud, provider-neutral deployment readiness, server target selection, cloud preflight, rollback planning, and secret-safe infrastructure automation. | `plugins/seis-cloud` | `seis-cloud@seis-repo` |
| `seis-code` | Architecture-aware implementation, refactors, tests, CI, MCP/plugin code, and repo automation. | `plugins/seis-code` | `seis-code@seis-repo` |
| `seis-design` | Product design, UI/UX, design systems, accessibility, motion, visual QA, and design handoff. | `plugins/seis-design` | `seis-design@seis-repo` |
| `seis-data` | Data architecture, analytics, reports, schemas, knowledge registries, RAG/memory planning, and provenance. | `plugins/seis-data` | `seis-data@seis-repo` |

Repo marketplace install ids:

- `seis-cloud@seis-repo`
- `seis-code@seis-repo`
- `seis-design@seis-repo`
- `seis-data@seis-repo`

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

SEIS Cloud additionally carries the cloud access policy: public cloud is for
everyone-facing surfaces, while VPN cloud is only for workplaces and teams with
approved peer access.

## Marketplace

The repo marketplace file is `.agents/plugins/marketplace.json`. It contains local entries for:

- `seis-cloud@seis-repo`
- `seis-code@seis-repo`
- `seis-design@seis-repo`
- `seis-data@seis-repo`

## Validate

```bash
npm run check:seis-specialist-plugins
```

For plugin ingestion checks:

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-cloud
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-code
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-design
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-data
```

If system Python lacks `PyYAML`, use a temporary validation environment.

## Source Evidence

SEIS Cloud was promoted from the local plugin evidence folder at `/Users/emirhankudun/Downloads/SEIS Eklenti paketi to Repo`.
The curated intake record is [`data/seis-plugin-package-intake-2026-06-13.json`](../../data/seis-plugin-package-intake-2026-06-13.json), with a reader-facing summary at [`docs/platform/seis-plugin-package-intake.md`](./seis-plugin-package-intake.md).
