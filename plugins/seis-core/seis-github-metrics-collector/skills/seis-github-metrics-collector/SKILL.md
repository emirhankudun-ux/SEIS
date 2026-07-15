---
name: seis-github-metrics-collector
description: Normalize recorded GitHub-style metrics from local evidence while explicitly reporting that no live API was used.
---

# SEIS GitHub Metrics Collector

This local demo consumes saved metric snapshots and exposes their source and
coverage. The name describes the metric shape, not a live connection.

## Safety boundary

- Read-only and local-only.
- No GitHub API, token, provider, or network access.
- No collection claim is made unless a local snapshot exists.

## Command

    node scripts/seis-github-metrics-collector-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_github_metrics_collector_status and
seis_github_metrics_collector.

## Goal linkage

Use within SEIS-GOAL-021 for public-safe metrics and provenance review.
