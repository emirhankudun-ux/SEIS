# Prompt Regression Suite

Status: Fixture-backed foundation

Prompt regression tests make SEIS prompt behavior reviewable before prompts are
treated as stable AI Core assets.

## Test Types

- task classification fixtures
- privacy mode fixtures
- prompt rendering snapshots
- forbidden-input handling
- output schema checks
- refusal and blocked-state checks
- documentation overclaim checks
- security and secret-redaction checks
- Command Center state wording checks

## Fixture Rules

- Use synthetic or public examples.
- Do not include secrets, private repository data, provider keys, or restricted
  references.
- Label expected behavior clearly.
- Keep fixtures small enough for fast local and CI checks.

## Fixture Evidence

The first fixture-backed prompt regression pack lives under
`packages/prompt-engine/`:

- `schemas/prompt-regression-suite.schema.json`
- `fixtures/assistant-surface-regression-suite.json`
- `npm run check:prompt-regression-fixtures`

The assistant surface suite covers:

- repository assistant
- documentation assistant
- architecture reviewer
- security reviewer
- PR reviewer
- roadmap assistant
- research assistant

The suite is local and fixture-only. It does not execute live model calls,
benchmark provider or model quality, start training, publish model safety
claims, route sensitive data to external providers, or enable GitHub, SSH,
deployment, or privileged automation writes.

## Promotion Gate

A prompt version can move from draft to reviewed only after regression fixtures
cover its primary task, safety boundary, expected output shape, and failure
mode.
