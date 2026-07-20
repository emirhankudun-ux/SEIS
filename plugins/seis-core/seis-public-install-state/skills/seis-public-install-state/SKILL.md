---
name: seis-public-install-state
description: Explain public SEIS Repo source availability, local artifact evidence, independent installation proof, and release approval without installing or publishing anything.
---

# SEIS Public Install State

Use this public SEIS Repo plugin when a marketplace card needs an honest status:
source-visible, locally artifact-validated, independently installed, or release-approved.

## Safety boundary

- Reads only fixed public SEIS repository contracts.
- Does not install, enable, publish, push, deploy, use credentials, or access the network.
- Does not convert an `AVAILABLE` marketplace card into an installed, authenticated,
  independently proven, or release-approved claim.
- Keeps human approval separate from all local repository evidence.

## Commands

    node scripts/seis-public-install-state-mcp-server.mjs --status
    node scripts/seis-public-install-state-mcp-server.mjs --validate

The MCP tools are `seis_public_install_state_status` and
`seis_public_install_state_validate`.

## Goal linkage

Use within SEIS-GOAL-021 to keep the public `seis-repo` marketplace transparent:
every direct card is publicly source-visible, while independent installation and
release approval remain explicit evidence gates.
