---
name: seis-public-safe-scan
description: Scan bounded local files for redacted public-private boundary findings.
---

# SEIS Public-Safe Scan

Use this skill before a public-readiness review to report private paths,
personal-data patterns, credential shapes and private-risk filenames.

## Safety boundary

- Read-only and local-only.
- Never emit matched values, full lines, credentials or private document text.
- Heuristic findings require human/security review and do not certify safety.

## Command

    node scripts/seis-public-safe-scan-mcp-server.mjs --scan --path /path/to/repository

The MCP tools are seis_public_safe_scan_status and
seis_public_safe_scan.

## Goal linkage

Use within SEIS-GOAL-021. Preserve only redacted codes and relative paths in
public-safe evidence.
