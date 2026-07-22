---
name: seis-topic-bundle-25
description: Select and plan with 15 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Software Engineering 01 of 03

Software Engineering topic selection bundle with 15 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 15-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Software Engineering — `seis-topic-software-engineering` (Software Engineering)
- SEIS Algorithms — `seis-topic-software-engineering-algorithms` (Software Engineering)
- SEIS API — `seis-topic-software-engineering-api` (Software Engineering)
- SEIS Backend — `seis-topic-software-engineering-backend` (Software Engineering)
- SEIS Build Systems — `seis-topic-software-engineering-build-systems` (Software Engineering)
- SEIS Clean Architecture — `seis-topic-software-engineering-clean-architecture` (Software Engineering)
- SEIS CLI — `seis-topic-software-engineering-cli` (Software Engineering)
- SEIS Compilers — `seis-topic-software-engineering-compilers` (Software Engineering)
- SEIS Data Structures — `seis-topic-software-engineering-data-structures` (Software Engineering)
- SEIS Debugging — `seis-topic-software-engineering-debugging` (Software Engineering)
- SEIS Desktop Development — `seis-topic-software-engineering-desktop-development` (Software Engineering)
- SEIS Distributed Systems — `seis-topic-software-engineering-distributed-systems` (Software Engineering)
- SEIS Domain-Driven Design — `seis-topic-software-engineering-domain-driven-design` (Software Engineering)
- SEIS Embedded Systems — `seis-topic-software-engineering-embedded-systems` (Software Engineering)
- SEIS Frameworks — `seis-topic-software-engineering-frameworks` (Software Engineering)

## MCP tools

- `seis_topic_bundle_25_status` reports package and member-manifest readiness.
- `seis_topic_bundle_25_members` returns the bounded 15-member map.
- `seis_topic_bundle_25_plan` creates a local planning outline without writes.
