---
name: seis-plugin-capability-coverage
description: Summarize declared coverage across four fixed public SEIS Repo registry projections without writing, networking, following symlinks, or exposing raw registry content.
---

# SEIS Plugin Capability Coverage

Use this public `seis-repo` plugin to derive a bounded capability-coverage
summary from four fixed checked-in SEIS registry projections:

- `apps/seis-core/data/seis-core-plugin-sources.json`
- `apps/seis-core/data/seis-core-plugin-catalog.json`
- `content/development/seis-core-plugin-matrix.json`
- `.agents/plugins/marketplace.json`

## Safety boundary

- Reads only those four fixed local files below the selected SEIS repository.
- Refuses arbitrary paths, missing files, non-regular files, symlinks, and
  files larger than 512 KiB.
- Returns only derived counts, normalized category labels, normalized
  capability-token frequencies, and reconciliation counts. It never returns
  raw registry JSON, raw descriptions, raw capability phrases, absolute paths,
  or machine-specific paths.
- Never writes files, uses a network, reads credentials, installs a plugin,
  calls a provider, or accesses a personal marketplace.
- An `attention` state means the bounded static registry contract could not be
  fully established. It is not proof of installation, runtime behavior,
  provider access, deployment, signing, or public release.

## Commands

    node scripts/seis-plugin-capability-coverage-mcp-server.mjs --status
    node scripts/seis-plugin-capability-coverage-mcp-server.mjs --report --path .
    node scripts/seis-plugin-capability-coverage-mcp-server.mjs --evidence

## What it reports

- Declared category counts from the public application plugin catalog.
- Normalized capability-token frequencies from declared catalog capabilities.
- Counts for source, catalog, status-matrix, and app-owned marketplace
  projections, with aggregate reconciliation gaps.
- Bounded attention summaries for malformed, mismatched, unsafe, unreadable,
  oversized, or symlinked registry evidence.

## Interpretation

This plugin reports a static coverage view of public SEIS Repo metadata. It
does not replace marketplace integrity, plugin discovery, technology ontology,
or canonical ownership validation, and it does not prove package installation,
MCP activation, runtime behavior, provider availability, deployment, signing,
or release readiness.

## Goal linkage

This public package is the active Wave 5 `SEIS-GOAL-021` capability. The first
30-step implementation tranche is repository-local and reversible; remaining
Wave 5 steps stay explicitly planned until their own evidence exists.
