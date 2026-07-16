---
name: seis-goal-dependency-map
description: Summarize goal, evidence, and architecture dependencies before a plugin or release handoff.
---

# SEIS Goal Dependency Map

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-goal-dependency-map-mcp-server.mjs --status
    node scripts/seis-goal-dependency-map-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
