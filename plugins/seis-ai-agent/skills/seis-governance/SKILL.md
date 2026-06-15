---
name: seis-governance
description: Use SEIS governance and operating-policy workflows for SEIS-Agent releases, marketplace policy, identity checks, and source-of-truth validation.
---

# SEIS Governance

Use this skill when a request affects repository governance, branch policy, installation surfaces, operating identities, release gating, or SEIS plugin ecosystem safety.

## Canonical Context

- Canonical GitHub repository: `emirhankudun-ux/SEIS`
- Canonical default branch: `main`
- Local workspace root: `/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github`
- Repo plugin root: `plugins/seis-ai-agent`
- Repo marketplace: `.agents/plugins/marketplace.json`
- Primary install ID: `seis-ai-agent@seis-repo`
- Legacy standalone plugin IDs: `seis@seis-repo`, `seis-cloud@seis-repo`, `seis-code@seis-repo`, `seis-design@seis-repo`, `seis-data@seis-repo` (compatibility only)

## Operating Rules

1. Inspect repository state before any governance or release-facing change.
2. Keep main branch as the single canonical public branch.
3. Preserve user work and never discard uncommitted local edits.
4. Keep all policy updates reproducible by using manifests, scripts, and generated reports.
5. Do not publish standalone lane IDs as separate repo marketplace plugins.
6. Do not expose tokens or secrets in logs, outputs, or status comments.
7. Keep source evidence updated when governance assumptions change.

## Governance Workflow

1. `git status --short` and branch context are checked before change.
2. Repository identity and plugin surfaces are compared against `.agents/plugins/marketplace.json`, `data/seis-operating-identities.json`, and `data/installed-codex-plugins-2026-06-15.json`.
3. Consolidation and marketplace expectations are validated against `scripts/install-seis-ai-agent.mjs` and `plugins/seis-ai-agent/assets/agent-profile.json`.
4. Required quality gates are listed from `plugins/seis-ai-agent/assets/agent-profile.json` and validated when changes touch release-facing files.
5. Decisions are handed off with explicit evidence references and a stable apply plan.

## Checks

```bash
npm run check:open-source-governance
npm run check:foundation
npm run check:seis-operating-identities
npm run check:seis-repo-marketplace
npm run check:seis-ai-agent
```

## Release Decision Policy

Do not claim readiness until:

- `plugins/seis-ai-agent` checks pass with lane readiness.
- `npm run quality` passes or the user requests a reduced scope run.
- GitHub checks are reviewed if any repository-facing files changed.

No apply/deployment actions should be considered complete without explicit confirmation.
