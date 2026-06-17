# SEIS Codex Plugin

This local Codex plugin makes SEIS the default operating center for the `emirhankudun-ux` GitHub ecosystem.

## Scope

- SEIS canonical repository workflow
- source repository consolidation checks
- local Codex plugin development loop
- migration and deletion safety rules
- installed Codex plugin audit and lane mapping
- OpenAI-first plugin routing for Design, Developer Tools, Productivity, Research, and Security
- OpenAI-curated build workflow for SEIS cockpit, backend, workspace, security, mobile, desktop, and research lanes

## Local Paths

- Plugin root: `/Users/emirhankudun/plugins/seis`
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

## OpenAI-First Routing

Use `openai-curated`, `openai-bundled`, and `openai-primary-runtime` plugin families first for core SEIS work. External or non-installed plugin URI families are fallback paths unless the user explicitly requests them.

## OpenAI-curated Build Workflow

Start from `docs/platform/openai-curated-build-workbench.md`, choose the module, route through the matching OpenAI/Codex plugin category, and write the outcome back to SEIS. The default first module is the `apps/web` cockpit.
