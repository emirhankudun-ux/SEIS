# SEIS Retrieval Evaluation Dry-Run

This document records a local-only structural dry-run for SEIS retrieval
evaluation fixtures. It validates fixture coverage and safety invariants without
generating answers, building or querying an index, calling providers, running a
benchmark, training a model, granting 512B route eligibility, or proving AGI.

## Current Status

- Dry-run status: dry-run-passed-no-index-no-model
- Golden query checks: 8
- Negative control checks: 5
- Invariant checks: 9
- Answer generation approved: false
- Retrieval index query approved: false
- Provider call approved: false
- Benchmark run approved: false
- Training run approved: false

## Source Group Coverage

| Source group | File records |
| --- | --- |
| root-governance-docs | 8 |
| ai-docs | 15 |
| ai-governance-json | 29 |
| ai-readiness-reports | 2 |

## Golden Query Dry-Run Checks

| Query | Status | Expected groups | Answer generated | Index queried |
| --- | --- | --- | --- | --- |
| public-readiness-status | passed-local-fixture-check | ai-governance-json, ai-docs | false | false |
| retrieval-source-count | passed-local-fixture-check | ai-docs, ai-governance-json, ai-readiness-reports | false | false |
| secret-boundary | passed-local-fixture-check | root-governance-docs | false | false |
| provider-boundary | passed-local-fixture-check | ai-governance-json | false | false |
| fresh-clone-readiness | passed-local-fixture-check | ai-governance-json, ai-docs | false | false |
| knowledge-claim | passed-local-fixture-check | ai-governance-json | false | false |
| stale-report | passed-local-fixture-check | ai-readiness-reports | false | false |
| citation-policy | passed-local-fixture-check | ai-docs, ai-governance-json | false | false |

## Negative Control Policy Checks

| Control | Status | Refusal/ignore policy defined | Provider called |
| --- | --- | --- | --- |
| env-file-request | passed-policy-fixture-check | true | false |
| ssh-key-request | passed-policy-fixture-check | true | false |
| prompt-injection-source | passed-policy-fixture-check | true | false |
| provider-shortcut | passed-policy-fixture-check | true | false |
| agi-shortcut | passed-policy-fixture-check | true | false |

## Invariants

| Invariant | Status |
| --- | --- |
| provenance-status | passed |
| provenance-secret-findings-zero | passed |
| fixtures-status | passed |
| fixtures-evaluation-run-false | passed |
| fixtures-index-query-false | passed |
| fixtures-provider-call-false | passed |
| knowledge-status | passed |
| agi-claim-blocked | passed |
| runtime-authority-blocked | passed |

## Required Before Real Evaluation Run

- human reviewer accepts dry-run output
- local-only retrieval index build separately approved
- retrieval runner implementation reviewed
- redacted answer logs implemented
- citation scorer implemented
- no-secret output scan implemented
- human approval recorded

## Research Baseline

- [nist-ai-rmf](https://www.nist.gov/itl/ai-risk-management-framework) - Evaluation governance, measurement, risk mapping, and promotion gates.
- [owasp-llm-prompt-injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) - Untrusted retrieved content and prompt-injection negative controls.
- [ragas](https://arxiv.org/abs/2309.15217) - RAG evaluation dimensions for faithfulness, answer relevance, and context use.
- [helm](https://arxiv.org/abs/2211.09110) - Holistic evaluation framing and scenario-based measurement discipline.

## Commands

```bash
npm run report:seis-retrieval-evaluation-dry-run
npm run check:seis-retrieval-evaluation-dry-run
```

## Report

Reviewer report:
`reports/seis-model-scaling/seis-retrieval-evaluation-dry-run.md`
