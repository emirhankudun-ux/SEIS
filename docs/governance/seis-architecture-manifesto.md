# SEIS 5-Layer Architecture Manifesto

SEIS uses a 5-layer operating model to keep product, engineering, AI, cloud, and governance work aligned.

## Layers

1. Product and experience layer.
2. Application and platform layer.
3. AI, data, and automation layer.
4. Cloud, infrastructure, and security layer.
5. Governance, documentation, and quality layer.

## Operating Contract

Every production-relevant change must pass the following sequence before completion:
- `docs/governance/enterprise-change-gates.md`
- `goals/architecture.md`
- `docs/architecture/seis-5-layer-operating-map.md`
- `docs/decisions` ADR chain
- `npm run check:seis-enterprise-gates:quality`
- `npm run check:seis-enterprise-gates:security`
- `npm run check:seis-enterprise-gates:ai`

## Cross-Layer Invariants

- No layer can be optimized by weakening another layer.
- Security and rollback boundaries are non-optional.
- Every AI decision includes `intent`, `risk`, and `rollback` metadata.
- Every meaningful change has at least one documented decision artifact.

## Operating Rule

Every meaningful SEIS change should improve at least one layer without weakening another layer.
It must also pass both technical gates (quality/security/AI) and enterprise gates
(`validation`, `security`, `docs`, `rollback`) before being treated as complete.

This manifesto is mapped to the operational artifacts:
- `goals/architecture.md`
- `docs/architecture/seis-5-layer-operating-map.md`
- `governance/quality-gates.md`
- `governance/enterprise-change-gates.md`

## God Mode Developer Rule

God Mode Developer work must show cross-layer lift. A God Mode change is incomplete unless it maps to product experience, application/platform behavior, AI/AGI learning, cloud/security posture, and governance/quality evidence.
