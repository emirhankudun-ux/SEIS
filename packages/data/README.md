# Data Package

Shared data adapters and analytics helpers live here.

## Scope

- repository inventory adapters
- zip audit readers
- visibility audit readers
- backlog sync models
- dashboard extract helpers
- knowledge source classification fixtures for local-only, redacted, restricted,
  expired, and blocked retrieval boundaries

This package should keep raw local file paths and secrets out of runtime client bundles.

## Knowledge Source Classification

`fixtures/knowledge-source-classification.json` defines the current fixture-backed
source classes used by SEIS AI and Command Center surfaces. It keeps retrieval
state, provenance, privacy posture, approval boundaries, and exclusion reasons
explicit before any live memory, RAG, provider, or remote workspace integration.

Validate the contract from the repository root:

```bash
npm run check:knowledge-source-classification
```
