# Data Package

Shared data adapters and analytics helpers live here.

## Scope

- repository inventory adapters
- zip audit readers
- visibility audit readers
- backlog sync models
- dashboard extract helpers
- AI Core knowledge-source and retrieval fixtures
- metadata-only token-feed planning fixtures

This package should keep raw local file paths and secrets out of runtime client bundles.

## AI Core Fixture Registry

- `fixtures/knowledge-source-classification.json` defines approved, blocked,
  archive, local-only, and metadata-only knowledge-source classes. Validate it
  with `npm run check:knowledge-source-classification`.
- `fixtures/local-readonly-retrieval-query-adapter.json` defines the read-only
  Command Center retrieval adapter. Validate it with
  `npm run check:retrieval-query-adapter`.
- `fixtures/local-readonly-retrieval-search-transcript.json` defines no-content
  retrieval transcripts and result-card boundaries. Validate it with
  `npm run check:retrieval-search-transcript`.
- `fixtures/seis-10m-token-feed-budget.json` defines the metadata-only
  10,000,000-token planning budget. Validate it with
  `npm run check:token-feed-budget`.

These fixtures are local contract evidence only. They do not perform provider
calls, create embeddings, ingest raw repository content, write persistent
memory, run benchmarks, or claim model training.
