---
name: seis-dora-metrics
description: Compute DORA-style delivery signals from recorded local deployment evidence without live GitHub or provider access.
---

# SEIS DORA Metrics

Analyze local JSON records that contain deployment, lead-time, recovery, or
change-failure evidence. The result is a bounded measurement of the supplied
records, not a live repository or organization claim.

## Safety boundary

- Read-only, local-only, and network-disabled.
- Never queries GitHub, a registry, a provider, or a deployment system.
- Never writes source data and never claims missing records are zero.

## Command

    node scripts/seis-dora-metrics-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_dora_metrics_status and seis_dora_metrics.

## Goal linkage

Use within SEIS-GOAL-021 and attach the input evidence and limitations to the
observability review.
