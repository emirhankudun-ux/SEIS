---
name: seis-topic-bundle-01
description: Select and plan with 12 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Artificial Intelligence 01 of 03

Artificial Intelligence topic selection bundle with 12 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 12-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Artificial Intelligence — `seis-topic-artificial-intelligence` (Artificial Intelligence)
- SEIS Agent Runtime — `seis-topic-artificial-intelligence-agent-runtime` (Artificial Intelligence)
- SEIS Agent Swarms — `seis-topic-artificial-intelligence-agent-swarms` (Artificial Intelligence)
- SEIS AI Agents — `seis-topic-artificial-intelligence-ai-agents` (Artificial Intelligence)
- SEIS AI Alignment — `seis-topic-artificial-intelligence-ai-alignment` (Artificial Intelligence)
- SEIS AI Core — `seis-topic-artificial-intelligence-ai-core` (Artificial Intelligence)
- SEIS AI Evaluation — `seis-topic-artificial-intelligence-ai-evaluation` (Artificial Intelligence)
- SEIS AI Safety — `seis-topic-artificial-intelligence-ai-safety` (Artificial Intelligence)
- SEIS Audio AI — `seis-topic-artificial-intelligence-audio-ai` (Artificial Intelligence)
- SEIS Computer Vision — `seis-topic-artificial-intelligence-computer-vision` (Artificial Intelligence)
- SEIS Context Engineering — `seis-topic-artificial-intelligence-context-engineering` (Artificial Intelligence)
- SEIS Deep Learning — `seis-topic-artificial-intelligence-deep-learning` (Artificial Intelligence)

## MCP tools

- `seis_topic_bundle_01_status` reports package and member-manifest readiness.
- `seis_topic_bundle_01_members` returns the bounded 12-member map.
- `seis_topic_bundle_01_plan` creates a local planning outline without writes.
