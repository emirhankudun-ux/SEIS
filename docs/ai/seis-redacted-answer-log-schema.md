# SEIS Redacted Answer Log Schema

This document defines the metadata-only answer-log schema SEIS can use before
any future real answer logging is approved. It does not collect or persist real
answer logs, store prompt bodies, store answer bodies, generate answers, query a
retrieval index, call providers, run benchmarks, train a model, grant 512B route
eligibility, or prove AGI.

## Current Status

- Schema status: redacted-answer-log-schema-ready-no-real-logs
- Allowed metadata fields: 12
- Forbidden fields: 14
- Redaction rules: 5
- Failed checks: 0
- Real answer log collection approved: false
- Prompt body storage approved: false
- Answer body storage approved: false

## Allowed Metadata Fields

| Field | Type | Required | Boundary |
| --- | --- | --- | --- |
| recordId | opaque-id | true | Opaque local record id; no user id, email, IP, or account identifier. |
| schemaVersion | semver-like-string | true | Schema version for future migrations. |
| createdAt | iso-8601-timestamp | true | Timestamp only; no timezone-derived location inference. |
| runtimeMode | enum | true | Allowed values: local-demo, approval-needed, blocked. |
| questionIntent | enum | true | Coarse intent label only; prompt body is forbidden. |
| promptHash | sha256 | true | Hash of prompt text if logging is approved; prompt body is forbidden. |
| answerHash | sha256 | true | Hash of answer text if logging is approved; answer body is forbidden. |
| sourceUris | seis-source-uri-array | true | Reviewed source URIs only, never raw source content. |
| citationIds | opaque-id-array | false | Citation record ids without quoted answer text. |
| redactionSummary | category-counts | true | Counts by redaction category only. |
| safetyDecision | enum | true | Allowed values: allowed, refused, blocked, needs-human-review. |
| claimBoundary | enum-array | true | Explicit claim boundaries such as no-agi, no-512b-route, local-demo-only. |

## Forbidden Fields

- `promptBody`
- `answerBody`
- `rawConversation`
- `providerApiKey`
- `providerToken`
- `password`
- `cookie`
- `sshPrivateKey`
- `envFileContents`
- `privateSourceText`
- `unredactedStackTrace`
- `userEmail`
- `ipAddress`
- `paymentIdentifier`

## Redaction Rules

| Rule | Description |
| --- | --- |
| secret-shaped-values | Reject token-shaped, password-shaped, key-shaped, and credential assignment values. |
| private-key-material | Reject private key headers and any key body material. |
| env-and-config | Reject environment file contents and local credential config values. |
| private-user-data | Reject direct personal identifiers and private source text. |
| claim-boundary | Require no-AGI and no-512B route boundaries for every local-demo answer log record. |

## Schema Checks

| Check | Status | Evidence |
| --- | --- | --- |
| allowed-fields-present | passed | 12 allowed metadata fields defined |
| forbidden-fields-present | passed | 14 forbidden fields defined |
| no-body-fields-allowed | passed | promptBody and answerBody are not allowed fields |
| sample-records-metadata-only | passed | all sample records are metadata-only |
| no-secret-scan-linked | passed | no-secret-answer-log-scan-passed-no-answers |
| citation-scorer-linked | passed | citation-scorer-dry-run-passed-not-measured |

## Research Baseline

- [github-secret-scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning) - Credential-shaped value categories and GitHub review readiness.
- [owasp-sensitive-information-disclosure](https://genai.owasp.org/llmrisk/llm02-sensitive-information-disclosure/) - Sensitive information disclosure controls for answer logs.
- [nist-ai-rmf](https://www.nist.gov/itl/ai-risk-management-framework) - Measurement, governance, and risk-management framing.

## Commands

```bash
npm run report:seis-redacted-answer-log-schema
npm run check:seis-redacted-answer-log-schema
```

## Report

Reviewer report:
`reports/seis-model-scaling/seis-redacted-answer-log-schema.md`
