---
name: seis-public-runtime-status
description: Compare public SEIS Repo marketplace cards with bounded local cache records without installing, enabling, publishing, or changing anything.
---

# SEIS Public Runtime Status

Use this public SEIS Repo plugin to compare declared marketplace source cards
with local `seis-repo` cache records. It reports current, stale, missing,
invalid, and undeclared cache states without turning a cache record into an
installation, enablement, authorization, or release claim.

## Safety boundary

- Reads only the public `seis-repo` contract, declared public source manifests,
  and bounded cache manifests below the `seis-repo` cache root.
- Does not install, enable, update, publish, push, deploy, execute cached
  plugin code, use credentials, or access the network.
- Does not read other marketplace cache roots or emit machine-specific paths.
- A current cache record is only a local package-artifact observation; Codex
  enablement, independent installation proof, and release approval remain
  separate evidence states.

## Commands

    node scripts/seis-public-runtime-status-mcp-server.mjs --status
    node scripts/seis-public-runtime-status-mcp-server.mjs --validate
    node scripts/seis-public-runtime-status-mcp-server.mjs --runtime

The MCP tools are `seis_public_runtime_status` and
`seis_public_runtime_validate`.

## Goal linkage

Use within SEIS-GOAL-021 to keep public `seis-repo` visibility, source state,
local cache observations, independent proof, and release authority separate.
