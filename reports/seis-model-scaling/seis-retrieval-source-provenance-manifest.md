# SEIS Retrieval Source Provenance Report

Generated: 2026-06-30T23:18:08.798Z

Status: source-inventory-ready-index-blocked

## Summary

| Field | Value |
| --- | --- |
| Source groups | 4 |
| File records | 54 |
| Scanned files | 54 |
| Secret-scan findings | 0 |
| Persistent retrieval index approved | false |
| Embedding model install approved | false |
| Provider embedding calls approved | false |
| Private data indexing approved | false |

## Source Groups

| Group | Status | Provenance label | Files |
| --- | --- | --- | --- |
| root-governance-docs | candidate-allowlisted-metadata-only | repo-owned-governance | 8 |
| ai-docs | candidate-allowlisted-metadata-only | repo-owned-ai-docs | 15 |
| ai-governance-json | candidate-allowlisted-metadata-only | repo-owned-ai-json | 29 |
| ai-readiness-reports | candidate-allowlisted-metadata-only | generated-ai-readiness-report | 2 |

## Blocked Path Classes

- environment-files: credential risk
- ssh-and-private-keys: private key risk
- private-brain-notes: private user data
- dependencies-and-builds: generated or third-party volume
- archives-and-binaries: opaque binary/archive content

## Safe Next Commands

- `npm run report:seis-retrieval-source-provenance`
- `npm run check:seis-retrieval-source-provenance`
- `npm run check:seis-knowledge-retrieval-training`
- `npm run check:seis-ai-public-readiness`

## Human Approval Needed Before

- building a persistent retrieval index
- installing an embedding or reranker model
- calling an external embedding provider
- indexing private user data
- training on indexed content
- claiming fully knowledgeable AI, 512B route eligibility, or AGI
