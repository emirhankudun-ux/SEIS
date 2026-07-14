# SEIS Specialist Plugins

Date: 2026-07-12

SEIS now exposes `seis-ai-agent` as the one public repo marketplace plugin.
The core governance lane and specialist package folders remain preserved source
modules embedded into that agent: `seis`, `seis-cloud`, `seis-code`,
`seis-design`, `seis-data`, `seis-security`, `seis-research`,
`seis-automation`, and `seis-product`.

The canonical local marketplace is repo-contained at `.agents/plugins/marketplace.json` with marketplace name `seis-repo`. The older `personal` marketplace can remain installed as a compatibility mirror, but SEIS repo development should use the repo marketplace as the source of truth.

## Consolidation Rule

- Primary orchestrator plugin: `seis-ai-agent@seis-repo`.
- Embedded governance module: `seis`.
- Embedded specialist modules: `seis-cloud`, `seis-code`, `seis-design`,
  `seis-data`, `seis-security`, `seis-research`, `seis-automation`, and
  `seis-product`.
- Legacy duplicate source: `personal` marketplace, compatibility mirror only.
- Standalone lane cards: not published. Source modules are routed through the
  installed SEIS-Agent package.
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
| `seis-security` | Threat modeling, secrets hygiene, release risk review, and safe gating posture. | `plugins/seis-ai-agent/skills/seis-security/SKILL.md` | `plugins/seis-security` |
| `seis-research` | Official source review, version context, evidence synthesis, and policy-aligned recommendations. | `plugins/seis-ai-agent/skills/seis-research/SKILL.md` | `plugins/seis-research` |
| `seis-automation` | Repeatable workflow planning, script/runbook scaffolding, and noise-reduced execution gating. | `plugins/seis-ai-agent/skills/seis-automation/SKILL.md` | `plugins/seis-automation` |
| `seis-product` | Roadmap packaging, acceptance criteria, launch-readiness scope, and product governance signals. | `plugins/seis-ai-agent/skills/seis-product/SKILL.md` | `plugins/seis-product` |
| `seis-plugin-runtime` | Plugin manifest health, capability lane drift checks, and safe release-readiness evidence. | `plugins/seis/skills/seis-plugin-runtime/SKILL.md` | `plugins/seis` |
| `seis-mcp-runtime` | MCP endpoint compatibility, tool boundary checks, and runtime connector safety evidence. | `plugins/seis/skills/seis-mcp-runtime/SKILL.md` | `plugins/seis` |

## Contract

Each source mirror retains:

- `.codex-plugin/plugin.json` for source-module validation and provenance.
- `.mcp.json` for a source-module MCP contract.
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

The public plugin family contract is generated at
`content/development/seis-public-plugin-family.json`, summarized at
`reports/seis-public-plugin-family.md`, and connected to SEIS-Agent through
`plugins/seis-ai-agent/scripts/seis-ai-agent-mcp-server.mjs`.

The long-horizon release, compatibility, support-tier, and public-preview
approval lifecycle is generated at
`content/development/seis-public-plugin-lifecycle.json` and summarized at
`reports/seis-public-plugin-lifecycle.md`.

SEIS Cloud additionally carries the cloud access policy: public cloud is for
everyone-facing surfaces, while VPN cloud is only for workplaces and teams with
approved peer access.

## Marketplace

The repo marketplace file is `.agents/plugins/marketplace.json`. It contains
only the public SEIS-Agent plugin:

- `seis-ai-agent@seis-repo`

Availability means the SEIS-Agent plugin card is installable from the repo marketplace.
The embedded source modules are available through its lane tools rather than
separate install ids.
It does not mean live OAuth/account access, cloud credentials, SSH access,
deployment authority, private dataset access, or destructive action permission.

## Validate

```bash
npm run check:seis-public-plugin-family
npm run check:seis-public-plugin-lifecycle
npm run check:seis-public-plugin-install-smoke
npm run check:seis-public-plugin-install-smoke:mcp
npm run check:seis-public-plugin-install-smoke:local
npm run check:seis-public-plugin-install-smoke:local:mcp
npm run check:seis-specialist-plugins
npm run check:seis-specialist-plugins -- --include-legacy-personal
npm run check:seis-ai-agent
npm run check:seis-agent-plugin-integration
npm run quality:governance
```

### Legacy personal-source verification

`npm run check:seis-specialist-plugins -- --include-legacy-personal` is an
optional local migration audit. It discovers only SEIS-named source packages
that are actually present in configured plugin roots, `~/plugins`, or every
readable version in the Codex personal cache. It does not require newer
repo-only lanes to exist in a legacy cache and does not execute local cache MCP
scripts.

For every discovered legacy source, the audit verifies that the public repo has
the same source paths, that the repo manifest is MIT-licensed, and that no
sensitive local path such as an env file, private key, or credential file is
eligible for promotion. Legacy local manifests may remain `UNLICENSED`; they
are source evidence rather than public installation surfaces.

When sources are found, the command prints a concise source-root, package-name,
and discovery-origin summary without exposing absolute local paths. The
documented reconciliation decision for the known legacy sources lives in
[SEIS Legacy Personal Plugin Reconciliation](./seis-legacy-personal-plugin-reconciliation.md).

For plugin ingestion checks:

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-ai-agent
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-cloud
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-code
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-design
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-data
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-security
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-research
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-automation
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/seis-product
```

If system Python lacks `PyYAML`, use a temporary validation environment.

## Source Evidence

SEIS Cloud was promoted from the local plugin evidence intake. Private local folders, screenshots, archives, and machine-specific metadata are intentionally excluded from the public repository.
The curated intake record is [`data/seis-plugin-package-intake-2026-06-13.json`](../../data/seis-plugin-package-intake-2026-06-13.json), with a reader-facing summary at [`docs/platform/seis-plugin-package-intake.md`](./seis-plugin-package-intake.md).
