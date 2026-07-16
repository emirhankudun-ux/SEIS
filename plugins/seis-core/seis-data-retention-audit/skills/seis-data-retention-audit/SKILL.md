---
name: seis-data-retention-audit
description: Review data-contract and privacy documentation presence without reading private data or mutating schemas.
---

# SEIS Data Retention Audit

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-data-retention-audit-mcp-server.mjs --status
    node scripts/seis-data-retention-audit-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
