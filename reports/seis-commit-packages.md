# SEIS Commit Package Plan

Generated: 2026-06-19T06:17:32.925Z
Mode: read-only-git-status
Branch: codex/publish-local-seis-20260618-163043
Upstream: origin/codex/publish-local-seis-20260618-163043
Status: ## codex/publish-local-seis-20260618-163043...origin/codex/publish-local-seis-20260618-163043 [ahead 5]

## Summary

- Packages: 8
- Files: 23
- State: planned-not-staged

## Packages

### CI Publish Governance

- ID: ci-publish-governance
- Files: 1
- Suggested commit: `chore(ci): add publish governance reporting gates`
- Rationale: Workflow, publish readiness, and quality publish reporting should ship as one auditable CI change.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run check:open-source-governance`
  - `node --check scripts/automation-publish-readiness.cjs`
  - `node --check scripts/quality-governance-publish.cjs`
  - `npm run quality:governance:publish:ci`

| Status | Kind | Path |
| --- | --- | --- |
| M | automation | `scripts/quality-governance-publish.cjs` |

### Generated Language And Stack Reports

- ID: generated-language-stack-reports
- Files: 5
- Suggested commit: `chore(reports): refresh language and technology stack reports`
- Rationale: Generated reports should stay separate from handwritten governance and runtime changes.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run check:language-distribution`
  - `npm run check:seis-technology-stack`
  - `npm run quality:governance:publish:ci`

| Status | Kind | Path |
| --- | --- | --- |
| M | generated-report | `content/development/seis-technology-stack.json` |
| M | generated-report | `reports/language-distribution.json` |
| M | generated-report | `reports/language-distribution.md` |
| M | generated-report | `reports/seis-technology-stack.json` |
| M | generated-report | `reports/seis-technology-stack.md` |

### God Mode Model Lab

- ID: god-mode-model-lab
- Files: 7
- Suggested commit: `feat(ai): add god-mode model lab assets`
- Rationale: Model cards, generated model/data artifacts, redaction, and lab tests form one AI evaluation surface.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm test --prefix packages/seis-ai`
  - `npm run check:seis-universe-model-lab`
  - `npm run check:seis-universe-memory-ranker-model`
  - `npm run check:seis-universe-eval-critic-model`

| Status | Kind | Path |
| --- | --- | --- |
| M | source | `packages/seis-ai/src/agent/loop.mjs` |
| M | source | `packages/seis-ai/src/agent/tools.mjs` |
| ?? | source | `packages/seis-ai/src/lib/plugin-integration.mjs` |
| M | source | `packages/seis-ai/src/mcp/server.mjs` |
| M | source | `packages/seis-ai/test/agent.test.mjs` |
| M | source | `packages/seis-ai/test/mcp-smoke.test.mjs` |
| M | source | `packages/seis-ai/types/seis-ai.d.ts` |

### Demo Runtime Contracts

- ID: demo-runtime-contracts
- Files: 3
- Suggested commit: `feat(demo): align SEIS demo runtime contracts`
- Rationale: Web demo, core demo, service worker, and platform contract mirrors move together.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run seis:check`
  - `npm run check:workspace`
  - `npm run check:seis-command-center`

| Status | Kind | Path |
| --- | --- | --- |
| M | source | `apps/seis-demo-web/index.html` |
| M | source | `apps/seis-demo-web/script.js` |
| M | source | `apps/seis-demo-web/service-worker.js` |

### Plugin And Agent Surface

- ID: plugin-agent-surface
- Files: 4
- Suggested commit: `feat(plugins): refresh SEIS plugin and agent surfaces`
- Rationale: Plugin metadata, requested skills, and agent checks should stay in one review lane.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run check:seis-plugin-bundle`
  - `npm run check:seis-ai-agent`
  - `npm run check:seis-specialist-plugins -- --include-legacy-personal`

| Status | Kind | Path |
| --- | --- | --- |
| ?? | generated-report | `content/development/seis-agent-plugin-integration.json` |
| M | documentation | `docs/platform/seis-ai-agent.md` |
| M | documentation | `docs/platform/seis-specialist-plugins.md` |
| ?? | automation | `scripts/check-seis-agent-plugin-integration.mjs` |

### SSH Cloud Security

- ID: ssh-cloud-security
- Files: 1
- Suggested commit: `feat(cloud): strengthen SEIS SSH cloud security docs`
- Rationale: SSH, cloud, and security policy files should be reviewed with the matching hardening gates.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run check:ssh-hardening-contract`
  - `npm run check:seis-ssh-access-model`
  - `npm run check:seis-ssh-picker-compatibility`
  - `npm run check:cloud-access-policy`

| Status | Kind | Path |
| --- | --- | --- |
| M | repository-file | `cloud-migration-audit.ci.json` |

### Repository Metadata And Community Health

- ID: repo-metadata-and-community
- Files: 1
- Suggested commit: `chore(repo): update repository metadata and community health`
- Rationale: GitHub templates, gitignore, and repository metadata are a separate maintenance lane.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run check:open-source-governance`
  - `npm run check:publish-gate-contract`

| Status | Kind | Path |
| --- | --- | --- |
| M | repository-file | `package.json` |

### Manual Review

- ID: manual-review
- Files: 1
- Suggested commit: `chore: review uncategorized SEIS changes`
- Rationale: Files that do not match a stable lane need human review before staging.
- Action: review-validate-stage-commit-as-unit
- Validation:
  - `npm run quality:governance:publish:ci`

| Status | Kind | Path |
| --- | --- | --- |
| M | generated-report | `reports/seis-eval-critic-advisory/latest.md` |

## Next Actions

- Review each package boundary before staging files.
- Run the package validation commands before each commit.
- Commit one package at a time with the suggested commit message or a more precise variant.
- Run npm run automation:publish-readiness before any GitHub push attempt.

## Safety

- This report does not stage, commit, push, or delete files.
- Private keys, tokens, and credentials must not be committed.
- Generated report files are excluded from their own package calculation.

