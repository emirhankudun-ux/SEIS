# SEIS Codex Plugin

Date: 2026-06-05

The unified `seis-ai-agent` Codex plugin connects Codex work back to the
canonical SEIS repository and gives future SEIS development a stable plugin
workflow. The older `seis` plugin remains a repo-contained governance lane for
compatibility and focused debugging.

## Local Plugin

| Field | Value |
|---|---|
| Plugin name | `seis-ai-agent` |
| Repo plugin root | `plugins/seis-ai-agent` |
| Repo marketplace | `.agents/plugins/marketplace.json` |
| Installed plugin | `seis-ai-agent@seis-repo` |
| Optional governance lane | `seis@seis-repo` |

## Current Components

- `.codex-plugin/plugin.json` defines the plugin manifest.
- `skills/seis-hub/SKILL.md` defines the SEIS-centered Codex workflow.
- `skills/seis-cloud/SKILL.md` defines the SEIS cloud and deployment readiness lane.
- `skills/seis-code/SKILL.md` defines the SEIS engineering and implementation lane.
- `skills/seis-design/SKILL.md` defines the SEIS product design and design-system lane.
- `skills/seis-data/SKILL.md` defines the SEIS data, analytics, and knowledge-governance lane.
- `scripts/seis-status.sh` reports local SEIS/plugin/GitHub auth status.
- `scripts/seis-zip-audit.sh` audits large workspace zip files before import.
- `scripts/seis-repo-visibility-audit.sh` checks old repository visibility.
- `scripts/seis-main-branch-sync.sh` checks or performs a `main` branch mirror sync.
- `README.md` documents local validation and status commands.

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/seis
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis/skills/seis-hub
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis/skills/seis-cloud
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis/skills/seis-code
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis/skills/seis-design
python3 /Users/emirhankudun/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/seis/skills/seis-data
bash -n plugins/seis/scripts/seis-status.sh
bash -n plugins/seis/scripts/seis-zip-audit.sh
bash -n plugins/seis/scripts/seis-repo-visibility-audit.sh
bash -n plugins/seis/scripts/seis-main-branch-sync.sh
```

If the system Python does not have `PyYAML`, use a temporary validation venv.

## Install Or Refresh

Default install plan:

```bash
npm run install:seis-ai-agent
```

Apply the install only after reviewing the plan:

```bash
npm run install:seis-ai-agent -- --apply
```

Install standalone lane cards only for marketplace or MCP debugging:

```bash
npm run install:seis-ai-agent -- --with-lanes
```

Start a new Codex thread after reinstalling so new skills and tools are picked up.

## Source Sync

Develop inside SEIS under `plugins/seis-ai-agent` and the specialist lane
packages; Codex installs from the repo-contained `seis-repo` marketplace so Git
remains the source of truth. The older `/Users/emirhankudun/plugins/seis`
mirror is only a compatibility copy when needed.

## Zip Audit

```bash
COMPUTE_HASH=1 /Users/emirhankudun/plugins/seis/scripts/seis-zip-audit.sh
```

For `Github.zip`, SEIS stores the audit at:

- [`data/github-zip-import-inventory.json`](../data/github-zip-import-inventory.json)
- [`docs/github-zip-import-decision.md`](./github-zip-import-decision.md)

## Repository Visibility Audit

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-repo-visibility-audit.sh
```

SEIS stores the current connector-backed audit at:

- [`data/repository-visibility-audit-2026-06-05.json`](../data/repository-visibility-audit-2026-06-05.json)
- [`docs/repository-visibility-and-main-sync.md`](./repository-visibility-and-main-sync.md)

## Main Branch Sync

Dry-run:

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-main-branch-sync.sh
```

Authenticated local sync:

```bash
DRY_RUN=0 /Users/emirhankudun/plugins/seis/scripts/seis-main-branch-sync.sh
```

The GitHub connector can also force-update `main` to the canonical branch SHA when local push auth is unavailable.

## Specialist Lanes

The unified `seis-ai-agent@seis-repo` plugin is the primary SEIS surface. It
composes SEIS governance plus four specialist lanes. The repo marketplace keeps
each standalone lane card available for focused plugin debugging, but normal
work should start from SEIS-Agent:

- SEIS Cloud: provider-neutral deployment readiness, server target selection, cloud preflight, rollback planning, and secret-safe infrastructure automation.
- SEIS-Code: code architecture, implementation, refactors, tests, CI, MCP/plugin code, and platform packages.
- SEIS-Design: product design, UI/UX, design systems, accessibility, motion, visual QA, and design handoff.
- SEIS-DATA: data architecture, analytics, reports, schemas, knowledge registries, RAG/memory planning, and provenance.

Optional standalone plugin packages:

| Plugin | Repo root | Install id | MCP tools |
|---|---|---|---|
| `seis-cloud` | `plugins/seis-cloud` | `seis-cloud@seis-repo` | `seis_cloud_status`, `seis_cloud_plan` |
| `seis-code` | `plugins/seis-code` | `seis-code@seis-repo` | `seis_code_status`, `seis_code_plan` |
| `seis-design` | `plugins/seis-design` | `seis-design@seis-repo` | `seis_design_status`, `seis_design_plan` |
| `seis-data` | `plugins/seis-data` | `seis-data@seis-repo` | `seis_data_status`, `seis_data_plan` |

The central `seis` MCP server additionally exposes `seis_specialist_lanes`, `seis_specialist_lane_status`, and `seis_specialist_lane_plan`.

Specialist plugin governance is tracked in:

- [`data/seis-specialist-plugins-2026-06-12.json`](../data/seis-specialist-plugins-2026-06-12.json)
- [`docs/platform/seis-specialist-plugins.md`](./platform/seis-specialist-plugins.md)

## Next Development Targets

- add SEIS migration verification helpers
- add GitHub auth readiness checks
- add a repo snapshot integrity report
- add richer MCP write tools for the specialist lanes only after cloud, command shapes, and safety gates are stable

## Safety Rule

The plugin must preserve the SEIS deletion gate: old repositories are not deleted until branch refs and repository snapshots are verified inside SEIS.
