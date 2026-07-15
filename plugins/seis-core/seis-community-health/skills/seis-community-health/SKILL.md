---
name: seis-community-health
description: Audit local contribution, support and conduct templates without contacting GitHub.
---

# SEIS Community Health

Use this skill to check local documentation and templates for contribution,
issue, pull-request, support and conduct surfaces.

## Safety boundary

- Read-only and local-only.
- Never queries community activity or maintainer behavior.
- Presence of a template is not proof that it is usable or current.

## Command

    node scripts/seis-community-health-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_community_health_status and
seis_community_health.

## Goal linkage

Use within SEIS-GOAL-021 as a public-readiness documentation signal.
