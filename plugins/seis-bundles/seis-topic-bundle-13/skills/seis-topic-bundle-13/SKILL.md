---
name: seis-topic-bundle-13
description: Select and plan with 10 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Data 02 of 02

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

- SEIS Databases — `seis-topic-data-databases` (Data)
- SEIS ELT — `seis-topic-data-elt` (Data)
- SEIS ETL — `seis-topic-data-etl` (Data)
- SEIS Graph Databases — `seis-topic-data-graph-databases` (Data)
- SEIS Metadata — `seis-topic-data-metadata` (Data)
- SEIS NoSQL — `seis-topic-data-nosql` (Data)
- SEIS Search Engine — `seis-topic-data-search-engine` (Data)
- SEIS SQL — `seis-topic-data-sql` (Data)
- SEIS Storage — `seis-topic-data-storage` (Data)
- SEIS Vector Databases — `seis-topic-data-vector-databases` (Data)

## MCP tools

- `seis_topic_bundle_13_status` reports package and member-manifest readiness.
- `seis_topic_bundle_13_members` returns the bounded 10-member map.
- `seis_topic_bundle_13_plan` creates a local planning outline without writes.
