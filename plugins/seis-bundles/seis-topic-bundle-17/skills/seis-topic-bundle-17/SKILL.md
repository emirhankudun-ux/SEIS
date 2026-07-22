---
name: seis-topic-bundle-17
description: Select and plan with 15 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: ELENI-NEFERI

ELENI-NEFERI topic selection bundle with 15 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 15-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS ELENI-NEFERI — `seis-topic-eleni-neferi` (ELENI-NEFERI)
- SEIS Architecture — `seis-topic-eleni-neferi-architecture` (ELENI-NEFERI)
- SEIS Asset Universe — `seis-topic-eleni-neferi-asset-universe` (ELENI-NEFERI)
- SEIS Cinematic Experience — `seis-topic-eleni-neferi-cinematic-experience` (ELENI-NEFERI)
- SEIS Creative Studio — `seis-topic-eleni-neferi-creative-studio` (ELENI-NEFERI)
- SEIS Editorial — `seis-topic-eleni-neferi-editorial` (ELENI-NEFERI)
- SEIS Fashion — `seis-topic-eleni-neferi-fashion` (ELENI-NEFERI)
- SEIS Identity Bible — `seis-topic-eleni-neferi-identity-bible` (ELENI-NEFERI)
- SEIS Lifestyle — `seis-topic-eleni-neferi-lifestyle` (ELENI-NEFERI)
- SEIS Media Pipeline — `seis-topic-eleni-neferi-media-pipeline` (ELENI-NEFERI)
- SEIS Moodboard System — `seis-topic-eleni-neferi-moodboard-system` (ELENI-NEFERI)
- SEIS Prompt Registry — `seis-topic-eleni-neferi-prompt-registry` (ELENI-NEFERI)
- SEIS Story Universe — `seis-topic-eleni-neferi-story-universe` (ELENI-NEFERI)
- SEIS Travel — `seis-topic-eleni-neferi-travel` (ELENI-NEFERI)
- SEIS Visual Identity — `seis-topic-eleni-neferi-visual-identity` (ELENI-NEFERI)

## MCP tools

- `seis_topic_bundle_17_status` reports package and member-manifest readiness.
- `seis_topic_bundle_17_members` returns the bounded 15-member map.
- `seis_topic_bundle_17_plan` creates a local planning outline without writes.
