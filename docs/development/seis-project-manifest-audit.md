# SEIS Project Manifest Audit

`seis-project-manifest-audit` is a public `seis-repo` package that checks the
local `project.ecosystem.yaml` declaration against the app-owned source
inventory, public SEIS Repo marketplace, and public plugin-family contract.

## Scope

- Goal: `SEIS-GOAL-021`
- Backlog: `SEIS-BL-021`
- Source package: `plugins/seis-core/seis-project-manifest-audit`
- Evidence: `content/development/seis-project-manifest-audit.json`
- Public audience: everyone

The audit verifies project identity, canonical ownership, public distribution
metadata, the application source root, deny-by-default permission arrays, and
declared/actual marketplace count reconciliation.

## Non-goals

- It does not modify the manifest, marketplace, source inventory, or registry.
- It does not inspect a user’s personal marketplace or local credentials.
- It does not prove remote GitHub visibility, branch protection, installation,
  provider health, runtime behavior, or release approval.
- It does not replace `seis-canonical-registry-validator`,
  `seis-public-distribution-audit`, or `seis-goal-integrity`.

## Validation

```bash
npm run check:seis-project-manifest-audit
npm run check:seis-core-project-manifest-audit
```

The first validates the committed evidence record; the second exercises the
runtime and MCP surface. A ready result remains a local declaration check and
keeps public release or external write actions approval-gated.
