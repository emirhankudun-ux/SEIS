---
name: seis-localization-coverage
description: Compare bounded local locale dictionary keys without changing translations.
---

# SEIS Localization Coverage

Use this skill to compare keys across local JSON locale dictionaries.

## Safety boundary

- Read-only and local-only.
- Never translates, edits or publishes locale content.
- Key coverage does not judge translation quality, tone or cultural fit.

## Command

    node scripts/seis-localization-coverage-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_localization_coverage_status and
seis_localization_coverage.

## Goal linkage

Use within SEIS-GOAL-021 and route missing Turkish, English, Greek or fallback
keys to localization review.
