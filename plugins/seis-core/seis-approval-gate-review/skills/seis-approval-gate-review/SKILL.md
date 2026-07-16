---
name: seis-approval-gate-review
description: Review human approval boundaries and release-gate evidence without executing gated work.
---

# SEIS Approval Gate Review

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-approval-gate-review-mcp-server.mjs --status
    node scripts/seis-approval-gate-review-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
