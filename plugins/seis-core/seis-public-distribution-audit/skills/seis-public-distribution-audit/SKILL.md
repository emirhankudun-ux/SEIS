---
name: seis-public-distribution-audit
description: Validate that public SEIS Repo marketplace projections agree without executing plugin code or changing files.
---

# SEIS Public Distribution Audit

Validate the public SEIS Repo distribution boundary across the marketplace,
Command Center source inventory and catalog, unified suite, lifecycle record,
and project manifest.

## Safety boundary

- Local-only and read-only.
- Reads only fixed public repository contract files.
- Does not execute plugin code, follow symlinks, write files, use credentials,
  access cloud folders, or access the network.
- Keeps intentional legacy compatibility aliases out of active public
  distribution assertions.

## Commands

    node scripts/seis-public-distribution-audit-mcp-server.mjs --status
    node scripts/seis-public-distribution-audit-mcp-server.mjs --validate

The MCP tools are seis_public_distribution_audit_status and
seis_public_distribution_audit_validate.

## Goal linkage

Use within SEIS-GOAL-021 to keep public SEIS Repo distribution projections
aligned as app-owned and topic plugin families grow.
