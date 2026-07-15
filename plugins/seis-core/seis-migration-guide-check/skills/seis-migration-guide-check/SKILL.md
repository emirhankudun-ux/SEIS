---
name: seis-migration-guide-check
description: Check local migration, compatibility and rollback guidance without changing release documentation.
---

# SEIS Migration Guide Check

Use this skill to inspect bounded Markdown guidance for migration,
compatibility and rollback sections.

## Safety boundary

- Read-only and local-only.
- Never executes a migration, rollback or release.
- Text presence does not prove that guidance is correct.

## Command

    node scripts/seis-migration-guide-check-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_migration_guide_check_status and
seis_migration_guide_check.

## Goal linkage

Use within SEIS-GOAL-021 and route missing sections to release review.
