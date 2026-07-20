---
name: seis-trusted-marketplace
description: Review the public SEIS Repo trusted-source marketplace intake and activation gates without installing or enabling external capabilities.
---

# SEIS Trusted Marketplace

Review the public SEIS Repo card for this plugin, the curated trusted-source
intake, and the policy gates that must be met before an external marketplace
source can be activated.

## Safety boundary

- Local-only and read-only.
- Reads only fixed public SEIS repository contracts.
- Does not install plugins, call providers, read credentials, follow symlinks,
  write files, or access the network.
- Treats every external source as approval-gated until target, authorization,
  rollback, and scope are explicit.

## Commands

    node scripts/seis-trusted-marketplace-mcp-server.mjs --status
    node scripts/seis-trusted-marketplace-mcp-server.mjs --validate

The MCP tools are `seis_trusted_marketplace_status` and
`seis_trusted_marketplace_validate`.

## Goal linkage

Use within SEIS-GOAL-021 to keep trusted-source curation public, visible in
SEIS Repo, and separate from external activation.
