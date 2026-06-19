# @seis/model-router

Status: Placeholder contract package

This package will hold the provider-neutral routing layer for SEIS AI Core.
It is not connected to live providers in this foundation pass.

## Planned Responsibilities

- classify task type and data class
- choose privacy mode
- choose provider or local model profile
- attach prompt version and evaluation profile
- return structured route metadata
- fail closed when approval or configuration is missing

## First Build Rule

Start with pure functions, fixtures, and tests. Add provider adapters only after
privacy policy and evaluation fixtures are stable.

See `docs/ai/model-router.md`.
