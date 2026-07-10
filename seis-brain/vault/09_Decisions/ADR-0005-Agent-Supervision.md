---
type: adr
status: draft
visibility: public
updated: 2026-06-29
---

# ADR-0005 Agent Supervision

## Decision
All agents run as bounded, human-reviewed workers with explicit scope and no
silent autonomy.

## Consequences
- easier auditability
- no hidden destructive actions
