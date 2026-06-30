# SEIS Retrieval Source Provenance

This document tracks the candidate source inventory for future SEIS retrieval.
It is not a retrieval index, embedding runtime, provider integration, dataset
download, training run, 512B route, or AGI proof.

## Current Status

- Manifest status: manifest-defined-index-blocked
- Source inventory defined: true
- Secret-scan dry run: passed-redacted-local-dry-run
- Secret-scan findings: 0
- Persistent retrieval index approved: false
- Embedding model install approved: false
- Provider embedding calls approved: false
- Private data indexing approved: false

## Source Groups

| Group | Status | Provenance label | Files |
| --- | --- | --- | --- |
| root-governance-docs | candidate-allowlisted-metadata-only | repo-owned-governance | 8 |
| ai-docs | candidate-allowlisted-metadata-only | repo-owned-ai-docs | 16 |
| ai-governance-json | candidate-allowlisted-metadata-only | repo-owned-ai-json | 29 |
| ai-readiness-reports | candidate-allowlisted-metadata-only | generated-ai-readiness-report | 2 |

## Required Before Persistent Index Build

- all source groups reviewed by a human
- secretScan.findingsCount stays 0 on the target commit
- blocked path classes remain excluded
- chunk policy and source URI policy accepted
- provenance labels reviewed
- prompt-injection handling plan accepted
- retrieval evaluation fixtures created
- human approval recorded

## Research Baseline

- [nist-ai-rmf](https://www.nist.gov/itl/ai-risk-management-framework) - Risk management baseline for source governance and public AI readiness.
- [owasp-llm-prompt-injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) - Prompt-injection and untrusted-content boundary for retrieval source intake.
- [github-secret-scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) - Secret-scanning baseline for GitHub-ready repository source intake.

## Commands

```bash
npm run report:seis-retrieval-source-provenance
npm run check:seis-retrieval-source-provenance
```

## Report

Reviewer report:
`reports/seis-model-scaling/seis-retrieval-source-provenance-manifest.md`
