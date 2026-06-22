# SEIS AI Core Foundation

## Purpose

Define SEIS AI Core as a provider-neutral application layer for routing,
prompts, agents, evaluation, and safe assistant workflows.

SEIS AI Core is not a trained SEIS foundation model. Provider routing, prompt
engineering, retrieval, and local demos must not be described as model
ownership.

## Scope

The foundation includes:

- model router concept
- prompt engine concept
- agent runtime concept
- provider privacy modes
- no-key startup rule
- local/private mode
- evaluation and evidence boundaries
- Command Center AI status surface

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Model router | Planned | No central router found in current source scan. | No provider registry exists in this branch. | Create provider-neutral contract before adapters. |
| Prompt engine | Planned | Prompt governance exists only as docs and scripts. | No versioned prompt registry exists. | Define prompt format and regression rules. |
| Agent runtime | Planned | `scripts/ai-launcher.cjs`, plugin docs | No bounded runtime contract exists. | Document agent boundaries before automation. |
| Provider credentials | Statically audited | `docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md` | No runtime verification was performed. | Keep keys optional, server-only, and disabled until adapter tests exist. |
| Local model mode | Planned | No local model adapter found in this branch. | No runtime integration. | Define Ollama/localhost as optional zero-key future mode. |
| Evaluation | Planned | Goal validation exists; AI evals do not. | No eval suite. | Add prompt/model evaluation strategy later. |

## Rules / Policy

- Core SEIS must boot with zero cloud model-provider keys.
- One compatible cloud provider should be enough for general live AI later.
- Additional providers are optional and capability-specific.
- Missing provider keys disable only the provider, not the whole product.
- Browser code must not receive provider secrets.
- Local-only mode must never fall back to cloud silently.
- Fallback identity must be visible to the user.
- Claude-style interfaces must not label non-Anthropic output as Claude.

## Provider Status Model

Public provider states must remain:

- Available
- Missing Key
- Disabled
- Rate Limited
- Error

## Evidence Requirements

AI features need evidence before being marked implemented:

- server-only environment validation
- provider registry tests
- no-key startup test
- fallback test
- redaction test
- client-bundle secret exposure check
- documented provider matrix

## Related Documents

- [../security/security-baseline.md](../security/security-baseline.md)
- [../product/command-center-foundation.md](../product/command-center-foundation.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)

## Next Safe Action

Add typed server-only environment validation and a provider registry contract
before adding live provider adapters or requesting API keys.
