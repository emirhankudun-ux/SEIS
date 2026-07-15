---
name: seis-performance-budget
description: Audit bounded local performance budget declarations without running benchmarks.
---

# SEIS Performance Budget

Use this skill to inspect local JSON budgets for startup, latency, bundle,
memory and CPU values.

## Safety boundary

- Read-only and local-only.
- Never runs benchmarks, builds or UI tests.
- Declared or recorded values are not current runtime measurements.

## Command

    node scripts/seis-performance-budget-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_performance_budget_status and
seis_performance_budget.

## Goal linkage

Use within SEIS-GOAL-021 and send exceeded budgets to performance review.
