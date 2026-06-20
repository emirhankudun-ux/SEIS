# SEIS AI Core Fixture Evaluation Report

- Generated: 2026-06-20
- Status: fixture-backed
- Prompt evaluations: 7
- App-state evaluations: 2
- Passed: 9
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

## Non-Claims

- No live model execution is performed.
- No external provider routing, provider quality score, or provider performance claim is created.
- No benchmark, model safety, model ownership, fine-tuning, training, checkpoint, or model-card claim is created.
- No GitHub write action, SSH execution, deployment, or infrastructure mutation is enabled.
- No secret values, provider keys, private keys, or raw private configuration are included.

## Next Recommended Slice

Add agent-runtime task lifecycle and approval-state fixtures.

Source links:

- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `docs/ai/agent-runtime.md`
