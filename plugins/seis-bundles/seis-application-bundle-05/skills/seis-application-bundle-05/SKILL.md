---
name: seis-application-bundle-05
description: Select and plan with 14 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: Developer Engineering 02 of 03

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

- Seis Issue Triage — `seis-issue-triage` (Developer)
- SEIS Marketplace Integrity — `seis-marketplace-integrity` (Developer)
- SEIS Migration Guide Check — `seis-migration-guide-check` (Developer)
- SEIS Offline Mode Check — `seis-offline-mode-check` (Developer)
- SEIS Performance Budget — `seis-performance-budget` (Developer)
- SEIS Plugin Capability Coverage — `seis-plugin-capability-coverage` (Developer)
- SEIS Plugin Discovery — `seis-plugin-discovery` (Developer)
- Seis Plugin Migration — `seis-plugin-migration` (Developer)
- Seis Pr Cycle Time — `seis-pr-cycle-time` (Developer)
- SEIS Prompt Injection Audit — `seis-prompt-injection-audit` (Developer)
- SEIS Public Distribution Audit — `seis-public-distribution-audit` (Developer)
- SEIS Public Install Evidence — `seis-public-install-evidence` (Developer)
- SEIS Public Install State — `seis-public-install-state` (Developer)
- SEIS Public Runtime Status — `seis-public-runtime-status` (Developer)

## MCP tools

- `seis_application_bundle_05_status` reports package and member-manifest readiness.
- `seis_application_bundle_05_members` returns the bounded 14-member map.
- `seis_application_bundle_05_plan` creates a local planning outline without writes.
