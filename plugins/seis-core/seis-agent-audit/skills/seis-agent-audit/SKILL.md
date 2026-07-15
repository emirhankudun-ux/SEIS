---
name: seis-agent-audit
description: Audit local agent evidence, cancellation and handoff metadata without executing agents.
---

# SEIS Agent Audit

Use this skill to inspect local agent JSON records for permission, evidence,
cancellation, audit and handoff declarations.

## Safety boundary

- Read-only and local-only.
- Never starts agents, executes tools or grants permissions.
- Missing metadata requires supervised governance review.

## Command

    node scripts/seis-agent-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_agent_audit_status and seis_agent_audit.

## Goal linkage

Use within SEIS-GOAL-021 and preserve only concise findings and record IDs in
handoff evidence.
