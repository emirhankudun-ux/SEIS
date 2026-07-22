---
name: seis-topic-bundle-24
description: Select and plan with 13 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: SEIS

SEIS topic selection bundle with 13 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS SEIS — `seis-topic-seis` (SEIS)
- SEIS SEIS 9Router — `seis-topic-seis-seis-9router` (SEIS)
- SEIS SEIS Agent Runtime — `seis-topic-seis-seis-agent-runtime` (SEIS)
- SEIS SEIS AI Core — `seis-topic-seis-seis-ai-core` (SEIS)
- SEIS SEIS AI Desktop — `seis-topic-seis-seis-ai-desktop` (SEIS)
- SEIS SEIS Brain — `seis-topic-seis-seis-brain` (SEIS)
- SEIS SEIS Command Center — `seis-topic-seis-seis-command-center` (SEIS)
- SEIS SEIS Goal Tracking — `seis-topic-seis-seis-goal-tracking` (SEIS)
- SEIS SEIS Intelligence Cube — `seis-topic-seis-seis-intelligence-cube` (SEIS)
- SEIS SEIS Knowledge Engine — `seis-topic-seis-seis-knowledge-engine` (SEIS)
- SEIS SEIS Repository Intelligence — `seis-topic-seis-seis-repository-intelligence` (SEIS)
- SEIS SEIS Technology Ontology — `seis-topic-seis-seis-technology-ontology` (SEIS)
- SEIS SEIS Workflow Engine — `seis-topic-seis-seis-workflow-engine` (SEIS)

## MCP tools

- `seis_topic_bundle_24_status` reports package and member-manifest readiness.
- `seis_topic_bundle_24_members` returns the bounded 13-member map.
- `seis_topic_bundle_24_plan` creates a local planning outline without writes.
