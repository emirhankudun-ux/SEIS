# @seis/model-router

Status: Fixture-backed contract package

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

## Current Fixture Evidence

- `schemas/model-router-route-contract.schema.json` defines the request,
  decision, response, and audit metadata shape.
- `fixtures/model-router-route-contracts.json` covers local-only,
  metadata-only, and approval-needed provider routes.
- `npm run check:model-router-contracts` validates route modes, source links,
  approval boundaries, safe audit metadata, non-claims, and secret hygiene.

The current fixture pack does not call model providers, configure provider
keys, expose browser-side secrets, run benchmarks, or claim live provider
readiness.

See `docs/ai/model-router.md`.
