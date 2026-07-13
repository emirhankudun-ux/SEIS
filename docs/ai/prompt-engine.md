# SEIS Prompt Engine

## Purpose

Define the versioned prompt and instruction contract for SEIS AI Core. Prompt
profiles are application-layer behavior rules; they are not trained model
weights or foundation-model ownership claims.

## Scope

The prompt engine manages system prompts, task prompts, review prompts, coding
prompts, documentation prompts, security prompts, SSH review prompts, and
clean-room prompts. Agent work uses the same versioned templates through the
typed local runtime.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Prompt registry | Implemented locally | `SeisAIPromptEngine.defaultEngine` contains eight typed templates. | No live provider adapter. | Keep the registry local and source-reviewed. |
| Prompt versioning | Implemented | `SeisAIPromptEngine.currentVersion` and template versions. | No golden conversation corpus. | Add reviewed fixtures before provider promotion. |
| Context budget | Bounded static contract | `SeisAIPromptEngine.maximumRenderedPromptLength` is 16,384 characters. | No tokenizer-backed token counter. | Add a platform tokenizer only when a provider adapter is approved. |
| Safety prompts | Partial local enforcement | Undeclared variables, secret-shaped templates, and secret-like values fail closed. | No repository-content prompt-injection corpus. | Add injection fixtures and redaction tests. |

## Rules / Policy

- Prompts must not contain secrets, private keys, real tokens, or private host
  addresses.
- Prompts must not copy proprietary or leaked system prompts.
- Every prompt pack must state purpose, allowed inputs, forbidden inputs,
  output schema, safety boundaries, and validation method.
- Historical archive prompts are reference material only until reviewed and
  promoted.
- Prompt engineering, RAG, and provider routing must not be described as model
  training.

## Prompt Pack Fields

Each future prompt pack should include:

- id
- title
- version
- owner area
- intended capability
- allowed context
- denied context
- provider capability requirements
- output schema
- evaluation fixture
- rollback note

## Evidence Requirements

Before a live adapter is approved, add:

- at least three reviewed prompt fixtures beyond the local catalog
- golden conversation tests
- prompt injection tests
- compact context test
- redaction test
- archive promotion review notes

## Related Documents

- [seis-ai-core.md](seis-ai-core.md)
- [model-router.md](model-router.md)
- [agent-runtime.md](agent-runtime.md)
- [../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md)

## Next Safe Action

Keep the local Swift catalog passing, add prompt-injection fixtures, and do not
connect a live provider until server-only environment validation and human
approval exist.
