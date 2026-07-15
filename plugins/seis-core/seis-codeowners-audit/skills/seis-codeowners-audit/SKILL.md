---
name: seis-codeowners-audit
description: Audit local CODEOWNERS rule syntax without changing GitHub ownership or branch protection.
---

# SEIS CODEOWNERS Audit

Use this skill to inspect local CODEOWNERS files for ownerless and malformed
rules.

## Safety boundary

- Read-only and local-only.
- Never query GitHub or change repository settings.
- Local owner tokens are not proof that accounts or teams exist.

## Command

    node scripts/seis-codeowners-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_codeowners_audit_status and
seis_codeowners_audit.

## Goal linkage

Use within SEIS-GOAL-021 and send findings to canonical ownership review.
