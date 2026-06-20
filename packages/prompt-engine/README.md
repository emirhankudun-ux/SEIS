# @seis/prompt-engine

Status: Foundation contract package

This package will hold prompt metadata, prompt versioning helpers, and prompt
regression support for SEIS AI Core. It does not contain provider keys or copied
third-party system prompts.

## Planned Responsibilities

- load reviewed prompt assets
- validate prompt metadata
- bind prompts to agent roles and router profiles
- support prompt regression fixtures
- prevent secret-bearing prompt content

## Current Fixture Evidence

- `schemas/prompt-regression-suite.schema.json` defines the local prompt
  regression suite shape.
- `fixtures/assistant-surface-regression-suite.json` covers repository,
  documentation, architecture, security, PR, roadmap, and research assistant
  surfaces with synthetic fixture inputs.
- `npm run check:prompt-regression-fixtures` validates schema coverage,
  assistant-surface coverage, source paths, approval triggers, non-claim
  boundaries, and secret-pattern guardrails.

This package remains fixture-only. It does not execute a live model, call an
external provider, claim benchmark performance, or create trained SEIS model
evidence.

See `docs/ai/prompt-engine.md`.
