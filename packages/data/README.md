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
- `npm run check:knowledge-source-classification` validates that restricted
  archive material remains blocked and that unsafe patterns such as automatic
  push/merge, active countermeasures, poisoned data injection, memetic
  manipulation, autonomous payment/provisioning, fake BCI claims, and fake model
  ownership claims are excluded.
