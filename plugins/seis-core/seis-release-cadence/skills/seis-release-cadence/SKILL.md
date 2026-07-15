---
name: seis-release-cadence
description: Analyze bounded local changelog release intervals without GitHub or publishing access.
---

# SEIS Release Cadence

Use this skill to inspect dated or versioned local changelog headings and
report interval evidence.

## Safety boundary

- Read-only and local-only.
- Never query GitHub, tags, releases or publishing services.
- Cadence is evidence, not a delivery-performance claim.

## Command

    node scripts/seis-release-cadence-mcp-server.mjs --analyze --path /path/to/repository

The MCP tools are seis_release_cadence_status and seis_release_cadence.

## Goal linkage

Use within SEIS-GOAL-021 and keep undated release headings explicitly
not-verified.
