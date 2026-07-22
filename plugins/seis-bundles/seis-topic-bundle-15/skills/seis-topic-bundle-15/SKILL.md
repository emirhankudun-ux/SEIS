---
name: seis-topic-bundle-15
description: Select and plan with 10 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Design 02 of 02

Design topic selection bundle with 10 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Localization — `seis-topic-design-localization` (Design)
- SEIS Motion Design — `seis-topic-design-motion-design` (Design)
- SEIS Photography — `seis-topic-design-photography` (Design)
- SEIS Product Design — `seis-topic-design-product-design` (Design)
- SEIS Responsive Design — `seis-topic-design-responsive-design` (Design)
- SEIS Typography — `seis-topic-design-typography` (Design)
- SEIS UI Design — `seis-topic-design-ui-design` (Design)
- SEIS UX Design — `seis-topic-design-ux-design` (Design)
- SEIS Visual Design — `seis-topic-design-visual-design` (Design)
- SEIS Visual Identity — `seis-topic-design-visual-identity` (Design)

## MCP tools

- `seis_topic_bundle_15_status` reports package and member-manifest readiness.
- `seis_topic_bundle_15_members` returns the bounded 10-member map.
- `seis_topic_bundle_15_plan` creates a local planning outline without writes.
