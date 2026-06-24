# SEIS Specialist Plugins

Date: 2026-06-15

SEIS now keeps four specialist lane packages plus a governance core and a
governance-operating lane as embedded skills inside the unified
`seis-ai-agent@seis-repo` plugin. The repo marketplace
publishes one user-facing plugin card: SEIS-Agent.

The canonical local marketplace is repo-contained at `.agents/plugins/marketplace.json` with marketplace name `seis-repo`. The older `personal` marketplace can remain installed as a compatibility mirror, but SEIS repo development should use the repo marketplace as the source of truth.

## Consolidation Rule

- Primary visible plugin: `seis-ai-agent@seis-repo`.
- Legacy duplicate source: `personal` marketplace, compatibility mirror only.
- Standalone lane cards: disabled for normal repo marketplace publishing.
- Source mirrors stay in `plugins/` so each lane keeps its skill, MCP server,
  profile, and validation contract under repo control while SEIS-Agent embeds
  the active skills and lane profiles.

## Embedded Lanes

| Lane | Purpose | Embedded skill | Source mirror |
|---|---|---|---|
| `seis` | Repository governance, architecture documentation alignment, migration safety, and quality-forward policy coordination. | `plugins/seis-ai-agent/skills/seis-hub/SKILL.md` | `plugins/seis` |
| `seis-governance` | Release readiness, marketplace policy validation, identity checks, branch discipline, and operating contract evidence. | `plugins/seis-ai-agent/skills/seis-governance/SKILL.md` | `plugins/seis` |
| `seis-cloud` | Public cloud for everyone, team/workplace VPN cloud, provider-neutral deployment readiness, server target selection, cloud preflight, rollback planning, and secret-safe infrastructure automation. | `plugins/seis-ai-agent/skills/seis-cloud/SKILL.md` | `plugins/seis-cloud` |
| `seis-code` | Architecture-aware implementation, refactors, tests, CI, MCP/plugin code, and repo automation. | `plugins/seis-ai-agent/skills/seis-code/SKILL.md` | `plugins/seis-code` |
| `seis-design` | Product design, UI/UX, design systems, accessibility, motion, visual QA, and design handoff. | `plugins/seis-ai-agent/skills/seis-design/SKILL.md` | `plugins/seis-design` |
| `seis-data` | Data architecture, analytics, reports, schemas, knowledge registries, RAG/memory planning, and provenance. | `plugins/seis-ai-agent/skills/seis-data/SKILL.md` | `plugins/seis-data` |

## Contract

Each source mirror includes:

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

The SEIS AI runtime and app shell consume the same lane fabric through
`content/development/seis-agent-plugin-integration.json`, the
`seis_plugin_integration` tool, and the
`seis://agent/plugin-integration.json` MCP resource.

The `packages/seis-ai` agent loop and MCP server also expose the personal
embedded lanes directly as read-only status and plan-only tools:
`seis_hub_status`, `seis_hub_plan`, `seis_cloud_status`, `seis_cloud_plan`,
`seis_code_status`, `seis_code_plan`, `seis_design_status`,
`seis_design_plan`, `seis_data_status`, and `seis_data_plan`.

SEIS Cloud additionally carries the cloud access policy: public cloud is for
everyone-facing surfaces, while VPN cloud is only for workplaces and teams with
approved peer access.

## Marketplace

The repo marketplace file is `.agents/plugins/marketplace.json`. It contains
exactly one canonical entry:

- `seis-ai-agent@seis-repo`

## Validate

```bash
npm run check:seis-specialist-plugins
npm run check:seis-specialist-plugins -- --include-legacy-personal
npm run check:seis-ai-agent
npm run check:seis-agent-plugin-integration
npm run quality:governance
```

For plugin ingestion checks:

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis-ai-agent
```

If system Python lacks `PyYAML`, use a temporary validation environment.

## Source Evidence

SEIS Cloud was promoted from the local plugin evidence folder at `/Users/emirhankudun/Downloads/SEIS Eklenti paketi to Repo`.
The curated intake record is [`data/seis-plugin-package-intake-2026-06-13.json`](../../data/seis-plugin-package-intake-2026-06-13.json), with a reader-facing summary at [`docs/platform/seis-plugin-package-intake.md`](./seis-plugin-package-intake.md).
