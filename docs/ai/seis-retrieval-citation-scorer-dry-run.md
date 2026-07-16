# SEIS Retrieval Citation Scorer Dry-Run

This document records a local-only citation scorer dry-run harness for future
SEIS retrieval evaluation. It checks citation rule coverage and source record
structure without generating answers, scoring live model quality, querying a
retrieval index, calling providers, running benchmarks, training a model,
granting 512B route eligibility, or proving AGI.

## Current Status

- Citation scorer status: citation-scorer-dry-run-passed-not-measured
- Scoring rules: 5
- Citation checks: 5
- Failed citation checks: 0
- Source records: 54
- Live citation scoring approved: false
- Answer generation approved: false
- Retrieval index query approved: false
- Provider call approved: false

## Scoring Rules

| Rule | Description |
| --- | --- |
| source-uri-required | Every supported answer citation must carry a source URI. |
| source-hash-required | Every supported answer citation must resolve to a SHA-256 source record. |
| unsupported-claim-block | Unsupported claims must be flagged, not silently scored as supported. |
| answerless-dry-run | This dry-run must not generate answers or score live answer quality. |
| redacted-log-required | Future scorer logs must preserve source ids without secret values or private data. |

## Citation Checks

| Check | Status | Evidence |
| --- | --- | --- |
| citation-policy-query-present | passed | Require source URI, source hash continuity, and unsupported-claim handling. |
| source-uri-coverage | passed | 54/54 records include sourceUri |
| sha256-coverage | passed | 54/54 records include SHA-256 |
| dry-run-answerless | passed | dry-run answer generation and retrieval index query remain false |
| metric-not-measured | passed | citationCoverage is defined but not measured |

## Required Before Live Citation Scoring

- local retrieval index query approved
- answer generation harness approved
- citation scorer implementation reviewed
- redacted logs implemented
- no-secret answer scan implemented
- human approval recorded

## Research Baseline

- [ragas](https://arxiv.org/abs/2309.15217) - RAG faithfulness and context-use evaluation framing.
- [helm](https://arxiv.org/abs/2211.09110) - Scenario-based evaluation and metric reporting discipline.
- [nist-ai-rmf](https://www.nist.gov/itl/ai-risk-management-framework) - Measurement, governance, and promotion-gate discipline.

## Commands

```bash
npm run report:seis-retrieval-citation-scorer-dry-run
npm run check:seis-retrieval-citation-scorer-dry-run
```

## Report

Reviewer report:
`reports/seis-model-scaling/seis-retrieval-citation-scorer-dry-run.md`
