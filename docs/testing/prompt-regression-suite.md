# Prompt Regression Suite

Status: Foundation test plan

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

## Promotion Gate

A prompt version can move from draft to reviewed only after regression fixtures
cover its primary task, safety boundary, expected output shape, and failure
mode.
