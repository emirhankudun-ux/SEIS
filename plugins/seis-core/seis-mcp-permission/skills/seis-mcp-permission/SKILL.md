---
name: seis-mcp-permission
description: Validate public SEIS Repo MCP entrypoints and deny-by-default permission contracts without starting servers or granting access.
---

# SEIS MCP Permission Boundary

Use this public SEIS Repo plugin to validate the declared local stdio MCP
envelope for every app-owned marketplace package. It compares each package's
marketplace card, manifest, profile, and `.mcp.json` declaration with the
generated permission ledger.

## Safety boundary

- Reads only fixed public `seis-repo` contracts and declared package metadata.
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
activation. Keep the public package contract, permission gate, and any future
human approval decision separate.
