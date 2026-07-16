---
name: seis-prompt-injection-audit
description: Check that prompt safety documentation and approval boundaries remain present without executing untrusted content.
---

# SEIS Prompt Injection Audit

Read-only SEIS application plugin for SEIS-GOAL-021.

## Safety boundary

- Reads bounded repository evidence only.
- Never writes files, calls providers, deploys, publishes, or reads secrets.
- A ready report is not a human approval or release claim.

## Commands

    node scripts/seis-prompt-injection-audit-mcp-server.mjs --status
    node scripts/seis-prompt-injection-audit-mcp-server.mjs --report --path /path/to/tree

## Goal linkage

Use within SEIS-GOAL-021 and attach the report to the relevant local handoff.
