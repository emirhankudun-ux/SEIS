# ADR-0001: SEIS God Mode Operating System

## Status

Accepted

## Context

SEIS needs development work to improve product experience, application platform, AI/agent behavior, security, governance, validation, and documentation together instead of producing isolated feature fragments.

## Decision

Adopt God Mode as a source-controlled operating layer with module coverage, release readiness, validation plan, work package, ADR workflow, and quality gates.

## Consequences

God Mode work becomes heavier than a quick feature patch, but the added structure improves long-term maintainability, auditability, rollback readiness, and cross-module consistency.

## Security

Security is a required release gate. God Mode work must preserve secret-safety, avoid destructive operations without explicit approval, and keep rollback paths explicit.

## AI Policy

Agentic behavior must declare skill source, autonomy boundary, tool boundary, safety boundary, and validation duty before it is treated as an active SEIS capability.

## Validation

Minimum validation is defined by:

```bash
npm run check:seis-god-mode-validation-plan
npm run check:seis-god-mode-work-package
npm run check:seis-god-mode-adr-workflow
npm run quality:governance
```

## Rollback

Rollback requires removing the God Mode contracts, docs, checkers, dashboard panels, package scripts, plugin references, and governance index entries as a bounded slice.
