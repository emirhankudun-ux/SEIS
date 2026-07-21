---
name: seis-project-manifest-audit
description: Audit bounded SEIS project manifest ownership, source inventory, public marketplace, and deny-by-default permission declarations without changing files.
---

# SEIS Project Manifest Audit

Use this public `seis-repo` plugin to inspect the checked-in
`project.ecosystem.yaml` contract and its declared public plugin boundary.

## Safety boundary

- Reads only `project.ecosystem.yaml`, the app source inventory, the checked-in
  `seis-repo` marketplace projection, and the public plugin-family record.
- Never writes files, installs plugins, starts MCP servers, calls providers,
  uses the network, reads secrets, or changes GitHub state.
- A ready result proves local declaration alignment only. It is not proof of
  remote GitHub state, branch protection, marketplace installation, provider
  health, or release approval.

## Commands

```bash
node scripts/seis-project-manifest-audit-mcp-server.mjs --status
node scripts/seis-project-manifest-audit-mcp-server.mjs --audit --path .
node scripts/seis-project-manifest-audit-mcp-server.mjs --evidence
```

## Goal linkage

Use within `SEIS-GOAL-021` and `SEIS-BL-021`. This complements
`seis-canonical-registry-validator`, `seis-public-distribution-audit`, and
`seis-goal-integrity`; it does not replace their focused registry,
distribution, or lifecycle validation.

## Interpreting results

- `ready`: required local manifest declarations and count projections align.
- `attention`: a declared manifest value, public ownership boundary, or count
  projection is missing or inconsistent; inspect the concise finding code.

Do not change canonical ownership, visibility, permissions, release state, or
marketplace policy from this result alone. Those changes need a scoped decision,
security review, and explicit approval where applicable.
