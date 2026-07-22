---
name: seis-topic-bundle-21
description: Select and plan with 6 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: PANTECHNOEPISTEMONOESIS

PANTECHNOEPISTEMONOESIS topic selection bundle with 6 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 6-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS PANTECHNOEPISTEMONOESIS — `seis-topic-pantechnoepistemonoesis` (PANTECHNOEPISTEMONOESIS)
- SEIS Engineering Civilization — `seis-topic-pantechnoepistemonoesis-engineering-civilization` (PANTECHNOEPISTEMONOESIS)
- SEIS Knowledge Civilization — `seis-topic-pantechnoepistemonoesis-knowledge-civilization` (PANTECHNOEPISTEMONOESIS)
- SEIS Research Lab — `seis-topic-pantechnoepistemonoesis-research-lab` (PANTECHNOEPISTEMONOESIS)
- SEIS Scientific Computing — `seis-topic-pantechnoepistemonoesis-scientific-computing` (PANTECHNOEPISTEMONOESIS)
- SEIS Technology Atlas — `seis-topic-pantechnoepistemonoesis-technology-atlas` (PANTECHNOEPISTEMONOESIS)

## MCP tools

- `seis_topic_bundle_21_status` reports package and member-manifest readiness.
- `seis_topic_bundle_21_members` returns the bounded 6-member map.
- `seis_topic_bundle_21_plan` creates a local planning outline without writes.
