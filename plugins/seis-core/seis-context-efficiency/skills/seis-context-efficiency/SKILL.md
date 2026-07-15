---
name: seis-context-efficiency
description: Measure useful-token ratios and recorded context latency from local evidence without model calls.
---

# SEIS Context Efficiency

Inspect local context-usage JSON records and report how much of the recorded
context was marked useful, along with supplied latency measurements.

## Safety boundary

- Read-only, local-only, and network-disabled.
- Never sends prompts or context to a model.
- Never treats token counts as a quality judgment without recorded labels.

## Command

    node scripts/seis-context-efficiency-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_context_efficiency_status and seis_context_efficiency.

## Goal linkage

Use within SEIS-GOAL-021 for context-engineering evidence and AI integrity review.
