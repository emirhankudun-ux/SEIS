# SEIS Retrieval Evaluation Fixtures Report

Generated: 2026-06-30T23:32:28.307Z

Status: fixtures-ready-evaluation-not-run

## Summary

| Field | Value |
| --- | --- |
| Fixture suites | 5 |
| Golden queries | 8 |
| Negative controls | 5 |
| Metrics | 5 |
| Evaluation run approved | false |
| Retrieval index query approved | false |
| Provider call approved | false |
| Benchmark run approved | false |
| Training run approved | false |

## Safe Next Commands

- `npm run report:seis-retrieval-evaluation-fixtures`
- `npm run check:seis-retrieval-evaluation-fixtures`
- `npm run check:seis-retrieval-evaluation-dry-run`
- `npm run check:seis-retrieval-source-provenance`
- `npm run check:seis-knowledge-retrieval-training`
- `npm run check:seis-ai-public-readiness`

## Human Approval Needed Before Evaluation Run

- retrieval source provenance manifest accepted
- secretScan.findingsCount stays 0 on the target commit
- fixture reviewer accepts golden queries and negative controls
- local-only evaluation runner implemented
- redacted logs implemented
- retrieval index build separately approved
- human approval recorded
