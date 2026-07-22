---
name: seis-topic-bundle-26
description: Select and plan with 15 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Software Engineering 02 of 03

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

- SEIS Frontend — `seis-topic-software-engineering-frontend` (Software Engineering)
- SEIS Full Stack — `seis-topic-software-engineering-full-stack` (Software Engineering)
- SEIS Game Development — `seis-topic-software-engineering-game-development` (Software Engineering)
- SEIS Git — `seis-topic-software-engineering-git` (Software Engineering)
- SEIS GitHub — `seis-topic-software-engineering-github` (Software Engineering)
- SEIS GUI — `seis-topic-software-engineering-gui` (Software Engineering)
- SEIS Hexagonal Architecture — `seis-topic-software-engineering-hexagonal-architecture` (Software Engineering)
- SEIS Interpreters — `seis-topic-software-engineering-interpreters` (Software Engineering)
- SEIS Libraries — `seis-topic-software-engineering-libraries` (Software Engineering)
- SEIS Microservices — `seis-topic-software-engineering-microservices` (Software Engineering)
- SEIS Migration — `seis-topic-software-engineering-migration` (Software Engineering)
- SEIS Mobile Development — `seis-topic-software-engineering-mobile-development` (Software Engineering)
- SEIS Modular Monolith — `seis-topic-software-engineering-modular-monolith` (Software Engineering)
- SEIS Operating Systems — `seis-topic-software-engineering-operating-systems` (Software Engineering)
- SEIS Optimization — `seis-topic-software-engineering-optimization` (Software Engineering)

## MCP tools

- `seis_topic_bundle_26_status` reports package and member-manifest readiness.
- `seis_topic_bundle_26_members` returns the bounded 15-member map.
- `seis_topic_bundle_26_plan` creates a local planning outline without writes.
