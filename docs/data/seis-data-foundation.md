# SEIS Data Foundation

## Purpose

Define `@seis-data` as the governed records, evidence, inventory, and analytics
lane for SEIS.

## Scope

The foundation covers:

- structured JSON records
- evidence ledger
- schema expectations
- generated reports
- data freshness
- source provenance
- validation commands

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Repository records | Registry-backed | `content/development/seis-data-schema-registry.json` | Schema coverage is still partial. | Expand schema registry in small batches. |
| Goal records | Validated in prior status | `content/development/seis-goal-*.json`, `scripts/check-goal-tracking.mjs` | Current validation must be rerun after edits. | Keep goal records validator-backed. |
| Generated reports | Scaffolded | `reports/*.md`, `reports/*.json` | Some reports depend on deleted scripts. | Reconcile report generators. |
| Data package | Placeholder/scaffolded | `packages/data/README.md` | No adapter implementation found. | Define adapter contract before code. |
| Schema registry | Validated | `scripts/check-data-schema-registry.mjs` | Top-level checks only; no full JSON Schema coverage yet. | Add semantic checks for critical records. |

## Rules / Policy

- Unknown data status stays unknown.
- Generated reports must name their source.
- Evidence must not contain secrets.
- Personal data and credentials must never enter analytics records.
- Stale data must be labeled stale.
- Mock records cannot prove live readiness.

## Evidence Requirements

Data surfaces need:

- source file path
- generation method
- validation command
- last review date
- known limitations
- owner lane

## Related Documents

- [../goals/evidence-ledger.md](../goals/evidence-ledger.md)
- [schema-registry.md](schema-registry.md)
- [../goals/goal-tracking-system.md](../goals/goal-tracking-system.md)
- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)
- [../STATUS.md](../STATUS.md)

## Next Safe Action

Expand the schema registry with semantic checks for the highest-risk JSON
records before adding new data adapters.
