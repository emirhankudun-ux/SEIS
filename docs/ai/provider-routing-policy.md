# Provider Routing Policy

Status: Foundation policy

Provider routing decides when SEIS may use an external model provider, a local
model, or no model call.

## Data Classes

| Data class | Provider routing |
| --- | --- |
| Public | Standard provider allowed when cost and quality fit. |
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

## Audit Requirements

Safe metadata should include route id, task class, provider id, model profile,
privacy mode, approval state, timestamp, and validation outcome. It must not
include prompts containing secrets or private data.
