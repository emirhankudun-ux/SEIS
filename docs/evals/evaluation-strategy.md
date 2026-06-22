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

## Knowledge Source Classification Evidence

Retrieval and knowledge-source classification is fixture-backed through
`packages/data/fixtures/knowledge-source-classification.json` and
`npm run check:knowledge-source-classification`. The evaluation layer treats
knowledge-source classification as retrieval evidence only: it confirms source
class, freshness, privacy mode, blocked archive handling, and non-claims. It does
not create embeddings, persistent memory, provider context, benchmark claims, or
model-training evidence.

The first local read-only retrieval query adapter evaluation is fixture-backed
through `packages/data/fixtures/local-readonly-retrieval-query-adapter.json` and
`npm run check:retrieval-query-adapter`. It verifies that Command Center
retrieval returns metadata/evidence links only, selects approved/local
knowledge-source ids, and keeps discarded assistant archive material blocked. It
does not create a retrieval index, embedding database, persistent memory,
provider context, GitHub write path, SSH execution path, deployment path,
payment flow, infrastructure mutation, benchmark claim, or model-training
evidence.

The first local retrieval result card and no-content transcript evaluation is
fixture-backed through
`packages/data/fixtures/local-readonly-retrieval-search-transcript.json` and
`npm run check:retrieval-search-transcript`. It verifies that Command Center
can render metadata-only retrieval cards and blocked/empty transcripts while
keeping `resultCount` at `0` for no-content searches. It does not create a live
search engine, retrieval index, embedding database, persistent memory,
provider context, secret lookup, GitHub write path, SSH execution path,
deployment path, payment flow, infrastructure mutation, benchmark claim, or
model-training evidence.

The same evaluation covers local query filtering controls and evidence-card
empty-state cases. The contract keeps separate no-result messages for Retrieval
Result Cards and No-Content Search Transcripts, and the Command Center static
test executes the filter toolbar in JSDOM to verify query, source-class,
transcript-state, reset, and rendered empty states. These are UI/state
regressions over fixture data only; a pass does not imply live search coverage
or provider readiness.

A follow-up Command Center static test covers keyboard focus order for the
local retrieval controls and verifies the filter status live region. This is
accessibility QA over existing fixture-backed UI only; it does not add live
retrieval, providers, embeddings, raw-content ingestion, or memory writes.

The same app-scoped test layer now covers mobile viewport rules for the Local
Retrieval toolbar: the controls collapse to one column and keep 44px touch
targets. This remains CSS/static UI evidence, not runtime proof of live
retrieval or provider readiness.

The app-scoped suite also includes a desktop and mobile viewport-contract smoke
test for the Local Retrieval toolbar. It renders the Command Center fixture in
JSDOM and verifies nonblank shell content, ARIA wiring, populated local
retrieval panels, safety boundary chips, and responsive CSS contracts. This is
stronger than source-only CSS checks, but it is still not pixel-level browser
visual regression evidence and does not claim screenshot, clipping, or real
layout-engine coverage.

The first token feed budget evaluation is fixture-backed through
`packages/data/fixtures/seis-10m-token-feed-budget.json` and
`npm run check:token-feed-budget`. It verifies a 10,000,000 token metadata-only
budget plan and Command Center integration while keeping executed ingestion at
0 tokens. It does not create embeddings, persistent memory, provider context,
benchmark claims, or model-training evidence.

## Non-Claims

SEIS must not publish benchmark, safety, or model capability claims without
actual evaluation runs and reviewable records.
