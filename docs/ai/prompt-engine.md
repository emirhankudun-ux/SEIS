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
| Prompt registry | Documented fixture | `content/development/seis-prompt-pack-schema.json`, `content/development/seis-prompt-pack-fixtures.json`, `npm run check:seis-prompt-pack-contracts`. | No runtime prompt execution or live provider adapter. | Wire reviewed fixtures into Prompt Engine Studio after route merge. |
| Prompt versioning | Documented fixture | Versioned prompt packs in `content/development/seis-prompt-pack-fixtures.json`. | No golden conversation regression suite yet. | Add redacted golden conversation fixtures later. |
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

## Current Prompt-Pack Contract Artifacts

The first prompt-pack contract artifacts are now schema-backed static fixtures:

- `content/development/seis-prompt-pack-schema.json` defines the required fields, public safety invariants, and execution policy invariant for prompt packs.
- `content/development/seis-prompt-pack-fixtures.json` contains a `reviewed-fixture-set` for base SEIS identity, repository audit, security review, PR rescue, and clean-room demo packaging.
- `npm run check:seis-prompt-pack-contracts` validates the schema, fixtures, package script, safety boundaries, and this document.

These artifacts keep `promptExecuted: false`, `providerCalled: false`, and `credentialRead: false`. They are implementation evidence for prompt-pack metadata only; they do not execute prompts, call providers, validate credentials, train a model, read private archives, or promote historical prompt material automatically.

## Evidence Requirements

Before the prompt engine is marked implemented, add:

- prompt-pack schema: `content/development/seis-prompt-pack-schema.json`
- at least three reviewed prompt fixtures: `content/development/seis-prompt-pack-fixtures.json`
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

Wire the reviewed prompt-pack fixture set into Prompt Engine Studio after its route merges, then add redacted golden conversation, prompt injection, compact context, and redaction tests before any live provider adapter consumes prompt packs.
