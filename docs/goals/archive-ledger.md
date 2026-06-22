# Goal Archive Ledger

The Goal Archive Ledger keeps historical, deferred, and review-candidate
material separate from active official Goal Tracking OS records.

## Purpose

- Prevent raw archive material from becoming official direction by accident.
- Keep tracked deletion candidates visible without staging deletion changes.
- Keep unsupported public or release readiness claims deferred until evidence
  exists.

## Source Record

- `content/development/seis-goal-archive-ledger.json`

## Current Archive Items

| ID | Status | Classification | Scope |
| --- | --- | --- | --- |
| `SEIS-ARCHIVE-001` | historical-reference | archive_only | Historical AI and prompt material boundary. |
| `SEIS-ARCHIVE-002` | review-candidate | repository_hygiene | Tracked deletion review candidates. |
| `SEIS-ARCHIVE-003` | deferred-readiness | unsupported_claim | Deferred public and release readiness claims. |

## Reference-Only Material To Classify

These paths should remain reference-only until a dedicated archive-ledger PR
adds structured source records and validation coverage:

- `archive/external-agent-systems/`
- `.agents/`
- `.claude/`
- `.codex/`

They may contain useful assistant patterns, but they do not override
`AGENTS.md`, `SECURITY.md`, architecture docs, or current SEIS AI Core policy.

## Rules

- Archive material is historical reference by default.
- Review candidates require a dedicated review before promotion, restore,
  replacement, or approved removal.
- Deferred readiness claims require direct dry-run evidence before promotion.
- The archive ledger must not include secrets, private hostnames, `.env` values,
  provider keys, private keys, or private user data.

## Validation

`npm run check:goal-tracking` validates archive item ids, statuses,
classifications, goal references, evidence references, repo-relative paths, and
the generated Command Center archive panel.

## Next Safe Action

Use this ledger to keep historical material and blocked cleanup work visible
without treating it as active implementation evidence.
