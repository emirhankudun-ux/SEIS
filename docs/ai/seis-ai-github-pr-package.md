# SEIS AI + Plugin/MCP GitHub PR Package

This package defines the AI plus Plugin/MCP PR slice for SEIS readiness work.
It is designed to keep 512B and AGI roadmap work reviewable without mixing in
unrelated Desktop, product-demo, SSH, or public-demo changes.

Status: ready-for-ai-plugin-mcp-pr-review-not-ready-for-push

## Current Decision

| Field | Value |
| --- | --- |
| Package ready for review | true |
| Safe to push now | false |
| Safe to merge now | false |
| Selected AI files | 42 |
| Missing selected files | 0 |

Reason push is blocked: The worktree contains unrelated modified and untracked files. Stage only the selected AI files in a clean review branch before push.

## Selected AI Files

- `package.json` - script wiring for AI readiness checks
- `.gitignore` - tracked report JSON allowlist for AI readiness evidence
- `scripts/check-seis-language-model-intake.mjs` - language model intake guardrail linked to the model ecosystem catalog
- `scripts/create-seis-local-ai-runtime-matrix.mjs` - local AI runtime matrix generator
- `content/development/seis-local-ai-runtime-matrix.json` - local runtime matrix source record
- `docs/ai/seis-local-ai-runtime-matrix.md` - local runtime matrix docs
- `reports/seis-model-scaling/seis-local-ai-runtime-matrix.md` - local runtime matrix markdown report
- `scripts/create-seis-ai-model-ecosystem-catalog.mjs` - AI model ecosystem catalog generator and validator
- `content/development/seis-ai-model-ecosystem-catalog.json` - AI model ecosystem metadata catalog
- `docs/ai/seis-ai-model-ecosystem-catalog.md` - AI model ecosystem catalog docs
- `reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.json` - AI model ecosystem catalog JSON report
- `reports/seis-model-scaling/seis-ai-model-ecosystem-catalog.md` - AI model ecosystem catalog markdown report
- `scripts/check-seis-public-ai-readiness.mjs` - public AI claim and source-of-truth guardrail
- `scripts/check-seis-ai-github-readiness-chain.mjs` - one-command local AI GitHub readiness chain
- `scripts/create-seis-agi-github-fresh-clone-readiness-plan.mjs` - fresh-clone readiness plan generator
- `content/development/seis-agi-github-fresh-clone-readiness-plan.json` - fresh-clone readiness plan source record
- `docs/ai/seis-agi-github-fresh-clone-readiness-plan.md` - fresh-clone readiness docs
- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.json` - fresh-clone readiness JSON report
- `reports/seis-model-scaling/seis-agi-github-fresh-clone-readiness-plan.md` - fresh-clone readiness markdown report
- `scripts/create-seis-ai-github-fresh-clone-local-smoke.mjs` - fresh-clone local smoke generator and validator
- `content/development/seis-ai-github-fresh-clone-local-smoke.json` - fresh-clone local smoke source record
- `docs/ai/seis-ai-github-fresh-clone-local-smoke.md` - fresh-clone local smoke docs
- `reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.json` - fresh-clone local smoke JSON report
- `reports/seis-model-scaling/seis-ai-github-fresh-clone-local-smoke.md` - fresh-clone local smoke markdown report
- `scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs` - Plugin/MCP ten-year continuity map generator
- `content/development/seis-plugin-mcp-ten-year-continuity-map.json` - Plugin/MCP continuity source contract
- `docs/platform/seis-plugin-mcp-ten-year-continuity-map.md` - Plugin/MCP continuity platform docs
- `reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.json` - Plugin/MCP continuity JSON report
- `reports/seis-public-demo/plugin-mcp-ten-year-continuity-map-latest.md` - Plugin/MCP continuity markdown report
- `docs/ai/ai-workforce-training.md` - AI workforce docs with no-key readiness commands
- `docs/ai/seis-agi-github-user-readiness-gates.md` - GitHub user readiness docs with blocker commands
- `.github/workflows/seis-ai.yml` - no-key AI plus Plugin/MCP GitHub Actions readiness workflow
- `content/development/seis-ai-github-pr-package.json` - this AI plus Plugin/MCP PR package contract
- `docs/ai/seis-ai-github-pr-package.md` - human-readable AI plus Plugin/MCP PR package docs
- `reports/seis-model-scaling/seis-ai-github-pr-package.json` - AI plus Plugin/MCP PR package JSON report
- `reports/seis-model-scaling/seis-ai-github-pr-package.md` - AI plus Plugin/MCP PR package markdown report
- `scripts/create-seis-ai-github-pr-package.mjs` - AI plus Plugin/MCP PR package generator and validator
- `scripts/create-seis-ai-pr-staging-dry-run.mjs` - AI plus Plugin/MCP staging dry-run generator and validator
- `content/development/seis-ai-pr-staging-dry-run.json` - AI plus Plugin/MCP staging dry-run source record
- `docs/ai/seis-ai-pr-staging-dry-run.md` - AI plus Plugin/MCP staging dry-run docs
- `reports/seis-model-scaling/seis-ai-pr-staging-dry-run.json` - AI plus Plugin/MCP staging dry-run JSON report
- `reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md` - AI plus Plugin/MCP staging dry-run markdown report

## Required Validation

```bash
npm run report:seis-ai-github-pr-package
npm run check:seis-ai-github-pr-package
npm run report:seis-ai-model-ecosystem-catalog
npm run check:seis-ai-model-ecosystem-catalog
npm run report:seis-ai-pr-staging-dry-run
npm run check:seis-ai-pr-staging-dry-run
npm run check:seis-ai-github-fresh-clone-local-smoke
npm run check:seis-ai-github-readiness-chain
npm run check:seis-plugin-mcp-ten-year-continuity-map
npm run check:seis-public-ai-readiness
npm run check:seis-agi-github-fresh-clone-readiness-plan
```

## Forbidden Without Approval

- git push
- git merge
- force push
- branch deletion
- model download
- Ollama pull
- dataset download
- training
- fine-tuning
- inference benchmark
- cloud/GPU provisioning
- provider API call
- SSH execution
- deployment
- release publication

## Next Human-Reviewed Steps

- Move the selected AI files into a clean review branch or clean worktree.
- Run npm run check:seis-ai-github-readiness-chain.
- Confirm Plugin/MCP continuity artifacts match npm run check:seis-plugin-mcp-ten-year-continuity-map.
- Confirm no selected file contains secrets or model artifacts.
- Open a PR with protected-branch checks and human review.
- Keep unrelated Desktop, product-demo, platform, and public-demo files out of the AI plus Plugin/MCP readiness PR.
