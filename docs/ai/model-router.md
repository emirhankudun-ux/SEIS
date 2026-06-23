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
| Router implementation | Planned | No central router implementation exists in this branch. | Provider registry and typed environment validation are missing. | Implement a small server-only registry first. |
| Routing policy | Documented | This document and `docs/ai/seis-ai-core.md`. | No runtime policy tests. | Add fixtures before live providers. |
| Provider state model | Documented | `Available`, `Missing Key`, `Disabled`, `Rate Limited`, `Error`. | No status persistence or health checks. | Add non-secret status fixtures. |
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
- provider registry contract tests
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
live provider adapter work.
