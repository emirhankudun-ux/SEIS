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
- `schemas/retrieval-query-adapter.schema.json` and
  `fixtures/local-readonly-retrieval-query-adapter.json` define the first
  local-only, read-only retrieval adapter for Command Center evidence lookup.
  It returns metadata and evidence links only; it does not call providers,
  expose provider keys, store raw content, create embeddings, write persistent
  memory, mutate GitHub, execute SSH, deploy, pay, or provision
  infrastructure.
- `schemas/retrieval-search-transcript.schema.json` and
  `fixtures/local-readonly-retrieval-search-transcript.json` define the first
  Command Center Retrieval Result Cards and No-Content Search Transcripts.
  These records expose metadata, blocked/empty search states, and evidence
  links only; they do not expose raw content, call providers, create
  embeddings, write persistent memory, search secrets, mutate GitHub, execute
  SSH, deploy, pay, or provision infrastructure.
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
- `npm run check:retrieval-query-adapter` validates that the local retrieval
  adapter references only approved/local knowledge source ids, keeps the
  discarded assistant archive blocked, uses repository-relative evidence paths,
  and keeps provider calls, secrets, raw-content storage, embeddings, memory
  writes, GitHub writes, SSH, deployment, payment, and infrastructure mutation
  disabled.
- `npm run check:retrieval-search-transcript` validates that retrieval result
  cards reference approved/local source ids, no-content transcripts keep
  `resultCount` at `0`, blocked archive requests stay blocked, and all raw
  content, provider, embedding, memory-write, GitHub, SSH, deployment, payment,
  and infrastructure actions remain disabled.
- `npm run check:token-feed-budget` validates that the planned allocations total
  10,000,000 tokens, no token ingestion is claimed, and provider calls,
  embeddings, persistent memory writes, raw-content storage, and model training
  remain disabled.
