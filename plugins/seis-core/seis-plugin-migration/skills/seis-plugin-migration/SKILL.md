---
name: seis-plugin-migration
description: Create a metadata-only dry-run migration plan for selected local plugins without copying or executing them.
---

# SEIS Plugin Migration

Inspect plugin manifests and profiles under an explicitly selected local root
and report whether each candidate is ready for a separately reviewed import.

## Safety boundary

- Metadata-only, local-only, and read-only.
- Never copies files, executes candidate code, imports Git history, or edits a registry.
- Unknown ownership, rights, permissions, or missing rollback remains blocked.

## Command

    node scripts/seis-plugin-migration-mcp-server.mjs --plan --path /path/to/plugin-root

The MCP tools are seis_plugin_migration_status and seis_plugin_migration.

## Goal linkage

Use within SEIS-GOAL-021 and require explicit authorization before any future
migration write.
