---
name: seis-release-readiness
description: Summarize recorded local release-check evidence without running builds, deployments, or signing.
---

# SEIS Release Readiness

Use this skill to read explicitly recorded JSON check results and separate
passed, failed, skipped, and unavailable release gates.

## Safety boundary

- Read-only; never runs commands, builds, deployments, publishing, or signing.
- Never treats missing evidence as a pass.
- Never exposes credentials, artifacts, or private check payloads.

## Commands

    node scripts/seis-release-readiness-mcp-server.mjs --status
    node scripts/seis-release-readiness-mcp-server.mjs --report --path /path/to/local/tree

The MCP tools are seis_release_readiness_status and
seis_release_readiness_report.

## Goal linkage

Use this within SEIS-GOAL-021. A report with unavailable checks requires a
separate validation action before release completion can be claimed.
