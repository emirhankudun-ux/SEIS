---
name: seis-cost-latency-budget
description: Verify that routing metadata keeps cost and latency considerations visible without calling providers.
---

# SEIS Cost and Latency Budget

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-cost-latency-budget-mcp-server.mjs --status
    node scripts/seis-cost-latency-budget-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
