---
name: seis-topic-bundle-12
description: Select and plan with 10 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Data 01 of 02

Data topic selection bundle with 10 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 10-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Data — `seis-topic-data` (Data)
- SEIS Analytics — `seis-topic-data-analytics` (Data)
- SEIS Business Intelligence — `seis-topic-data-business-intelligence` (Data)
- SEIS Data Architecture — `seis-topic-data-data-architecture` (Data)
- SEIS Data Engineering — `seis-topic-data-data-engineering` (Data)
- SEIS Data Governance — `seis-topic-data-data-governance` (Data)
- SEIS Data Lineage — `seis-topic-data-data-lineage` (Data)
- SEIS Data Pipelines — `seis-topic-data-data-pipelines` (Data)
- SEIS Data Quality — `seis-topic-data-data-quality` (Data)
- SEIS Data Science — `seis-topic-data-data-science` (Data)

## MCP tools

- `seis_topic_bundle_12_status` reports package and member-manifest readiness.
- `seis_topic_bundle_12_members` returns the bounded 10-member map.
- `seis_topic_bundle_12_plan` creates a local planning outline without writes.
