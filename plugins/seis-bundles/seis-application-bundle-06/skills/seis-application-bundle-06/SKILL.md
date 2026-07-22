---
name: seis-application-bundle-06
description: Select and plan with 13 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: Developer Engineering 03 of 03

Developer Engineering application selection bundle with 13 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 13-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Release Cadence — `seis-release-cadence` (Developer)
- SEIS Release Readiness — `seis-release-readiness` (Developer)
- SEIS Repository Health — `seis-repository-health` (Developer)
- SEIS Repository Scorecard — `seis-repository-scorecard` (Developer)
- SEIS Rollback Readiness — `seis-rollback-readiness` (Developer)
- SEIS Semver Audit — `seis-semver-audit` (Developer)
- SEIS Swift Concurrency Audit — `seis-swift-concurrency-audit` (Developer)
- SEIS Swift Package Topology — `seis-swift-package-topology` (Developer)
- SEIS Test Flakiness — `seis-test-flakiness` (Developer)
- SEIS Tool Permission Audit — `seis-tool-permission-audit` (Developer)
- SEIS Trusted Marketplace — `seis-trusted-marketplace` (Developer)
- SEIS Workflow Linter — `seis-workflow-linter` (Developer)
- SEIS Workspace Inspector — `seis-workspace-inspector` (Developer)

## MCP tools

- `seis_application_bundle_06_status` reports package and member-manifest readiness.
- `seis_application_bundle_06_members` returns the bounded 13-member map.
- `seis_application_bundle_06_plan` creates a local planning outline without writes.
