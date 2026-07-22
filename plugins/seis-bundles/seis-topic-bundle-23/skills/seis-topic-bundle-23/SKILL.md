---
name: seis-topic-bundle-23
description: Select and plan with 8 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Project Management 02 of 02

Project Management topic selection bundle with 8 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 8-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Product Management — `seis-topic-project-management-product-management` (Project Management)
- SEIS Registries — `seis-topic-project-management-registries` (Project Management)
- SEIS Repository Intelligence — `seis-topic-project-management-repository-intelligence` (Project Management)
- SEIS Repository Management — `seis-topic-project-management-repository-management` (Project Management)
- SEIS Risk — `seis-topic-project-management-risk` (Project Management)
- SEIS Roadmaps — `seis-topic-project-management-roadmaps` (Project Management)
- SEIS Taxonomy — `seis-topic-project-management-taxonomy` (Project Management)
- SEIS Validation — `seis-topic-project-management-validation` (Project Management)

## MCP tools

- `seis_topic_bundle_23_status` reports package and member-manifest readiness.
- `seis_topic_bundle_23_members` returns the bounded 8-member map.
- `seis_topic_bundle_23_plan` creates a local planning outline without writes.
