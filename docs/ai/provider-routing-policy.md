# Provider Routing Policy

Status: Foundation policy recovered from PR #44

Provider routing decides when SEIS may use an external model provider, a local
model, or no model call.

## Data Classes

| Data class | Provider routing |
| --- | --- |
| Public | Standard provider allowed when cost and quality fit. |
| Metadata | Metadata-only routing allowed when raw content is excluded. |
| Internal | Provider use requires policy fit and task necessity. |
| Sensitive | Private-provider or local-only, with approval. |
| Secret | Blocked from model providers. |
| Restricted | Blocked unless a clean-room or legal policy explicitly allows use. |

## Approval Gates

Approval is required before:

- sending sensitive repository content to an external provider
- using new provider credentials
- enabling persistent provider logging
- running external evaluations over private data
- training, fine-tuning, or dataset upload

## Routing Defaults

- Public docs and open-source metadata may use provider-routed mode.
- Private credentials, tokens, keys, `.env` contents, and personal data are
  blocked.
- Unknown data class defaults to blocked or local-only.
- Provider errors produce degraded or blocked state, not fabricated success.

## Execution Modes

| Mode | Rule |
| --- | --- |
| `local-only` | Must not call external providers. |
| `local-preferred` | Try local route first; external fallback requires policy fit. |
| `external-provider-allowed` | Provider call allowed for approved data class and route. |
| `external-provider-redacted` | Sensitive fields must be redacted before provider use. |
| `metadata-only` | Only safe metadata may be routed; no raw content. |
| `offline` | No network or provider call; do not fake AI output. |
| `disabled` | AI unavailable; app must explain disabled state. |
| `research-only` | For experiments; not for production decisions. |

## Audit Requirements

Safe metadata should include route id, task class, provider id, model profile,
privacy mode, approval state, timestamp, and validation outcome. It must not
include prompts containing secrets or private data.

## Fixture Evidence Boundary

PR #44 represented provider-routing boundaries in
`packages/model-router/fixtures/model-router-route-contracts.json` and checked
them with `npm run check:model-router-contracts`, but that package slice is not
part of this docs-only recovery branch.

When re-ported in a later implementation PR, the fixture pack should keep
local-only and metadata-only routes provider-free, and keep the
external-provider-redacted route in `approval-needed` state. This recovery
policy does not create live provider credentials, provider API calls, benchmark
claims, or model-readiness claims.
