---
name: seis-dependency-freshness
description: Audit local dependency declarations and lockfile coverage without registry access.
---

# SEIS Dependency Freshness

Use this skill to compare local dependency manifests with nearby lockfiles.

## Safety boundary

- Read-only and local-only.
- No package registry, vulnerability database, download or install.
- Lockfile presence is not proof of freshness or security.

## Command

    node scripts/seis-dependency-freshness-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_dependency_freshness_status and
seis_dependency_freshness.

## Goal linkage

Use within SEIS-GOAL-021 and route missing lockfile evidence to supply-chain
review.
