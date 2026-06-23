# SEIS Model Baseline

Status: Phase 0 baseline audit

This document records what SEIS can currently prove about model-related work.
It is a baseline for future SEIS Universe research, not evidence of a trained
foundation model.

## Current Evidence

| Area | Current evidence | Boundary |
| --- | --- | --- |
| AI application layer | `docs/ai/seis-ai-core.md`, `docs/architecture/ai-core-app-shared-contracts.md`, and Command Center AI Core projection fixtures. | Application contracts only; not learned model weights. |
| Model routing | `packages/model-router/fixtures/model-router-route-contracts.json` and `npm run check:model-router-contracts`. | Deterministic route contracts; no live provider routing claim. |
| Agent runtime | `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json` and `npm run check:agent-runtime-lifecycle`. | Human-supervised lifecycle fixture; no autonomous production runtime. |
| Prompt regression | `packages/prompt-engine/fixtures/assistant-surface-regression-suite.json` and `npm run check:prompt-regression-fixtures`. | Prompt/application regression data; not model training. |
| Local seed models | `packages/seis-ai/models/*.json` and tests under `packages/seis-ai/test/`. | Deterministic local seed artifacts; not a SEIS foundation model. |
| Evaluation policy | `docs/evals/evaluation-strategy.md` and `docs/evals/benchmark-integrity.md`. | Evaluation governance; no unrecorded benchmark claims. |
| Provider privacy | `docs/security/model-provider-data-policy.md` and `docs/ai/provider-routing-policy.md`. | Policy only; no provider key or live provider session in repo. |

## Existing Local Seed Artifacts

The repository contains small JSON-based local seed artifacts under
`packages/seis-ai/models/`:

- `agent-router-seed-v0.json`
- `eval-critic-seed-v0.json`
- `memory-ranker-seed-v0.json`
- `permission-policy-seed-v0.json`
- `seis-model-benchmark-suite.json`
- `seis-model-family-registry.json`
- `seis-model-promotion-policy.json`

These artifacts support deterministic tests and policy experiments. They must
be described as seed models or policy artifacts, not frontier models, not
foundation models, and not proof of scaled training.

## Current Non-Claims

SEIS cannot currently claim:

- trained SEIS-owned foundation model weights
- completed tokenizer research
- approved training dataset
- production training pipeline
- GPU or Apple Silicon training capacity reservation
- checkpoint release
- model card for real trained weights
- benchmark superiority over external providers
- safety certification

## Minimum Evidence Required Before Model Ownership Claims

Before any SEIS-owned model claim is made, the repository must contain:

- architecture specification
- tokenizer strategy
- data manifest with source, license, consent, and split records
- training configuration
- reproducible training logs
- checkpoint files or checkpoint registry references
- evaluation report with benchmark definitions
- model card
- safety review
- release governance decision

## Immediate Baseline Gaps

- No `research/` workspace exists yet for isolated experiments.
- No compute inventory or training budget is recorded.
- No dataset intake manifest exists for model training.
- No tokenizer experiment has been run.
- No nano-model training gate has passed.
- No release-ready model card exists because no trained weights exist.
