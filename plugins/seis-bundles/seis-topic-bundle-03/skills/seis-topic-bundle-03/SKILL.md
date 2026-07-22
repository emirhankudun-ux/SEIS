---
name: seis-topic-bundle-03
description: Select and plan with 11 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Artificial Intelligence 03 of 03

Artificial Intelligence topic selection bundle with 11 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Prompt Engineering — `seis-topic-artificial-intelligence-prompt-engineering` (Artificial Intelligence)
- SEIS Provider Routing — `seis-topic-artificial-intelligence-provider-routing` (Artificial Intelligence)
- SEIS RAG — `seis-topic-artificial-intelligence-rag` (Artificial Intelligence)
- SEIS Reasoning Models — `seis-topic-artificial-intelligence-reasoning-models` (Artificial Intelligence)
- SEIS Responsible AI — `seis-topic-artificial-intelligence-responsible-ai` (Artificial Intelligence)
- SEIS Retrieval — `seis-topic-artificial-intelligence-retrieval` (Artificial Intelligence)
- SEIS Semantic Search — `seis-topic-artificial-intelligence-semantic-search` (Artificial Intelligence)
- SEIS Small Language Models — `seis-topic-artificial-intelligence-small-language-models` (Artificial Intelligence)
- SEIS Speech AI — `seis-topic-artificial-intelligence-speech-ai` (Artificial Intelligence)
- SEIS Vector Search — `seis-topic-artificial-intelligence-vector-search` (Artificial Intelligence)
- SEIS World Models — `seis-topic-artificial-intelligence-world-models` (Artificial Intelligence)

## MCP tools

- `seis_topic_bundle_03_status` reports package and member-manifest readiness.
- `seis_topic_bundle_03_members` returns the bounded 11-member map.
- `seis_topic_bundle_03_plan` creates a local planning outline without writes.
