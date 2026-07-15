---
name: seis-rag-citation-coverage
description: Measure citation fields in recorded local retrieval output without running retrieval.
---

# SEIS RAG Citation Coverage

Use this skill to count citations or source references in bounded local JSON
retrieval records.

## Safety boundary

- Read-only and local-only.
- Never runs retrieval, embeddings or reranking.
- Never emits answer text or document content.

## Command

    node scripts/seis-rag-citation-coverage-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_rag_citation_coverage_status and
seis_rag_citation_coverage.

## Goal linkage

Use within SEIS-GOAL-021 as a citation-evidence signal, not as groundedness
proof.
