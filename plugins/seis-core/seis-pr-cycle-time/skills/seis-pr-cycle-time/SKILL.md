---
name: seis-pr-cycle-time
description: Measure recorded pull-request cycle times from local JSON evidence without contacting GitHub.
---

# SEIS PR Cycle Time

Read local pull-request records with opened and merged timestamps and report
durations plus simple distribution summaries.

## Safety boundary

- Read-only and local-only.
- Uses recorded timestamps only; it does not call GitHub or infer current
  review performance.
- Does not change PRs, comments, labels, or branches.

## Command

    node scripts/seis-pr-cycle-time-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_pr_cycle_time_status and seis_pr_cycle_time.

## Goal linkage

Use within SEIS-GOAL-021 for developer-experience evidence and human review.
