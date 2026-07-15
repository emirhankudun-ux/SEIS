---
name: seis-semver-audit
description: Audit local package.json versions against semantic-versioning syntax without registry access.
---

# SEIS Semver Audit

Use this skill to check bounded package manifests for missing or malformed
semantic-version values.

## Safety boundary

- Read-only and local-only.
- No package registry, tags, downloads, publishing or dependency resolution.
- A valid version string is not proof of compatibility or release readiness.

## Command

    node scripts/seis-semver-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_semver_audit_status and seis_semver_audit.

## Goal linkage

Use within SEIS-GOAL-021 as release evidence and keep external registry checks
as an explicit future task.
