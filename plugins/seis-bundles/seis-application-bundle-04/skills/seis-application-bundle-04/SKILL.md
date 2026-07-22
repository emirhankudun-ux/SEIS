---
name: seis-application-bundle-04
description: Select and plan with 14 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: Developer Engineering 01 of 03

Developer Engineering application selection bundle with 14 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 14-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Apple Native Readiness — `seis-apple-native-readiness` (Developer)
- SEIS Approval Gate Review — `seis-approval-gate-review` (Developer)
- SEIS Architecture Drift — `seis-architecture-drift` (Developer)
- SEIS Canonical Registry Validator — `seis-canonical-registry-validator` (Developer)
- SEIS Changelog Validator — `seis-changelog-validator` (Developer)
- SEIS CODEOWNERS Audit — `seis-codeowners-audit` (Developer)
- SEIS Community Health — `seis-community-health` (Developer)
- SEIS Contract Compatibility — `seis-contract-compatibility` (Developer)
- Seis Contributor Map — `seis-contributor-map` (Developer)
- SEIS Cost and Latency Budget — `seis-cost-latency-budget` (Developer)
- SEIS Data Retention Audit — `seis-data-retention-audit` (Developer)
- SEIS Evidence Index — `seis-evidence-index` (Developer)
- Seis Github Metrics Collector — `seis-github-metrics-collector` (Developer)
- SEIS Goal Dependency Map — `seis-goal-dependency-map` (Developer)

## MCP tools

- `seis_application_bundle_04_status` reports package and member-manifest readiness.
- `seis_application_bundle_04_members` returns the bounded 14-member map.
- `seis_application_bundle_04_plan` creates a local planning outline without writes.
