---
name: seis-topic-bundle-08
description: Select and plan with 9 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Creative Production 01 of 02

Creative Production topic selection bundle with 9 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 9-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Creative Production — `seis-topic-creative-production` (Creative Production)
- SEIS Animation — `seis-topic-creative-production-animation` (Creative Production)
- SEIS Asset Management — `seis-topic-creative-production-asset-management` (Creative Production)
- SEIS Audio — `seis-topic-creative-production-audio` (Creative Production)
- SEIS CGI — `seis-topic-creative-production-cgi` (Creative Production)
- SEIS Content Creation — `seis-topic-creative-production-content-creation` (Creative Production)
- SEIS Creative Engineering — `seis-topic-creative-production-creative-engineering` (Creative Production)
- SEIS Digital Art — `seis-topic-creative-production-digital-art` (Creative Production)
- SEIS Media Production — `seis-topic-creative-production-media-production` (Creative Production)

## MCP tools

- `seis_topic_bundle_08_status` reports package and member-manifest readiness.
- `seis_topic_bundle_08_members` returns the bounded 9-member map.
- `seis_topic_bundle_08_plan` creates a local planning outline without writes.
