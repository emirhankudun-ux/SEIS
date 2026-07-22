---
name: seis-topic-bundle-14
description: Select and plan with 11 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Design 01 of 02

Design topic selection bundle with 11 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 11-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Design — `seis-topic-design` (Design)
- SEIS 3D Design — `seis-topic-design-3d-design` (Design)
- SEIS Accessibility — `seis-topic-design-accessibility` (Design)
- SEIS Branding — `seis-topic-design-branding` (Design)
- SEIS Creative Coding — `seis-topic-design-creative-coding` (Design)
- SEIS Design Systems — `seis-topic-design-design-systems` (Design)
- SEIS Design Tokens — `seis-topic-design-design-tokens` (Design)
- SEIS Editorial Design — `seis-topic-design-editorial-design` (Design)
- SEIS Graphic Design — `seis-topic-design-graphic-design` (Design)
- SEIS Illustration — `seis-topic-design-illustration` (Design)
- SEIS Interaction Design — `seis-topic-design-interaction-design` (Design)

## MCP tools

- `seis_topic_bundle_14_status` reports package and member-manifest readiness.
- `seis_topic_bundle_14_members` returns the bounded 11-member map.
- `seis_topic_bundle_14_plan` creates a local planning outline without writes.
