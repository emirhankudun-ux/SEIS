# SEIS Prompt Engine

## Purpose

Define the versioned prompt and instruction contract for SEIS AI Core. Prompt
profiles are application-layer behavior rules; they are not trained model
weights or foundation-model ownership claims.

## Scope

The prompt engine will manage system prompts, task prompts, agent prompts,
review prompts, repository scan prompts, security prompts, clean-room prompts,
and compact context packages.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Prompt registry | Planned | No versioned prompt registry exists in this branch. | No schema or fixtures. | Define prompt-pack schema. |
| Prompt versioning | Documented | This document and `docs/ai/seis-ai-core.md`. | No regression suite. | Add golden conversation fixtures later. |
| Context budget | Planned | No prompt budget records found. | No runtime tokenizer/counter. | Start with static budgets and manual review. |
| Safety prompts | Documented | `AGENTS.md`, `SECURITY.md`, this contract. | No prompt injection regression tests. | Add repository-content injection fixtures. |

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

Before the prompt engine is marked implemented, add:

- prompt-pack schema
- at least three reviewed prompt fixtures
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

Create a small prompt-pack schema and fixture set without connecting any live
provider.
