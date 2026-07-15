---
name: seis-package-adoption
description: Summarize recorded package adoption signals from local evidence without querying registries.
---

# SEIS Package Adoption

Read bounded local package-use evidence such as dependents, downloads, and
release references and report coverage by package.

## Safety boundary

- Read-only, local-only, and network-disabled.
- No registry, GitHub, package manager, or analytics API is queried.
- Missing adoption evidence remains unknown; it is not treated as zero.

## Command

    node scripts/seis-package-adoption-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_package_adoption_status and seis_package_adoption.

## Goal linkage

Use within SEIS-GOAL-021 for product and release evidence review.
