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
| Model router | Documented, not implemented | `docs/ai/model-router.md` | No provider registry exists in this branch. | Create server-only provider registry fixtures before adapters. |
| Prompt engine | Documented, not implemented | `docs/ai/prompt-engine.md` | No versioned prompt registry or regression suite exists. | Define prompt-pack schema and fixtures. |
| Agent runtime | Documented, not implemented | `docs/ai/agent-runtime.md`, `scripts/ai-launcher.cjs`, plugin docs | No bounded runtime schema or permission registry exists. | Define agent role schema before automation. |
| Provider credentials | Statically audited | `docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md` | No runtime verification was performed. | Keep keys optional, server-only, and disabled until adapter tests exist. |
| AI Workforce Training | Active local seed training contract | `docs/ai/ai-workforce-training.md`, `content/development/seis-ai-workforce-training-plan.json`, `scripts/check-seis-ai-workforce-training.mjs`, `scripts/run-seis-ai-workforce-training.mjs` | No live provider calls, credential reads, cloud fine-tuning, dataset downloads, SSH, deployment, or runtime authority are performed. | Rebuild deterministic local seed artifacts with `npm run automation:seis-ai-workforce-training`. |
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

## AI Workforce Training

SEIS can use installed assistants as a supervised training workforce only inside
the local seed-model contract. In this context, training means sanitized review,
SEIS-owned synthetic case creation, deterministic local artifact rebuilds, and
promotion-gate evidence. It does not mean cloud provider fine-tuning, live
provider calls, credential validation, dataset downloads, SSH, deployment,
background autonomy, runtime authority, or foundation-model ownership.

Machine-readable source:
`content/development/seis-ai-workforce-training-plan.json`.

Human-readable contract:
`docs/ai/ai-workforce-training.md`.

Validation and execution:

```bash
npm run check:seis-ai-workforce-training
npm run automation:seis-ai-workforce-training
```

Installed assistants may propose candidate cases from sanitized context, but
Codex remains the integration owner and every accepted case must remain
SEIS-owned synthetic data with no user-private content. The promotion policy
must keep runtime authority at zero until independent benchmark, observability,
rollback, human approval, and security gates pass.

## Related Documents

- [../security/security-baseline.md](../security/security-baseline.md)
- [model-router.md](model-router.md)
- [prompt-engine.md](prompt-engine.md)
- [agent-runtime.md](agent-runtime.md)
- [../product/command-center-foundation.md](../product/command-center-foundation.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)

## Next Safe Action

Add typed server-only environment validation, provider registry fixtures, prompt
pack fixtures, and an agent permission matrix before adding live provider
adapters or requesting API keys.
