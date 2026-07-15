---
name: seis-provider-health
description: Summarize recorded local provider health and credential states without making provider calls.
---

# SEIS Provider Health

Use this skill to inspect local provider, model or capability registry JSON
records and normalize recorded health states.

## Safety boundary

- Read-only and local-only.
- Never contacts providers or reads credential values.
- Recorded healthy state is not live availability proof.

## Command

    node scripts/seis-provider-health-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_provider_health_status and seis_provider_health.

## Goal linkage

Use within SEIS-GOAL-021 and distinguish recorded, missing, unavailable and
unverified states in evidence.
