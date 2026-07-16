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
| Prompt registry | Prototype | `schemas/goal-tracking-mega-prompt-pack.schema.json` and `prompts/goal-tracking-update-v1/`. | One reviewed pack is not a general registry. | Add two more capability-specific packs and registry discovery. |
| Prompt versioning | Prototype | Pinned source, compiler, output, manifest, and chunk SHA-256 records for Goal Tracking v1. | No golden conversation suite across capabilities. | Add reviewed golden conversations later. |
| Context budget | Prototype | Exact Unicode code-point count and bounded semantic chunks for the Goal Tracking corpus. | No provider tokenizer or model-specific token budget. | Add provider-neutral compact-context evaluation. |
| Safety prompts | Prototype | Tracked-source allowlist, redacted secret/private-path checks, authority router, and adversarial fixtures. | Broader repository-content injection suite remains missing. | Add cross-pack prompt-injection fixtures. |

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

## Goal Tracking Update Prototype

`ECO-GOAL-0007` adds the first versioned pack under
`prompts/goal-tracking-update-v1/`. A standard-library Node compiler produces a
canonical corpus of exactly 5,000,000 Unicode code points after NFC and LF
normalization. It emits semantic payload chunks, contextual envelopes, and a
stable manifest under ignored `build/`; the reviewed golden hash contract is
committed at `prompts/goal-tracking-update-v1/expected-build.json`.

The exact-fit algorithm expands unique Goal scenarios and selects unique
semantic micro-directives through a fail-closed subset solver. Whitespace,
repeated-character, copied-paragraph, hash, and truncation padding are forbidden.
The corpus is a provenance and retrieval artifact; it is not claimed to fit one
provider request, and no live model or credential is connected.

This prototype does not complete the Prompt Engine. The broader completion bar
above still requires three reviewed prompt fixtures, golden conversations,
cross-pack injection and redaction coverage, and archive-promotion review.

## Related Documents

- [seis-ai-core.md](seis-ai-core.md)
- [model-router.md](model-router.md)
- [agent-runtime.md](agent-runtime.md)
- [../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](../reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md)

## Next Safe Action

Review the Goal Tracking v1 pack, then add two small capability-specific packs
and cross-pack golden, injection, compact-context, and redaction fixtures without
connecting any live provider.
