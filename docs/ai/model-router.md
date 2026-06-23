# Model Router

Status: Foundation contract recovered from PR #44

The model router chooses a provider profile, model profile, privacy mode, and
execution lane for a SEIS AI task. It must be provider-neutral and replaceable.

## Responsibilities

- classify the task type and risk
- select local, private, or provider-routed mode
- select an adapter by capability, cost, privacy, latency, and approval state
- attach a prompt version and evaluation profile
- return structured routing metadata
- log safe metadata only
- fail closed when approval, privacy, or configuration is missing

## Inputs

| Field | Purpose |
| --- | --- |
| `taskType` | Coding, review, security, docs, design, roadmap, research, automation, or chat. |
| `privacyMode` | Local-only, private-provider, standard-provider, or blocked. |
| `dataClass` | Public, repository, metadata, sensitive, secret, regulated, or restricted. |
| `requiredCapabilities` | Tool use, long context, code reasoning, review, retrieval, or local inference. |
| `approvalState` | None needed, approval pending, approved, or denied. |
| `costBudget` | Optional cost and token ceiling. |
| `evaluationProfile` | Regression and quality checks to attach. |

## Outputs

| Field | Purpose |
| --- | --- |
| `routeId` | Stable route identifier for audit and UI display. |
| `providerId` | Provider or local runtime identifier. |
| `modelProfileId` | Abstract model profile, not a hard-coded secret-bearing model config. |
| `promptVersionId` | Prompt engine version selected for the task. |
| `privacyMode` | Final privacy mode after policy checks. |
| `blockedReason` | Required when routing fails closed. |
| `auditEventId` | Link to safe audit metadata. |

## Privacy Modes

- `local-only`: no external provider call; use local model or no-model workflow.
- `metadata-only`: route only safe metadata; do not route raw repository
  content.
- `private-provider`: external provider allowed only for approved low-retention
  or enterprise privacy configuration.
- `standard-provider`: external provider allowed for public or explicitly
  approved non-sensitive data.
- `blocked`: no model call because data, approval, or configuration is unsafe.

## Provider Rules

- Provider keys stay server-side.
- Browser clients never receive provider secrets.
- Provider adapters must be replaceable.
- Missing configuration produces a blocked route, not a fake success.
- Provider responses are untrusted until validated by the requesting workflow.

## First Implementation Shape

The first implementation should be a small TypeScript or JavaScript module with
pure routing functions and fixtures. It should not call provider APIs. Live
adapters should be added only after privacy and evaluation contracts are tested.

## Fixture Evidence Boundary

This recovery branch includes the local model-router request/decision/response
fixture pack under `packages/model-router/`:

- `schemas/model-router-route-contract.schema.json`
- `fixtures/model-router-route-contracts.json`
- `npm run check:model-router-contracts`

It covers:

- `local-only` repository review with no provider call
- `metadata-only` documentation summary with raw-content routing blocked
- `route-contract-seis-10m-token-feed-metadata`, a metadata-only route for the
  SEIS 10,000,000 token feed budget plan with `maxTokens` set to 10,000,000,
  `maxUsd` set to 0, and no raw content routed
- `approval-needed` external-provider-redacted route that fails closed until
  approval, server-side credential handling, and redaction policy are verified

This recovery document and fixture pack do not imply live provider execution,
provider readiness, provider quality, benchmark performance, model training, or
SEIS-owned model capability.

The token feed budget is a metadata-only contract fixture. It must not be
taken as executed 10,000,000 token ingestion, embeddings, persistent memory,
provider calls, model training, or checkpoints.
