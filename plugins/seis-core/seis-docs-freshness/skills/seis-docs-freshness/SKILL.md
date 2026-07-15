---
name: seis-docs-freshness
description: Report bounded local Markdown freshness using file metadata without changing documentation.
---

# SEIS Docs Freshness

Use this skill to identify Markdown documents older than a declared local
threshold and report their first heading.

## Safety boundary

- Read-only and local-only.
- File age is a triage signal, not semantic truth or a review record.
- No documents are edited and no private content is copied into findings.

## Command

    node scripts/seis-docs-freshness-mcp-server.mjs --audit --path /path/to/repository --days 180

The MCP tools are seis_docs_freshness_status and seis_docs_freshness.

## Goal linkage

Use within SEIS-GOAL-021 and create explicit documentation follow-up goals for
stale findings.
