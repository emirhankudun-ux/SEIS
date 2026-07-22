---
name: seis-topic-bundle-27
description: Select and plan with 14 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Software Engineering 03 of 03

Software Engineering topic selection bundle with 14 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Package Managers — `seis-topic-software-engineering-package-managers` (Software Engineering)
- SEIS Profiling — `seis-topic-software-engineering-profiling` (Software Engineering)
- SEIS Programming — `seis-topic-software-engineering-programming` (Software Engineering)
- SEIS Programming Languages — `seis-topic-software-engineering-programming-languages` (Software Engineering)
- SEIS Quality Assurance — `seis-topic-software-engineering-quality-assurance` (Software Engineering)
- SEIS Release Engineering — `seis-topic-software-engineering-release-engineering` (Software Engineering)
- SEIS Repository — `seis-topic-software-engineering-repository` (Software Engineering)
- SEIS Rollback — `seis-topic-software-engineering-rollback` (Software Engineering)
- SEIS SDK — `seis-topic-software-engineering-sdk` (Software Engineering)
- SEIS Software Architecture — `seis-topic-software-engineering-software-architecture` (Software Engineering)
- SEIS Testing — `seis-topic-software-engineering-testing` (Software Engineering)
- SEIS TUI — `seis-topic-software-engineering-tui` (Software Engineering)
- SEIS Version Control — `seis-topic-software-engineering-version-control` (Software Engineering)
- SEIS Web Development — `seis-topic-software-engineering-web-development` (Software Engineering)

## MCP tools

- `seis_topic_bundle_27_status` reports package and member-manifest readiness.
- `seis_topic_bundle_27_members` returns the bounded 14-member map.
- `seis_topic_bundle_27_plan` creates a local planning outline without writes.
