---
name: seis-marketplace-integrity
description: Validate the public SEIS Repo marketplace card and manifest contract without executing code or changing files.
---

# SEIS Marketplace Integrity

Validate the public SEIS Repo marketplace identity, card uniqueness, source-path
boundaries, and matching plugin manifests.

## Safety boundary

- Local-only and read-only.
- Reads only the repository marketplace manifest and declared plugin manifests.
- Does not execute plugin code, follow symlinks, write files, use credentials,
  access cloud folders, or access the network.
- Reports public card names, safe relative paths, and coded findings only.

## Command

    node scripts/seis-marketplace-integrity-mcp-server.mjs --status
    node scripts/seis-marketplace-integrity-mcp-server.mjs --validate

The MCP tools are `seis_marketplace_integrity_status` and
`seis_marketplace_integrity_validate`.

## Goal linkage

Use within SEIS-GOAL-021 to preserve the public SEIS Repo marketplace boundary.
