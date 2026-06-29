# SEIS Model Router

## Purpose

Define the Provider-neutral routing contract for future SEIS AI features.
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
| Read-only model-router contract | Planned-read-only contract | `content/development/seis-read-only-model-router-contract.json`, `docs/ai/read-only-model-router-contract.md`, `npm run check:seis-second-brain-readiness-contracts`. | No runtime gateway, provider calls, credential validation, browser secrets, silent fallback, or local-only cloud fallback. | Keep the contract explanatory until backend-only provider mediation and no-key fixtures exist. |
| Model scaling profile | Planned compatibility contract | `content/development/seis-model-scaling-hardware-profile.json`, `docs/ai/seis-model-scaling.md`, `seis_ai_core_model_scaling_status`. | The 20B / 16GB+ RAM target plus 70B, 150B, and 512B apex lanes are not routeable models until weights, model cards, runtime adapters, safety evals, AGI eval protocol, and benchmarks exist. | Keep Local Demo as fallback and block 20B, 70B, 150B, or 512B routing until profile gates pass. |
| Model parameter ladder | Planning contract, not runtime | `content/development/seis-model-parameter-ladder.json`, `seis://ai/model-parameter-ladder.json`, `npm run check:seis-model-parameter-ladder`. | The 20B, 70B, 150B, 300B+, 512B, and highest-future parameter classes are explicit route-blocked targets, not trained, AGI, or routeable SEIS models. | Use the ladder only to explain promotion order and approval gates; never treat it as model availability. |
| 150B frontier model program | Plan-only route gate | `content/development/seis-150b-frontier-model-program.json`, `seis://ai/150b-frontier-model-program.json`, `npm run check:seis-150b-frontier-model-program`. | The 150B program is a charter and promotion-gate record only, not weights, inference, benchmark evidence, cloud/GPU capacity, SSH, or production readiness. | Keep 150B route eligibility blocked until 20B and 70B evidence plus clean-room, budget, privacy, safety, observability, rollback, and approval gates pass. |
| 512B apex model program | Plan-only SEIS AGI readiness gate with public research baseline | `content/development/seis-512b-apex-model-program.json`, `seis://ai/512b-apex-model-program.json`, `npm run check:seis-512b-apex-model-program`. | The 512B program is an apex planning, internet-researched frontier baseline, AGI-readiness definition, and public GitHub readiness record only, not AGI, weights, inference, benchmark evidence, cloud/GPU capacity, SSH, or production readiness. | Keep 512B route eligibility blocked until 20B, 70B, 150B, and 300B+ evidence plus clean-room, independent AGI eval protocol, all installed AI/sub-agent council review, public-readiness gates, and approval gates pass. |
| AGI evaluation protocol | Read-only evidence gate, not AGI proof | `content/development/seis-agi-evaluation-protocol.json`, `seis://ai/agi-evaluation-protocol.json`, `node scripts/check-seis-agi-evaluation-protocol.mjs`. | The protocol defines required evidence for a future AGI claim, but no evaluation has run and no AGI claim is allowed. | Keep AGI route eligibility blocked until independent evaluation, red-team, model/system cards, external review, and human approval exist. |
| Fallback behavior | Documented | Local Demo and no-key startup are required. | No runtime gateway. | Keep fallback identity visible in future UI. |

## Rules / Policy

- Core SEIS must boot with zero cloud model-provider keys.
- Automatic routing must preserve the requested capability.
- Local-only mode must never fall back to a cloud provider.
- Fallback must be visible and must show the actual provider and model.
- Missing Key is not Error; Missing Key means credential evidence is absent,
  while Error means a configured route failed or needs repair.
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
- model parameter ladder tests with `npm run check:seis-model-parameter-ladder`
- 150B frontier program tests with `npm run check:seis-150b-frontier-model-program`
- 512B apex program tests with `npm run check:seis-512b-apex-model-program`
- AGI evaluation protocol tests with `node scripts/check-seis-agi-evaluation-protocol.mjs`
- no-key startup test
- local-only fallback test
- rate-limit fixture
- invalid credential fixture
- redacted routing decision log fixture
- client-bundle secret exposure check

## Related Documents

- [seis-ai-core.md](seis-ai-core.md)
- [read-only-model-router-contract.md](read-only-model-router-contract.md)
- [seis-agi-evaluation-protocol.md](seis-agi-evaluation-protocol.md)
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
planned 20B target for 16GB+ RAM, future 70B scale ladder, 150B frontier
research lane, and 512B apex SEIS AGI readiness lane as routing requirements,
not as live model availability. The router must keep all 20B, 70B, 150B, and 512B lanes blocked until
the memory budget contract, quantization or distributed-runtime profile,
runtime adapter, model card, dataset card, safety eval, redacted logs, and
human approval gates have evidence.

The parameter ladder is
`content/development/seis-model-parameter-ladder.json` and is exposed as
`seis://ai/model-parameter-ladder.json`. It extends the route-blocked promotion
order through 20B, 70B, 150B, 300B+, 512B, and highest-available-future classes while
keeping every class in Local Demo, research-roadmap, or not-scoped status until
lower-tier evidence and human approval exist.

The 150B frontier model program is
`content/development/seis-150b-frontier-model-program.json` and is exposed as
`seis://ai/150b-frontier-model-program.json`. The router must read it as a
plan-only non-claim gate, never as an available model or provider fallback.

The 512B apex model program is
`content/development/seis-512b-apex-model-program.json` and is exposed as
`seis://ai/512b-apex-model-program.json`. The router must read it as a
plan-only SEIS AGI readiness gate, never as evidence of AGI, available weights,
benchmarks, provider fallback, or routeable inference.

The read-only model-router contract is
`content/development/seis-read-only-model-router-contract.json` and is
documented in `docs/ai/read-only-model-router-contract.md`. It is validated by
`npm run check:seis-second-brain-readiness-contracts`. The contract may explain
provider-neutral routing decisions, but it must not perform live routing,
validate credentials, receive browser secrets, send private prompts, route
private Obsidian vault content, or silently switch providers.
