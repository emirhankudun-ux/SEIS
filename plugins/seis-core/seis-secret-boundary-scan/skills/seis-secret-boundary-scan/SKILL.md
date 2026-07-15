---
name: seis-secret-boundary-scan
description: Scan bounded local text files for redacted secret-boundary findings without emitting values.
---

# SEIS Secret Boundary Scan

Use this skill to identify likely credential patterns and private-risk file
names in a bounded local tree. It reports codes and paths only.

## Safety boundary

- Read-only and local-only.
- Never print matched values, full secret lines, or private file contents.
- Findings are heuristic and require a human/security review.
- Do not use this as proof that a repository is safe.

## Commands

    node scripts/seis-secret-boundary-scan-mcp-server.mjs --status
    node scripts/seis-secret-boundary-scan-mcp-server.mjs --scan --path /path/to/local/tree

The MCP tools are seis_secret_boundary_scan_status and
seis_secret_boundary_scan.

## Goal linkage

Use this within SEIS-GOAL-021. Preserve only redacted findings and remediation
status in public-safe evidence.
