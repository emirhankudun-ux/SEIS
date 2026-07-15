---
name: seis-design-token-audit
description: Audit bounded local JSON design-token files for SEIS system categories and states.
---

# SEIS Design Token Audit

Use this skill to inspect local JSON token, theme, or design-system files and
report missing high-level token categories.

## Safety boundary

- Read-only and local-only.
- Never modify tokens, design files, or generated artifacts.
- A passing category check is not a complete visual, contrast, or accessibility
  review.

## Commands

    node scripts/seis-design-token-audit-mcp-server.mjs --status
    node scripts/seis-design-token-audit-mcp-server.mjs --audit --path /path/to/local/tree

The MCP tools are seis_design_token_audit_status and
seis_design_token_audit.

## Goal linkage

Use this within SEIS-GOAL-021 and hand findings to the design-system review.
Keep source paths and missing categories, not private token values, in evidence.
