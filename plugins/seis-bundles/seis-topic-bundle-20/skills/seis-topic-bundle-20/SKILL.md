---
name: seis-topic-bundle-20
description: Select and plan with 12 retained topic source capabilities without bulk installation or external writes.
---

# SEIS Topic: Knowledge 02 of 02

Knowledge topic selection bundle with 12 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS Mathematics — `seis-topic-knowledge-mathematics` (Knowledge)
- SEIS Neuroscience — `seis-topic-knowledge-neuroscience` (Knowledge)
- SEIS Physics — `seis-topic-knowledge-physics` (Knowledge)
- SEIS Quantum Computing — `seis-topic-knowledge-quantum-computing` (Knowledge)
- SEIS Research — `seis-topic-knowledge-research` (Knowledge)
- SEIS Robotics — `seis-topic-knowledge-robotics` (Knowledge)
- SEIS Science — `seis-topic-knowledge-science` (Knowledge)
- SEIS Simulation — `seis-topic-knowledge-simulation` (Knowledge)
- SEIS Spatial Computing — `seis-topic-knowledge-spatial-computing` (Knowledge)
- SEIS Sustainability — `seis-topic-knowledge-sustainability` (Knowledge)
- SEIS VR — `seis-topic-knowledge-vr` (Knowledge)
- SEIS XR — `seis-topic-knowledge-xr` (Knowledge)

## MCP tools

- `seis_topic_bundle_20_status` reports package and member-manifest readiness.
- `seis_topic_bundle_20_members` returns the bounded 12-member map.
- `seis_topic_bundle_20_plan` creates a local planning outline without writes.
