---
name: seis-workspace-inspector
description: Use the SEIS Workspace Inspector for bounded, read-only workspace metadata and technology inventory under SEIS-GOAL-021.
---

# SEIS Workspace Inspector

Use this skill for a safe first look at a local workspace before architecture, build, migration, or plugin decisions.

## Procedure

1. Read the nearest `AGENTS.md` and project manifest before making claims.
2. Run `node scripts/seis-workspace-inspector-mcp-server.mjs --status`.
3. Run `node scripts/seis-workspace-inspector-mcp-server.mjs --inspect --path <workspace>`.
4. Choose the smallest safe next task under `SEIS-GOAL-021`.

## Scope and guardrails

- Inspect only an explicit workspace root or the current working directory.
- Report root-level entries, common technology manifests, repository markers, and filename-only risk hints.
- Read-only and local-only: no writes, network, SSH, cloud, protected-branch, secrets, file contents, or symlink targets.
- Do not traverse dependency, build, cache, model-weight, or private-data directories.
- Metadata is not proof of a working build, provider, plugin, or deployment.

## MCP

- `seis_workspace_inspector_status`
- `seis_workspace_inspect`

## Handoff

Report root name, detected technologies, repository markers, risk filename count, exact command, limitations, and next safe action.
