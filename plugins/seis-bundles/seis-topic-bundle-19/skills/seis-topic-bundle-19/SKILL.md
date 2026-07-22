---
name: seis-topic-bundle-19
description: Select and plan with 13 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Knowledge 01 of 02

Knowledge topic selection bundle with 13 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 13-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Knowledge — `seis-topic-knowledge` (Knowledge)
- SEIS AR — `seis-topic-knowledge-ar` (Knowledge)
- SEIS Automation — `seis-topic-knowledge-automation` (Knowledge)
- SEIS Biology — `seis-topic-knowledge-biology` (Knowledge)
- SEIS Blockchain — `seis-topic-knowledge-blockchain` (Knowledge)
- SEIS Chemistry — `seis-topic-knowledge-chemistry` (Knowledge)
- SEIS Digital Twin — `seis-topic-knowledge-digital-twin` (Knowledge)
- SEIS Documentation — `seis-topic-knowledge-documentation` (Knowledge)
- SEIS Future Technologies — `seis-topic-knowledge-future-technologies` (Knowledge)
- SEIS Genetics — `seis-topic-knowledge-genetics` (Knowledge)
- SEIS Human-AI Collaboration — `seis-topic-knowledge-human-ai-collaboration` (Knowledge)
- SEIS Innovation — `seis-topic-knowledge-innovation` (Knowledge)
- SEIS IoT — `seis-topic-knowledge-iot` (Knowledge)

## MCP tools

- `seis_topic_bundle_19_status` reports package and member-manifest readiness.
- `seis_topic_bundle_19_members` returns the bounded 13-member map.
- `seis_topic_bundle_19_plan` creates a local planning outline without writes.
