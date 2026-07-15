---
name: seis-doc-indexer
description: Search bounded local Markdown and text documentation without creating a persistent index.
---

# SEIS Documentation Indexer

Use this skill for a small, in-memory search over local Markdown and text
documentation. It is intended for navigation and discovery.

## Safety boundary

- Read-only and local-only.
- No persistent index, upload, network call, or secret extraction.
- Hidden, dependency, build, cache, and model directories are excluded.

## Commands

    node scripts/seis-doc-indexer-mcp-server.mjs --status
    node scripts/seis-doc-indexer-mcp-server.mjs --search --path /path/to/local/tree --query "SEIS"

The MCP tools are seis_doc_indexer_status and seis_doc_search.
Keep result snippets short and avoid copying private documentation into public
artifacts.

## Goal linkage

Use this within SEIS-GOAL-021 to support local documentation discovery. It is
not a replacement for a durable knowledge or retrieval system.
