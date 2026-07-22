---
name: seis-application-bundle-03
description: Select and plan with 11 retained application source capabilities without bulk installation or external writes.
---

# SEIS Application: Security

Security application selection bundle with 11 retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.

## Workflow

1. Read the repository instructions, project manifest, active goal, and public bundle profile.
2. Use the bundle MCP status and members tools to identify the bounded 11-member source set.
3. Keep SEIS-Agent as the canonical default installation; choose this bundle only when its scope fits.
4. Inspect the retained source package before relying on a member-specific runtime or command.
5. Produce a bounded plan with validation, risks, rollback, and explicit approval gates for external actions.

## Safety boundary

- Read-only bundle metadata and bounded repository member-manifest checks only.
- No bulk installation, automatic source merge, deletion, provider connection, network access, secrets, deployment, or write action.
- Member source packages remain in the public repository and are not silently removed by this bundle.

## Included source capabilities

- SEIS Action Pin Audit — `seis-action-pin-audit` (Security)
- Seis Artifact Attestation — `seis-artifact-attestation` (Security)
- Seis Branch Protection Audit — `seis-branch-protection-audit` (Security)
- SEIS Dependency Freshness — `seis-dependency-freshness` (Security)
- SEIS License Compatibility — `seis-license-compatibility` (Security)
- SEIS MCP Permission Boundary — `seis-mcp-permission` (Security)
- SEIS Public-Safe Scan — `seis-public-safe-scan` (Security)
- SEIS SBOM Generator — `seis-sbom-generator` (Security)
- SEIS Secret Boundary Scan — `seis-secret-boundary-scan` (Security)
- SEIS Vulnerability Triage — `seis-vulnerability-triage` (Security)
- SEIS Workflow Permission Audit — `seis-workflow-permission-audit` (Security)

## MCP tools

- `seis_application_bundle_03_status` reports package and member-manifest readiness.
- `seis_application_bundle_03_members` returns the bounded 11-member map.
- `seis_application_bundle_03_plan` creates a local planning outline without writes.
