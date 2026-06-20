# Evaluation Strategy

Status: Fixture-backed foundation strategy

SEIS evaluations measure AI Core behavior, prompt quality, routing decisions,
agent safety, documentation quality, and future model experiments.

## Evaluation Layers

| Layer | Purpose |
| --- | --- |
| Prompt regression | Detect behavior drift across prompt versions. |
| Router tests | Verify privacy, task class, and provider selection. |
| Agent safety | Verify approvals, forbidden actions, and validation claims. |
| Tool tests | Verify tool schemas, redaction, error handling, and timeouts. |
| App state tests | Verify ready, blocked, degraded, unknown, and approval states. |
| Research evals | Measure future tokenizer, fine-tune, and model experiments. |

## Minimum Record

Each evaluation run should capture:

- evaluation id
- target version
- dataset or fixture source
- privacy class
- metric or rubric
- pass/fail criteria
- observed output summary
- limitations
- reviewer
- timestamp

## Prompt Regression Fixture Evidence

The first prompt regression fixture suite is
`packages/prompt-engine/fixtures/assistant-surface-regression-suite.json`, with
its schema in `packages/prompt-engine/schemas/prompt-regression-suite.schema.json`.
It is validated by `npm run check:prompt-regression-fixtures`.

This suite is a fixture-backed readiness check for prompt behavior contracts. It
does not produce live evaluation scores, benchmark claims, provider performance
claims, model safety claims, or trained SEIS model evidence.

## Fixture Evaluation Report

The first generated evaluation report is fixture-backed and local-only:

- `packages/evals/schemas/fixture-evaluation-report.schema.json`
- `reports/evals/ai-core-fixture-evaluation-report.json`
- `reports/evals/ai-core-fixture-evaluation-report.md`
- `npm run check:ai-core-fixture-evaluation-report`
- `npm run automation:ai-core-fixture-evaluation-report`

It records prompt-regression and app-state fixture evaluations with evidence
links, pass criteria, limitations, reviewer, and non-claims. It does not run
live models, compare provider quality, publish benchmark scores, certify safety,
or create trained SEIS model evidence.

## Non-Claims

SEIS must not publish benchmark, safety, or model capability claims without
actual evaluation runs and reviewable records.
