# SEIS AI Core Fixture Evaluation Report

- Generated: 2026-06-20
- Status: fixture-backed
- Prompt evaluations: 7
- App-state evaluations: 2
- Retrieval evaluations: 4
- Browser UI evaluations: 2
- Passed: 15
- Failed: 0
- Blocked: 0
- Unknown: 0

## Evaluations

| id | layer | target | result | evidence |
| --- | --- | --- | --- | --- |
| eval-prompt-regression-repository-assistant-readonly | prompt-regression | prompt:prompt-repository-assistant-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/product/repository-assistant.md |
| eval-prompt-regression-documentation-assistant-overclaim | prompt-regression | prompt:prompt-documentation-assistant-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/product/ai-app-surfaces.md |
| eval-prompt-regression-architecture-reviewer-boundary | prompt-regression | prompt:prompt-architecture-reviewer-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/product/ai-app-surfaces.md |
| eval-prompt-regression-security-reviewer-secret-redaction | prompt-regression | prompt:prompt-security-reviewer-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/product/security-review-assistant.md |
| eval-prompt-regression-pr-reviewer-findings-first | prompt-regression | prompt:prompt-pr-reviewer-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/product/ai-app-surfaces.md |
| eval-prompt-regression-roadmap-assistant-sequence | prompt-regression | prompt:prompt-roadmap-assistant-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, roadmap/seis-ai-core-command-center-5-year-development-program.md |
| eval-prompt-regression-research-assistant-nonclaim | prompt-regression | prompt:prompt-research-assistant-v0-1 | pass | packages/prompt-engine/fixtures/assistant-surface-regression-suite.json, scripts/check-prompt-regression-fixtures.mjs, docs/ai/seis-universe-research.md |
| eval-app-state-shared-contract-fixture | app-state | app-state:ai-core-command-center-foundation | pass | packages/shared-types/fixtures/ai-core-command-center-foundation.json, apps/seis-core/ai-core-contract-fixture.js, scripts/check-ai-core-app-contracts.mjs |
| eval-app-state-repository-assistant-local-alpha | app-state | app-state:local-readonly-repository-assistant | pass | packages/repository-assistant/fixtures/local-readonly-repository-assistant.json, scripts/check-repository-assistant-prototype.mjs, docs/product/repository-assistant.md |
| eval-retrieval-knowledge-source-classification | retrieval | retrieval:knowledge-source-classification | pass | packages/data/fixtures/knowledge-source-classification.json, scripts/check-knowledge-source-classification.mjs, docs/ai/context-memory-boundary.md |
| eval-retrieval-local-readonly-query-adapter | retrieval | retrieval:local-readonly-retrieval-query-adapter | pass | packages/data/fixtures/local-readonly-retrieval-query-adapter.json, scripts/check-retrieval-query-adapter.mjs, apps/seis-core/index.html |
| eval-retrieval-local-search-transcript | retrieval | retrieval:local-readonly-retrieval-search-transcript | pass | packages/data/fixtures/local-readonly-retrieval-search-transcript.json, scripts/check-retrieval-search-transcript.mjs, apps/seis-core/index.html |
| eval-retrieval-seis-10m-token-feed-budget | retrieval | retrieval:seis-10m-token-feed-budget | pass | packages/data/fixtures/seis-10m-token-feed-budget.json, scripts/check-token-feed-budget.mjs, docs/ai/context-memory-boundary.md |
| eval-browser-ui-local-retrieval-interaction-qa | browser-ui | retrieval-ui:local-retrieval-browser-interaction-qa | pass | reports/evals/local-retrieval-browser-visual-qa.md, scripts/capture-seis-core-local-retrieval-visual.mjs, apps/seis-core/test/seis-core-static.test.js |
| eval-browser-ui-ai-core-panel-navigation-qa | browser-ui | browser-ui:ai-core-panel-navigation-browser-qa | pass | reports/evals/ai-core-panel-navigation-browser-qa.md, scripts/capture-seis-core-ai-core-panel-navigation.mjs, scripts/check-ai-core-browser-qa-evidence.mjs, docs/evals/ai-core-browser-evidence-gates.md, apps/seis-core/README.md |

## Non-Claims

- No live model execution is performed.
- No external provider routing, provider quality score, or provider performance claim is created.
- No benchmark, model safety, model ownership, fine-tuning, training, checkpoint, or model-card claim is created.
- No GitHub write action, SSH execution, deployment, or infrastructure mutation is enabled.
- No secret values, provider keys, private keys, or raw private configuration are included.

## Next Recommended Slice

Prepare an approval-gated active workflow PR for AI Core browser evidence after the review-only draft is accepted.

Source links:

- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `docs/evals/evaluation-strategy.md`
- `apps/seis-core/README.md`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `scripts/check-ai-core-browser-qa-evidence.mjs`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
