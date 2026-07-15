---
name: seis-maintainer-risk
description: Assess missing ownership, stale activity, and bus-factor signals from recorded local evidence.
---

# SEIS Maintainer Risk

Read local ownership and activity records and surface risk signals for human
governance review. It does not infer personal performance or make staffing
decisions.

## Safety boundary

- Read-only, local-only, and network-disabled.
- No live GitHub queries and no repository writes.
- Risk signals are evidence gaps and review prompts, not conclusions about
  people.

## Command

    node scripts/seis-maintainer-risk-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_maintainer_risk_status and seis_maintainer_risk.

## Goal linkage

Use within SEIS-GOAL-021 for governance, ownership, and resilience review.
