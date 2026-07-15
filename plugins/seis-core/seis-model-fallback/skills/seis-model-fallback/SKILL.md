---
name: seis-model-fallback
description: Audit local route fallback declarations without selecting or calling models.
---

# SEIS Model Fallback

Use this skill to inspect local route JSON for primary and fallback chains,
including privacy review signals.

## Safety boundary

- Read-only and local-only.
- Never ranks, selects or calls a model.
- A declared fallback is not tested runtime resilience.

## Command

    node scripts/seis-model-fallback-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_model_fallback_status and seis_model_fallback.

## Goal linkage

Use within SEIS-GOAL-021 and send private-to-cloud fallback findings to AI
integrity review.
