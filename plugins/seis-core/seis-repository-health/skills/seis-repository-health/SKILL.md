---
name: seis-repository-health
description: Produce an honest, read-only SEIS repository hygiene snapshot before implementation, review, or release work.
---

# SEIS Repository Health

Use this skill for a bounded repository review before touching code or claiming readiness.

## Procedure

1. Run `node scripts/seis-repository-health-mcp-server.mjs --status`.
2. Run `node scripts/seis-repository-health-mcp-server.mjs --scan --path <repository>`.
3. Read the nearest `AGENTS.md` and project manifest for repository-specific gates.
4. Preserve dirty user work; do not normalize or discard it.
5. Convert material findings into a goal, blocker, risk, or review note under `SEIS-GOAL-021`.

## Scope and guardrails

- `git status` is invoked without shell interpolation and without write flags.
- Secret-risk output contains filenames only; values and file contents are never read.
- No reset, checkout, clean, commit, push, branch mutation, network, SSH, or cloud action.
- Missing files are findings, not permission to create broad governance changes automatically.

## MCP

- `seis_repository_health_status`
- `seis_repository_health_scan`

## Handoff

Report repository name, branch when safely observed, tracked dirty state, governance coverage, manifests, CI marker, findings, exact command, and worktree limitations.
