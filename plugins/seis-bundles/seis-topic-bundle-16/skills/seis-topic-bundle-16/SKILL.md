---
name: seis-topic-bundle-16
description: Select and plan with 11 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Desktop

Desktop topic selection bundle with 11 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Desktop — `seis-topic-desktop` (Desktop)
- SEIS Android — `seis-topic-desktop-android` (Desktop)
- SEIS Cross Platform — `seis-topic-desktop-cross-platform` (Desktop)
- SEIS iOS — `seis-topic-desktop-ios` (Desktop)
- SEIS iPadOS — `seis-topic-desktop-ipados` (Desktop)
- SEIS Linux — `seis-topic-desktop-linux` (Desktop)
- SEIS macOS — `seis-topic-desktop-macos` (Desktop)
- SEIS visionOS — `seis-topic-desktop-visionos` (Desktop)
- SEIS watchOS — `seis-topic-desktop-watchos` (Desktop)
- SEIS Web — `seis-topic-desktop-web` (Desktop)
- SEIS Windows — `seis-topic-desktop-windows` (Desktop)

## MCP tools

- `seis_topic_bundle_16_status` reports package and member-manifest readiness.
- `seis_topic_bundle_16_members` returns the bounded 11-member map.
- `seis_topic_bundle_16_plan` creates a local planning outline without writes.
