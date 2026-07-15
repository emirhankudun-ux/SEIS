---
name: seis-branch-protection-audit
description: Audit recorded local branch and ruleset policy declarations without contacting GitHub.
---

# SEIS Branch Protection Audit

Inspect local policy snapshots and configuration text for branch protection
signals such as required reviews, status checks, administrator enforcement,
and force-push restrictions.

## Safety boundary

- Read-only and local-only.
- Does not query GitHub rulesets or change branch settings.
- Text presence is a review signal, not proof of an active remote policy.

## Command

    node scripts/seis-branch-protection-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_branch_protection_audit_status and
seis_branch_protection_audit.

## Goal linkage

Use within SEIS-GOAL-021 for repository security review.
