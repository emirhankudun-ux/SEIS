---
name: seis-mcp-permission
description: Validate public SEIS Repo MCP entrypoints and deny-by-default permission contracts without starting servers or granting access.
---

# SEIS MCP Permission Boundary

Use this retained SEIS Repo source capability to validate the declared local
stdio MCP envelope for every app source package. It reconciles the 34 curated
marketplace cards with the public bundle catalog, proves exact-one application
bundle membership for each of the 75 source packages, and compares each
source package's manifest, profile, and `.mcp.json` declaration with the
generated permission ledger. `seis-mcp-permission` is distributed through
`seis-application-bundle-03@seis-repo`; it is not a direct marketplace card.

## Safety boundary

- Reads only fixed public `seis-repo` contracts, curated bundle membership,
  and declared source-package metadata.
- Does not accept file paths, start MCP servers, install or enable plugins,
  grant permissions, use credentials, or access the network.
- Reports only safe plugin identifiers, policy states, counts, and redacted
  finding codes; it never emits machine-specific paths or secret-like values.
- A valid report is not proof of live enablement, external connectivity,
  authorization, or release approval.

## Commands

    node scripts/seis-mcp-permission-mcp-server.mjs --status
    node scripts/seis-mcp-permission-mcp-server.mjs --validate
    node scripts/seis-mcp-permission-mcp-server.mjs --ledger
    node scripts/seis-mcp-permission-mcp-server.mjs --ledger --plugin seis-mcp-permission

The MCP tools are `seis_mcp_permission_status`,
`seis_mcp_permission_validate`, and `seis_mcp_permission_ledger`.

## Goal linkage

Use within SEIS-GOAL-021 before any MCP integration is considered for
activation. Keep the retained source-capability contract, curated bundle
distribution, permission gate, and any future human approval decision
separate.
