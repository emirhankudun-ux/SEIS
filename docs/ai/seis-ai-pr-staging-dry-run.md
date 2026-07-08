# SEIS AI PR Staging Dry-Run

This dry-run classifies the current Git status against the AI plus Plugin/MCP PR package.
It does not stage, commit, push, merge, deploy, call providers, run SSH, download
models, or train models.

Status: staging-plan-ready-push-blocked

## Current Decision

| Field | Value |
| --- | --- |
| Dry-run only | true |
| Safe to stage selected now | false |
| Safe to commit now | false |
| Safe to push now | false |
| Safe to merge now | false |
| Non-selected dirty rows | 6 |
| Non-selected staged rows | 0 |

Reason push is blocked: The worktree has dirty files outside the AI plus Plugin/MCP PR package.

## Recommended Dry-Run Commands

```bash
# Dry-run only. Review the AI package before running any git command.
git add 'package.json' '.gitignore' 'scripts/check-seis-language-model-intake.mjs' 'scripts/create-seis-local-ai-runtime-matrix.mjs' 'content/development/seis-local-ai-runtime-matrix.json' 'docs/ai/seis-local-ai-runtime-matrix.md' 'reports/seis-model-scaling/seis-local-ai-runtime-matrix.md' 'scripts/create-seis-ai-model-ecosystem-catalog.mjs' 'content/development/seis-ai-model-ecosystem-catalog.json' 'docs/ai/seis-ai-model-ecosystem-catalog.md' 'reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json' 'reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md' 'scripts/check-seis-public-ai-readiness.mjs' 'scripts/check-seis-ai-github-readiness-chain.mjs' 'scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs' 'content/development/seis-agi-github-fresh-clone-readiness-plan.json' 'docs/ai/seis-agi-github-fresh-clone-readiness-plan.md' 'reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json' 'reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md' 'scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs' 'content/development/seis-ai-github-fresh-clone-local-smoke.json' 'docs/ai/seis-ai-github-fresh-clone-local-smoke.md' 'reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json' 'reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md' 'scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs' 'content/development/seis-plugin-mcp-ten-year-continuity-map.json' 'docs/platform/seis-plugin-mcp-ten-year-continuity-map.md' 'reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json' 'reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.md' 'docs/ai/ai-workforce-training.md' 'docs/ai/seis-agi-github-user-readiness-gates.md' '.github/workflows/seis-ai.yml' 'content/development/seis-ai-github-pr-package.json' 'docs/ai/seis-ai-github-pr-package.md' 'reports/seis-model-scaling/seis-ai-github-pr-package.json' 'reports/seis-model-scaling/seis-ai-github-pr-package.md' 'scripts/create-seis-ai-github-pr-package.mjs' 'scripts/create-seis-ai-pr-staging-dry-run.mjs' 'content/development/seis-ai-pr-staging-dry-run.json' 'docs/ai/seis-ai-pr-staging-dry-run.md' 'reports/seis-model-scaling/seis-ai-pr-staging-dry-run.json' 'reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md'
```

## Next Safe Actions

- Move this AI plus Plugin/MCP package into a clean review branch or clean worktree before staging.
- Do not run git add . in the current dirty worktree.
- Keep non-selected staged files out of the AI plus Plugin/MCP PR.
- Run npm run check:seis-ai-github-readiness-chain after the staging set is clean.
- Open a human-reviewed PR only after protected branch checks are available.
