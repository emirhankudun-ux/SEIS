---
name: seis-download-anomaly
description: Detect download-count outliers in recorded local metrics without contacting package registries.
---

# SEIS Download Anomaly

Read local JSON download metrics and flag values that exceed a transparent
median plus median-absolute-deviation threshold. The result is an anomaly
signal, not proof of abuse or demand.

## Safety boundary

- Read-only, local-only, and network-disabled.
- Never queries npm, a marketplace, GitHub, or another registry.
- Never deletes, normalizes, or rewrites metric records.

## Command

    node scripts/seis-download-anomaly-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_download_anomaly_status and seis_download_anomaly.

## Goal linkage

Use within SEIS-GOAL-021 for data-quality and release review.
