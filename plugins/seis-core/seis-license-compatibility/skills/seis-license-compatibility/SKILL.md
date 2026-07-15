---
name: seis-license-compatibility
description: Audit local package and repository license declarations without legal approval claims.
---

# SEIS License Compatibility

Use this skill to inspect local package license fields and license files against
the bounded local policy.

## Safety boundary

- Read-only and local-only.
- Never gives legal advice or approves publication.
- Unknown or missing declarations remain review findings.

## Command

    node scripts/seis-license-compatibility-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_license_compatibility_status and
seis_license_compatibility.

## Goal linkage

Use within SEIS-GOAL-021 and route all compatibility findings to licensing
review.
