---
name: seis-application-bundle-02
description: Select and plan with 9 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: Product Design and Operations

Product Design and Operations application selection bundle with 9 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

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

- SEIS A11y Regression — `seis-a11y-regression` (Design)
- SEIS Design Token Audit — `seis-design-token-audit` (Design)
- Seis Dora Metrics — `seis-dora-metrics` (Observability)
- SEIS Focus Navigation Audit — `seis-focus-navigation-audit` (Design)
- SEIS Goal Integrity — `seis-goal-integrity` (Productivity)
- Seis Maintainer Risk — `seis-maintainer-risk` (Governance)
- SEIS Project Manifest Audit — `seis-project-manifest-audit` (Productivity)
- SEIS Source Provenance — `seis-source-provenance` (Productivity)
- SEIS UI State Contract Audit — `seis-ui-state-contract-audit` (Design)

## MCP tools

- `seis_application_bundle_02_status` reports package and member-manifest readiness.
- `seis_application_bundle_02_members` returns the bounded 9-member map.
- `seis_application_bundle_02_plan` creates a local planning outline without writes.
