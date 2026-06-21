# ADR 0004: SEIS Next Steps Implementation Pack

Status: Accepted

## Context

SEIS needs a durable next-step operating package that turns the architecture manifesto into executable governance. The requested scope covers a one-page architecture manifesto, Dashboard/Goals/Repos/Docs/Agents mapping, quality/security/AI gates, enterprise change gates, a 30-day roadmap, and a 90-day implementation blueprint.

## Decision

SEIS will treat the next-step package as a required governance layer for meaningful changes. The package is implemented through:

- `goals/architecture.md`
- `docs/architecture/seis-5-layer-operating-map.md`
- `governance/quality-gates.md`
- `governance/enterprise-change-gates.md`
- `ai/policy.md`
- `roadmap/seis-next-steps-implementation-pack.md`
- `.github/workflows/seis-system-gates.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

## Consequences

- Every module change must map to the five-layer model.
- Every meaningful change must close quality, security, AI, documentation, and rollback evidence before completion is claimed.
- The 30-day roadmap becomes the immediate execution plan and the 90-day blueprint becomes the stabilization horizon.

## Security

Security evidence is mandatory for every change that affects repository state, deployment, access, secrets, automation, or AI execution. Security Guardian and CodeQL remain the canonical automated references when applicable.

## AI Policy

AI and agent workflows must record `intent`, `risk`, `policyVersion`, `audit`, `rollback`, `owner`, `requiresHumanApproval`, and `scope`. High-risk AI actions require human approval.

## Validation

Required validation commands:

- `npm run check:seis-enterprise-gates:quality`
- `npm run check:seis-enterprise-gates:security`
- `npm run check:seis-enterprise-gates:ai`
- `npm run check:llm-orchestration-policy`
- `npm run check:seis-god-mode-completion-audit`

## Rollback

Rollback is document-first for governance changes:

- Revert the affected governance document or ADR.
- Re-run the enterprise gates.
- Mark the related module status as `blocked` if validation evidence is missing.

## References

- [../governance/seis-architecture-manifesto.md](../governance/seis-architecture-manifesto.md)
- [../../goals/architecture.md](../../goals/architecture.md)
- [../architecture/seis-5-layer-operating-map.md](../architecture/seis-5-layer-operating-map.md)
- [../../roadmap/seis-next-steps-implementation-pack.md](../../roadmap/seis-next-steps-implementation-pack.md)
