---
name: seis-topic-bundle-02
description: Select and plan with 12 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Artificial Intelligence 02 of 03

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

- SEIS Embeddings — `seis-topic-artificial-intelligence-embeddings` (Artificial Intelligence)
- SEIS Generative AI — `seis-topic-artificial-intelligence-generative-ai` (Artificial Intelligence)
- SEIS GraphRAG — `seis-topic-artificial-intelligence-graphrag` (Artificial Intelligence)
- SEIS Knowledge Graph — `seis-topic-artificial-intelligence-knowledge-graph` (Artificial Intelligence)
- SEIS Knowledge Systems — `seis-topic-artificial-intelligence-knowledge-systems` (Artificial Intelligence)
- SEIS Large Language Models — `seis-topic-artificial-intelligence-large-language-models` (Artificial Intelligence)
- SEIS Machine Learning — `seis-topic-artificial-intelligence-machine-learning` (Artificial Intelligence)
- SEIS Memory Systems — `seis-topic-artificial-intelligence-memory-systems` (Artificial Intelligence)
- SEIS Model Routing — `seis-topic-artificial-intelligence-model-routing` (Artificial Intelligence)
- SEIS Multimodal AI — `seis-topic-artificial-intelligence-multimodal-ai` (Artificial Intelligence)
- SEIS Natural Language Processing — `seis-topic-artificial-intelligence-natural-language-processing` (Artificial Intelligence)
- SEIS Neural Networks — `seis-topic-artificial-intelligence-neural-networks` (Artificial Intelligence)

## MCP tools

- `seis_topic_bundle_02_status` reports package and member-manifest readiness.
- `seis_topic_bundle_02_members` returns the bounded 12-member map.
- `seis_topic_bundle_02_plan` creates a local planning outline without writes.
