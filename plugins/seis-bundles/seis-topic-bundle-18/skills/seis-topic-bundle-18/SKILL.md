---
name: seis-topic-bundle-18
description: Select and plan with 13 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Graphics

Graphics topic selection bundle with 13 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Graphics — `seis-topic-graphics` (Graphics)
- SEIS Color Theory — `seis-topic-graphics-color-theory` (Graphics)
- SEIS Composition — `seis-topic-graphics-composition` (Graphics)
- SEIS Game Engine — `seis-topic-graphics-game-engine` (Graphics)
- SEIS Graphics Engine — `seis-topic-graphics-graphics-engine` (Graphics)
- SEIS Iconography — `seis-topic-graphics-iconography` (Graphics)
- SEIS Layout — `seis-topic-graphics-layout` (Graphics)
- SEIS Lighting — `seis-topic-graphics-lighting` (Graphics)
- SEIS Materials — `seis-topic-graphics-materials` (Graphics)
- SEIS Path Tracing — `seis-topic-graphics-path-tracing` (Graphics)
- SEIS Ray Tracing — `seis-topic-graphics-ray-tracing` (Graphics)
- SEIS Rendering — `seis-topic-graphics-rendering` (Graphics)
- SEIS Shaders — `seis-topic-graphics-shaders` (Graphics)

## MCP tools

- `seis_topic_bundle_18_status` reports package and member-manifest readiness.
- `seis_topic_bundle_18_members` returns the bounded 13-member map.
- `seis_topic_bundle_18_plan` creates a local planning outline without writes.
