---
name: seis-public-install-evidence
description: Inspect the public SEIS Repo independent installation evidence gate without installing, enabling, publishing, or approving anything.
---

# SEIS Public Install Evidence

Use this public SEIS Repo plugin to inspect the designated sanitized evidence
record for a separate clean runner or public package installation. It reports
whether the record is missing, invalid, or valid while keeping evidence and
human release authority visibly separate.

## Safety boundary

- Reads only fixed public `seis-repo` contracts and one designated evidence
  record inside the repository.
- Does not accept arbitrary file paths, install packages, enable plugins,
  publish, push, deploy, use credentials, or access the network.
- Does not emit raw evidence, command output, secret-like values, or
  machine-specific paths.
- A valid evidence record is not a release approval, authorization, or live
  capability claim.

## Commands

    node scripts/seis-public-install-evidence-mcp-server.mjs --status
    node scripts/seis-public-install-evidence-mcp-server.mjs --validate
    node scripts/seis-public-install-evidence-mcp-server.mjs --evidence

The MCP tools are `seis_public_install_evidence_status` and
`seis_public_install_evidence_validate`.

## Goal linkage

Use within SEIS-GOAL-021 to keep public source availability, local cache
observations, independent installation evidence, and human release approval as
separate states.
