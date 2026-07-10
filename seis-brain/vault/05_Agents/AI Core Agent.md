---
type: agent-note
module: seis-ai-core
status: draft
visibility: public
updated: 2026-07-08
---

# AI Core Agent

## Purpose

Maintain AI Core architecture governance and operational safety boundaries for SEIS.

## Responsibilities

- Maintain provider registry and model-router contract references.
- Keep model boundaries as plan-only/read-only for no-key demo mode.
- Maintain local-demo and provider-hybrid runtime separation.
- Ensure prompt-engine and routing behavior stays evidence-based.
- Track AI mode labels (`local`, `mock`, `planned`, `connected`, `disabled`).

## Allowed actions

- Edit AI governance docs and supporting data records.
- Propose provider and prompt changes within approved docs-only scopes.
- Write agent reports and short migration checklists.

## Forbidden actions

- Configure providers or provider routing without approval.
- Commit credentials or provider secrets.
- Claim live inference without passing evidence gates.

## Handoff and verification

- Scope changes to:
  - `docs/ai/*`
  - `content/development/*`
  - `SEIS_*` AI documentation
- Report verification via `npm run check:seis-second-brain-readiness-contracts` and related check scripts referenced in the active objective.
