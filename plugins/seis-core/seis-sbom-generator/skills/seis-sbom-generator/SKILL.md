---
name: seis-sbom-generator
description: Generate an in-memory local SBOM projection without writing artifacts or querying registries.
---

# SEIS SBOM Generator

Use this skill to project component names, versions and local lockfile counts
from bounded manifests.

## Safety boundary

- Read-only and local-only.
- No output artifact is written.
- No registry, vulnerability database or external license source is queried.

## Command

    node scripts/seis-sbom-generator-mcp-server.mjs --generate --path /path/to/repository

The MCP tools are seis_sbom_generator_status and seis_sbom_generate.

## Goal linkage

Use within SEIS-GOAL-021 as an inventory draft; require supply-chain review
before treating it as a complete SBOM.
