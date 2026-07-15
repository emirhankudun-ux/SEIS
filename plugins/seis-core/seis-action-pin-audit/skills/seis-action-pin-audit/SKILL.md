---
name: seis-action-pin-audit
description: Audit local workflow Action references for immutable-looking pins without executing actions.
---

# SEIS Action Pin Audit

Use this skill to inspect workflow uses references and distinguish
SHA-looking pins from mutable tags or branches.

## Safety boundary

- Read-only and local-only.
- Never contacts GitHub or executes an Action.
- A SHA-looking string is not remotely verified.

## Command

    node scripts/seis-action-pin-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_action_pin_audit_status and seis_action_pin_audit.

## Goal linkage

Use within SEIS-GOAL-021 as supply-chain evidence before CI review.
