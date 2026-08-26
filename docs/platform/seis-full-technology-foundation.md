# SEIS Full Technology Foundation

Goal: `SEIS-GOAL-021` — Build SEIS AI Desktop Platform Fusion.

Status: prototype foundation.

This document defines the first additive implementation slice for the SEIS Full Technology Edition. It does not claim that every listed capability is implemented, connected, production-ready, or cross-platform validated.

## Product rule

SEIS is a technology operating environment, not a collection of disconnected applications. Thousands of capabilities must be discoverable through canonical registries and composed into focused workbenches.

## Foundation layers

1. `SEIS Kernel` — execution, storage, events, permissions and platform contracts.
2. `SEIS Fabric` — compute, data, asset and knowledge resource movement.
3. `SEIS Universal Runtime` — shared runtime boundaries and platform adapters.
4. `SEIS Nexus` — typed relationships across objects and registries.
5. `SEIS Brain` — local-first knowledge and memory surfaces.
6. `SEIS Atlas` — technology and capability discovery.
7. `SEIS Forge` — governed creation pipelines.
8. `SEIS Reality` — game, 3D, digital-life and simulation foundations.
9. `SEIS Cube` — architecture, runtime, security, evidence and history visualization.
10. `SEIS Proof` — validation and evidence before completion claims.

## Canonical technology domains

The machine-readable source is `content/development/seis-full-technology-registry.json`. It currently defines 16 top-level domains spanning AI, software, creation, Reality, Game, Digital Life, cinema/audio, data/knowledge, science, engineering, robotics, hardware, cloud, security, platform targets and governance/research.

These are taxonomy domains, not implementation-complete product claims.

## Workbench Composer

`content/development/seis-workbench-composer.json` defines the first deterministic local-demo composition contract.

Examples:

- shader debugging → code, shader graph, material preview and GPU profiling;
- Digital Human → viewport, anatomy, groom, rig, animation and performance;
- game optimization → world, frame graph, CPU/GPU, asset residency, physics and AI;
- robotics → scene, sensors, ROS graph, code, telemetry and simulation;
- poster design → canvas, typography, color, assets and export inspection.

The composer never executes a tool merely because it is displayed. External actions remain human-approval gated.

## Implementation classes

Every future capability should be classified as one of:

- Native Core
- Native Tool
- Adapter
- Plugin
- Research

Maturity must remain separate from implementation class. A registry entry marked `research` or `prototype` must not be presented as `stable`.

## Security boundary

Default network: deny.

Default write: deny.

No credentials belong in capability registries.

External mutation requires explicit approval.

Demo and unavailable states must remain visible and must not be rewritten into live-connectivity claims.

## Current validation

The deterministic validator is:

```bash
node scripts/check-seis-full-technology-registry.mjs
```

It validates Goal binding, the 16-domain contract, uniqueness, capability shape, shared frameworks, Workbench Composer presence and deny-by-default safety boundaries.

## Next implementation slice

1. Wire the registry checker into `package.json` after conflict review with open branches.
2. Add a generated, read-only Command Center projection from the registry.
3. Add schema validation for technology, capability and tool records.
4. Add Cube node/edge contracts derived from canonical registry records.
5. Expand Digital Human, Game and Reality capabilities as typed records rather than hard-coded UI cards.
6. Run repository-wide quality/security tests before any merge proposal.

No production deployment, provider activation, MCP activation, SSH execution, package publication, signing or external mutation is authorized by this foundation.
