# SEIS Model Router

## Purpose

Define the provider-neutral routing contract for future SEIS AI features.
This document is a foundation contract, not implementation evidence.

## Scope

The model router will choose a provider and model profile only after checking
capability, privacy, provider status, workspace policy, fallback rules, and
user selection.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Router implementation | Planned | No central router implementation exists in this branch. | Typed environment validation and live adapter tests are missing. | Keep routing disabled until server-only adapter tests exist. |
| Routing policy | Documented | This document and `docs/ai/seis-ai-core.md`. | No runtime policy tests. | Add fixtures before live providers. |
| Provider state model | Documented fixture | `content/development/seis-ai-core-provider-registry.json`, `seis_ai_core_provider_status`, `seis://ai/provider-registry.json`. | No live health checks or credential validation are performed. | Use the fixture for UI/MCP status before live adapters. |
| Model scaling profile | Planned compatibility contract | `content/development/seis-model-scaling-hardware-profile.json`, `docs/ai/seis-model-scaling.md`, `seis_ai_core_model_scaling_status`. | The 20B / 16GB+ RAM target plus 70B and 150B frontier lanes are not routeable models until weights, model cards, runtime adapters, safety evals, and benchmarks exist. | Keep Local Demo as fallback and block 20B, 70B, or 150B routing until profile gates pass. |
| Fallback behavior | Documented | Local Demo and no-key startup are required. | No runtime gateway. | Keep fallback identity visible in future UI. |

## Rules / Policy

- Core SEIS must boot with zero cloud model-provider keys.
- Automatic routing must preserve the requested capability.
- Local-only mode must never fall back to a cloud provider.
- Fallback must be visible and must show the actual provider and model.
- A provider with `Missing Key`, `Disabled`, `Rate Limited`, or `Error` status
  must be excluded unless the user explicitly repairs or retries it.
- Browser code must not receive provider credentials or unrestricted provider
  base URLs.

## Capability Matrix

Initial capability labels should include:

- general chat
- code generation
- code review
- architecture review
- structured output
- tool calling
- long context
- vision
- image generation
- embeddings
- speech generation
- transcription
- local/private inference

## Evidence Requirements

Before the router is marked implemented, add:

- typed server-only environment validation
- provider registry contract tests with `npm run check:seis-ai-core-provider-registry`
- model scaling hardware profile tests with `npm run check:seis-model-scaling-hardware-profile`
- no-key startup test
- local-only fallback test
- rate-limit fixture
- invalid credential fixture
- redacted routing decision log fixture
- client-bundle secret exposure check

## Related Documents

- [seis-ai-core.md](seis-ai-core.md)
- [prompt-engine.md](prompt-engine.md)
- [agent-runtime.md](agent-runtime.md)
- [../audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md](../audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md)
- [../../SECURITY.md](../../SECURITY.md)

## Next Safe Action

Add a server-only provider registry fixture and no-key startup test before any
live provider adapter work. The current provider registry fixture is
`content/development/seis-ai-core-provider-registry.json`; it is status evidence
only and does not perform live provider calls.

The current model scaling profile is
`content/development/seis-model-scaling-hardware-profile.json`; it records the
planned 20B target for 16GB+ RAM, future 70B scale ladder, and 150B frontier
research lane as routing requirements, not as live model
availability. The router must keep all 20B, 70B, and 150B lanes blocked until
the memory budget contract, quantization or distributed-runtime profile,
runtime adapter, model card, dataset card, safety eval, redacted logs, and
human approval gates have evidence.
