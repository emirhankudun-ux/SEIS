---
name: seis-personal-plugin-discovery
description: Discover selected local plugins through metadata-only inspection with symlink refusal.
---

# SEIS Personal Plugin Discovery

Inspect only an explicitly selected directory and report safe plugin metadata,
ownership classification, and missing review fields.

## Safety boundary

- Metadata-only, local-only, and read-only.
- Requires an explicit path; never scans the whole device.
- Does not execute candidate code, follow symlinks, copy data, access cloud
  folders, or upload anything.

## Command

    node scripts/seis-personal-plugin-discovery-mcp-server.mjs --discover --path /path/to/selected-directory

The MCP tools are seis_personal_plugin_discovery_status and
seis_personal_plugin_discovery.

## Goal linkage

Use within SEIS-GOAL-021 before any separately authorized plugin migration.
