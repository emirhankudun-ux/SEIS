---
name: seis-plugin-discovery
description: Browse public SEIS Repo cards and inspect selected local plugin metadata without executing code.
---

# SEIS Plugin Discovery

Browse the public SEIS Repo marketplace catalog or inspect an explicitly selected
directory and report safe plugin metadata, ownership classification, and missing
review fields.

## Safety boundary

- Metadata-only, local-only, and read-only.
- Catalog mode reads only the public repository marketplace manifest and never
  changes it.
- Requires an explicit path; never scans the whole device.
- Does not execute candidate code, follow symlinks, copy data, access cloud
  folders, or upload anything.

## Command

    node scripts/seis-plugin-discovery-mcp-server.mjs --catalog --query security
    node scripts/seis-plugin-discovery-mcp-server.mjs --discover --path /path/to/selected-directory

The MCP tools are seis_plugin_discovery_status, seis_plugin_discovery_catalog,
and seis_plugin_discovery.

## Goal linkage

Use within SEIS-GOAL-021 before any separately authorized plugin migration.
