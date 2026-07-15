---
name: seis-contributor-map
description: Summarize recorded contributor and ownership evidence with redacted local identifiers.
---

# SEIS Contributor Map

Read local contributor, CODEOWNERS, or ownership records and produce
public-safe aggregate counts. Identifiers are reduced to deterministic
redacted values; raw emails and names are never emitted.

## Safety boundary

- Read-only, local-only, and network-disabled.
- No GitHub API calls and no repository or source-data writes.
- The output describes supplied records only and is not an organizational
  authority map.

## Command

    node scripts/seis-contributor-map-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_contributor_map_status and seis_contributor_map.

## Goal linkage

Use within SEIS-GOAL-021 for ownership and public-readiness review.
