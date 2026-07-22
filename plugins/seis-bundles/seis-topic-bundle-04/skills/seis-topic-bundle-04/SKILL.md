---
name: seis-topic-bundle-04
description: Select and plan with 9 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Automation 01 of 02

Automation topic selection bundle with 9 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Automation — `seis-topic-automation` (Automation)
- SEIS Command Center — `seis-topic-automation-command-center` (Automation)
- SEIS Connectors — `seis-topic-automation-connectors` (Automation)
- SEIS Integrations — `seis-topic-automation-integrations` (Automation)
- SEIS MCP — `seis-topic-automation-mcp` (Automation)
- SEIS Orchestration — `seis-topic-automation-orchestration` (Automation)
- SEIS Pipelines — `seis-topic-automation-pipelines` (Automation)
- SEIS Plugin Registry — `seis-topic-automation-plugin-registry` (Automation)
- SEIS Plugins — `seis-topic-automation-plugins` (Automation)

## MCP tools

- `seis_topic_bundle_04_status` reports package and member-manifest readiness.
- `seis_topic_bundle_04_members` returns the bounded 9-member map.
- `seis_topic_bundle_04_plan` creates a local planning outline without writes.
