# SEIS Data Schema Registry

## Purpose

Define the first validator-backed registry for SEIS structured records across
`@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`.

## Scope

This registry covers repository-local data contracts only. It does not claim
that every record has a formal JSON Schema, live database table, API contract,
or production data pipeline.

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Registry record | Validated | `content/development/seis-data-schema-registry.json` | Coverage is still partial. | Expand records in small batches. |
| Validator | Validated | `scripts/check-data-schema-registry.mjs` | It checks top-level shapes, not full semantic schemas. | Add per-record semantic checks where useful. |
| Package command | Validated | `npm run check:data-schema-registry` | Not part of full `quality` because `check:foundation` is blocked. | Add to quality after repo hygiene recovery. |

## Rules / Policy

- Every registered record must have a clear lane, source type, current status,
  validation command, freshness rule, and secret policy.
- A registered JSON record must parse successfully.
- Required top-level keys must exist before a record can be called validated.
- A validation command must map to an existing `package.json` script.
- The registry may name secret variable names, but it must never include secret
  values.
- Text files may be registered only when they are source artifacts, not runtime
  data.

## Evidence Requirements

Each registry entry should include:

- repository-relative path
- owner lane
- current status
- expected shape
- required top-level keys
- validation command
- freshness rule
- secret policy

## Related Documents

- [seis-data-foundation.md](seis-data-foundation.md)
- [../STATUS.md](../STATUS.md)
- [../SEIS_MASTER_INDEX.md](../SEIS_MASTER_INDEX.md)

## Next Safe Action

Add semantic checks for the most critical records: goal evidence, cloud
environment, code automation plan, plugin interface roadmap, and design tokens.
