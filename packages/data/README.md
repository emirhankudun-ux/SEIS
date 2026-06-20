# Data Package

Shared data adapters and analytics helpers live here.

## Scope

- repository inventory adapters
- zip audit readers
- visibility audit readers
- knowledge source classification fixtures
- retrieval and memory boundary records
- backlog sync models
- dashboard extract helpers

This package should keep raw local file paths and secrets out of runtime client bundles.

## Current Fixture Evidence

- `schemas/knowledge-source-classification.schema.json` defines SEIS-owned
  source classes, retrieval states, privacy modes, and unsafe-source exclusion
  rules.
- `fixtures/knowledge-source-classification.json` classifies official docs,
  generated reports, local fixture contracts, and discarded assistant archive
  material without ingesting raw archive content.
- `schemas/token-feed-budget.schema.json` and
  `fixtures/seis-10m-token-feed-budget.json` define the first 10,000,000 token
  metadata-only feed budget for SEIS. The fixture keeps `tokensExecuted` at `0`
  and links the budget to model-router, knowledge-source, shared contract, and
  Command Center evidence without storing raw content.
- `npm run check:knowledge-source-classification` validates that restricted
  archive material remains blocked and that unsafe patterns such as automatic
  push/merge, active countermeasures, poisoned data injection, memetic
  manipulation, autonomous payment/provisioning, fake BCI claims, and fake model
  ownership claims are excluded.
- `npm run check:token-feed-budget` validates that the planned allocations total
  10,000,000 tokens, no token ingestion is claimed, and provider calls,
  embeddings, persistent memory writes, raw-content storage, and model training
  remain disabled.
