---
name: seis-topic-bundle-09
description: Select and plan with 8 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Creative Production 02 of 02

Creative Production topic selection bundle with 8 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Moodboards — `seis-topic-creative-production-moodboards` (Creative Production)
- SEIS Music — `seis-topic-creative-production-music` (Creative Production)
- SEIS Publishing — `seis-topic-creative-production-publishing` (Creative Production)
- SEIS Story World — `seis-topic-creative-production-story-world` (Creative Production)
- SEIS Storytelling — `seis-topic-creative-production-storytelling` (Creative Production)
- SEIS Video — `seis-topic-creative-production-video` (Creative Production)
- SEIS Virtual Production — `seis-topic-creative-production-virtual-production` (Creative Production)
- SEIS Visual Effects — `seis-topic-creative-production-visual-effects` (Creative Production)

## MCP tools

- `seis_topic_bundle_09_status` reports package and member-manifest readiness.
- `seis_topic_bundle_09_members` returns the bounded 8-member map.
- `seis_topic_bundle_09_plan` creates a local planning outline without writes.
