---
name: seis-technology-ontology
description: Search the local SEIS technology taxonomy in a deterministic, read-only way.
---

# SEIS Technology Ontology

Use this skill to inspect the bundled SEIS technology taxonomy and produce a
small, deterministic local classification result.

## Safety boundary

- Read-only and local-only.
- Never query a provider, browse the network, or emit credentials.
- Treat the taxonomy as a seed ontology, not proof that a technology is
  adopted, available, or production-ready.

## Commands

    node scripts/seis-technology-ontology-mcp-server.mjs --status
    node scripts/seis-technology-ontology-mcp-server.mjs --search --query "agent"

The MCP tools are seis_technology_ontology_status and
seis_technology_search.

## Goal linkage

Use this within SEIS-GOAL-021 and record the query and result as concise
evidence. Do not store private project content in the ontology.
