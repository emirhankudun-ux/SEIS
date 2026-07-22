---
name: seis-plugin-capability-coverage
description: Summarize declared coverage across five fixed public SEIS Repo registry projections without writing, networking, following symlinks, or exposing raw registry content.
---

# SEIS Plugin Capability Coverage

Use this public `seis-repo` plugin to derive a bounded capability-coverage
summary from five fixed checked-in SEIS registry projections:

- `apps/seis-core/data/seis-core-plugin-sources.json`
- `apps/seis-core/data/seis-core-plugin-catalog.json`
- `content/development/seis-core-plugin-matrix.json`
- `.agents/plugins/marketplace.json`
- `content/development/seis-public-plugin-bundle-catalog.json`

## Safety boundary

- Reads only those five fixed local files below the selected SEIS repository.
- Refuses arbitrary paths, missing files, non-regular files, symlinks, and
  files larger than 512 KiB.
- Returns only derived counts, normalized category labels, normalized
  capability-token frequencies, and reconciliation counts. It never returns
  raw registry JSON, raw descriptions, raw capability phrases, absolute paths,
  or machine-specific paths.
- Bounds returned aggregate vocabulary: at most 128 normalized category kinds,
  256 normalized capability-token kinds, and 64 finding summaries. The report
  retains declared totals and states when an aggregate list was truncated.
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

## Registry evolution and compatibility

- The five fixed paths, registry IDs, and source/bundle arrays are the supported
  static input contract. Missing or malformed required shapes produce a
  bounded `attention` result rather than a guessed compatibility mode.
- Additional unknown fields are ignored; they are never returned. New category
  and capability wording is normalized to lower-case ASCII kebab tokens before
  aggregate counting, so public terminology remains stable across harmless
  formatting changes.
- Schema, path, permission, or output-contract changes require a new reviewed
  SEIS Repo decision. This package does not become compatible with arbitrary
  roots, personal marketplaces, external registries, or live services.
- `attention` means “review the bounded static evidence” and is not an alarm,
  a provider error, or proof of any runtime condition.

## Interpretation

This plugin reports a static coverage view of public SEIS Repo metadata. It
does not replace marketplace integrity, plugin discovery, technology ontology,
or canonical ownership validation, and it does not prove package installation,
MCP activation, runtime behavior, provider availability, deployment, signing,
or release readiness.

## Goal linkage

This public package is the active Wave 5 `SEIS-GOAL-021` capability. The first
60 repository-local steps are complete and reversible; step 61 begins the
public-contract and consolidation-maintenance tranche, while remaining steps
stay explicitly planned until their own evidence exists.
