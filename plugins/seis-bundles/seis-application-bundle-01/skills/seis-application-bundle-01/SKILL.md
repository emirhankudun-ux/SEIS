---
name: seis-application-bundle-01
description: Select and plan with 14 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: AI and Data

AI and Data application selection bundle with 14 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 14-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Agent Audit — `seis-agent-audit` (AI)
- SEIS Agent Contract Validator — `seis-agent-contract-validator` (AI)
- Seis Context Efficiency — `seis-context-efficiency` (AI)
- SEIS Doc Indexer — `seis-doc-indexer` (Data)
- SEIS Docs Freshness — `seis-docs-freshness` (Data)
- Seis Download Anomaly — `seis-download-anomaly` (Data)
- SEIS Localization Coverage — `seis-localization-coverage` (Data)
- SEIS MCP Inventory — `seis-mcp-inventory` (AI)
- SEIS Model Fallback — `seis-model-fallback` (AI)
- Seis Package Adoption — `seis-package-adoption` (Data)
- SEIS Provider Health — `seis-provider-health` (AI)
- SEIS RAG Citation Coverage — `seis-rag-citation-coverage` (Data)
- SEIS Route Explainer — `seis-route-explainer` (AI)
- SEIS Technology Ontology — `seis-technology-ontology` (Data)

## MCP tools

- `seis_application_bundle_01_status` reports package and member-manifest readiness.
- `seis_application_bundle_01_members` returns the bounded 14-member map.
- `seis_application_bundle_01_plan` creates a local planning outline without writes.
