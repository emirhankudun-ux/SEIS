---
name: seis-rollback-readiness
description: Verify that release and operational surfaces retain a documented rollback path before handoff.
---

# SEIS Rollback Readiness

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-rollback-readiness-mcp-server.mjs --status
    node scripts/seis-rollback-readiness-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
