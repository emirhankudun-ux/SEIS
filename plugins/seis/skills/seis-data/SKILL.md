---
name: seis-data
description: Use SEIS-DATA for data architecture, analytics, reporting, schema design, generated JSON/Markdown reports, data governance, knowledge registries, RAG or memory planning, source provenance, and safe dataset handling inside SEIS. Trigger when Codex needs to model, validate, transform, audit, document, or analyze SEIS data while preserving privacy, reproducibility, security, and source-backed outputs.
---

# SEIS-DATA

## Overview

Use this skill as the SEIS data and knowledge lane. It keeps data changes structured, reproducible, source-backed, privacy-aware, and connected to generated reports instead of becoming disconnected JSON edits.

## Workflow

1. Classify the data surface: source registry, generated report, schema, analytics result, knowledge artifact, local dataset, external connector, or user-provided file.
2. Check sensitivity before reading, transforming, exporting, or committing data. Never store secrets, tokens, raw credentials, private personal data, or unsafe dumps.
3. Prefer structured parsers and repo generators over ad hoc string manipulation.
4. Identify the source of truth before editing: `data`, `content/development`, `packages/seis_kernel`, `scripts/create-*`, `reports`, or docs.
5. Keep provenance visible: source paths, generator scripts, date ranges, filters, assumptions, and validation commands.
6. Regenerate derived reports when source records change, and avoid hand-editing generated artifacts when a generator owns them.
7. Validate JSON, schema expectations, report parity, and any code paths touched by the data change.

## Data Lanes

- Repository data: `data/*.json`, inventories, plugin audits, migration records, cloud readiness, and GitHub consolidation records.
- Generated reports: `reports/*.json`, `reports/*.md`, and their generator scripts.
- Development content: `content/development/*.json`, capability maps, plugin lanes, LLM routing, AGI system records, and technology stack records.
- Kernel-backed models: `packages/seis_kernel` builders and checks that generate or validate source records.
- Analytics and research: metrics, dashboards, notebooks, data visualizations, RAG planning, memory registries, and dataset summaries.

## Guardrails

- Do not invent data, dates, totals, source URLs, plugin states, repository status, or authentication status.
- Do not expose PII, credentials, tokens, certificates, private financial data, or proprietary datasets.
- Mark uncertainty when data is partial, stale, sampled, or connector-gated.
- Keep generated Markdown and JSON synchronized when the repo uses paired reports.
- Preserve deterministic ordering when sampling or writing records so diffs remain reviewable.

## Helper Routing

Use helper plugins only when they directly support the data task:

- Data Analytics, Build Web Data Visualization, Deepnote, Spreadsheets, and MotherDuck for analytics/reporting workflows.
- Airtable, Supabase, Neon Postgres, Convex, Firebase, MongoDB, Redis, and Postgres tools for scoped schema or backend data work.
- Google Drive, Google Sheets, Notion, Box, and Documents when the source artifact lives in a workspace document system.
- Semrush, Conductor, Similarweb, PostHog, Mixpanel, Datadog, Sentry, and Statsig only for authenticated, scoped metrics or observability tasks.

## Validation

Prefer checks already wired into SEIS:

- `npm run check:plugin-capability-lanes`
- `npm run check:seis-technology-stack`
- `npm run check:seis-agi-system`
- `npm run check:universal-capability-kernel`
- `npm run check:language-distribution`
- direct JSON parsing or package-local tests for touched datasets
