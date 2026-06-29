---
type: adr
status: draft
visibility: public
updated: 2026-06-29
---

# ADR-0008 No Frontend Secrets

## Decision
Frontend code and docs do not store provider credentials.

## Consequences
- security surface reduced
- backend-only secret handling required
