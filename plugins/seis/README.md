# SEIS Codex Plugin

This local Codex plugin makes SEIS the default operating center for the `emirhankudun-ux` GitHub ecosystem.

## Scope

- SEIS canonical repository workflow
- source repository consolidation checks
- local Codex plugin development loop
- migration and deletion safety rules
- installed Codex plugin audit and lane mapping
- SEIS-orchestrated routing for Design, Developer Tools, Productivity, Research, and Security
- Local-helper build workflow for SEIS cockpit, backend, workspace, security, mobile, desktop, and research lanes
- SEIS Repos bridge, MCP bundled install, MCP source proof, governed LLM package lanes, LLM adapter readiness, and LLM request planning
- SEIS Cloud, SEIS-Code, SEIS-Design, and SEIS-DATA specialist lanes for cloud readiness, implementation, product design, and data/knowledge work

## Local Paths

- Plugin root: `/Users/emirhankudun/plugins/seis` (fallback: auto-detected)
- Personal marketplace: `/Users/emirhankudun/.agents/plugins/marketplace.json`
- Workspace root: `/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github`

## Validate

```bash
python3 /Users/emirhankudun/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhankudun/plugins/seis
```

## Status

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-status.sh
```

## Zip Audit

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-zip-audit.sh
```

## Repository Visibility

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-repo-visibility-audit.sh
```

## Branch Sync Check

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-main-branch-sync.sh
```

## Installed Plugin Audit

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-installed-plugin-audit.sh
```

## SEIS-Orchestrated Routing

Treat `seis` as the remote policy layer for governance, branch/control-plane, and cross-plugin orchestration.
Use local helper plugins and tools as implementation lanes (OpenAI/Codex, web design, and other tooling families) while remaining under SEIS remote orchestration.
External or non-installed plugin URI families are fallback paths unless the user explicitly requests them.

Role-aware LLM planning for SEIS is documented in:

`/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS/docs/development/llm-role-routing-blueprint.md`

Bu repo içinde pratik rol akışı:

- `npm run ai -- designer "<işin özetini yaz>"` → `claude`
- `npm run ai -- engineer "<işin özetini yaz>"` → `aider`
- `npm run ai -- software "<işin özetini yaz>"` → `openai`

MCP plan endpoints:
- `seis_llm_plan_request`
- `seis_llm_role_plan_request`

## SEIS Specialist Lanes

- `skills/seis-cloud/SKILL.md` routes deployment readiness, server targets, provider preflight, rollback contracts, and secret-safe cloud automation through SEIS cloud guardrails.
- `skills/seis-code/SKILL.md` routes implementation, refactor, test, CI, MCP/plugin, platform, and automation work through SEIS engineering guardrails.
- `skills/seis-design/SKILL.md` routes UI/UX, product surfaces, design systems, accessibility, motion, and visual QA through the SEIS design constitution.
- `skills/seis-data/SKILL.md` routes data architecture, analytics, generated reports, schemas, knowledge registries, RAG/memory planning, and provenance through SEIS data governance.

## SEIS Build Workflow

Start from `docs/platform/openai-curated-build-workbench.md`, choose the module, route through the matching plugin category, and write the outcome back to SEIS under the SEIS orchestration layer. The default first module is the `apps/web` cockpit.

## SEIS Repos + LLM Package Bridge

Use `data/seis-repos-llm-bridge-2026-06-08.json` as the canonical bridge between the SEIS repository, the local `seis` plugin, the read-only MCP server, and future large-language-model package work. The bridge does not install packages; it records activation gates for remote policy work, Hugging Face research/local-web paths, Ollama local experimentation, orchestration adapters, adapter readiness checks, and request previews.

## MCP Bundle

The plugin ships `./.mcp.json` and the manifest points `mcpServers` to it, so installing the SEIS plugin brings the SEIS MCP surface and `seis-hub` skill together. The MCP launches through `scripts/seis-mcp-launcher.mjs`, which resolves the canonical SEIS MCP server path from the local environment and fallback workspace locations.
To customize search locations, set `SEIS_ROOT_HINTS` (path list, platform delimiter-separated) before launching plugin-based MCP.

```bash
/Users/emirhankudun/plugins/seis/scripts/seis-mcp-bundle-audit.sh
/Users/emirhankudun/plugins/seis/scripts/seis-mcp-bundle-audit.sh --strict
```

## Bundle Sync (Repo -> Local Plugin)

From repo root:

```bash
npm run sync:seis-plugin-bundle
```

Use optional flags if your local plugin path differs:

```bash
node scripts/sync-seis-plugin-bundle.mjs --local /absolute/path/to/plugins/seis --source /absolute/path/to/SEIS
```

## Bundle Refresh (Sync + Reinstall Cache)

One-shot refresh for repository changes and local plugin cache refresh:

```bash
npm run refresh:seis-plugin-bundle -- --install
```

This command:

- syncs `plugins/seis` from repo -> local plugin,
- regenerates cachebuster in the local plugin manifest,
- and runs `codex plugin add seis@personal`.

Optional flags:

```bash
node scripts/refresh-seis-plugin-bundle.mjs \
  --source /absolute/path/to/SEIS \
  --local /absolute/path/to/plugins/seis \
  --marketplace personal \
  --plugin seis \
  --install \
  --check \
  --no-sync
```

### Preflight check only

```bash
node scripts/refresh-seis-plugin-bundle.mjs \
  --source /absolute/path/to/SEIS \
  --local /absolute/path/to/plugins/seis \
  --check-only
```
