---
name: seis-workflow-permission-audit
description: Review local workflow permission declarations without running workflows or changing GitHub settings.
---

# SEIS Workflow Permission Audit

Use this skill to inspect bounded workflow JSON/YAML-like files for declared
permissions and risky write scopes.

## Safety boundary

- Read-only and local-only.
- Never runs actions, accesses secrets, calls GitHub or changes rulesets.
- Text matching is structural evidence, not effective permission proof.

## Command

    node scripts/seis-workflow-permission-audit-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_workflow_permission_audit_status and
seis_workflow_permission_audit.

## Goal linkage

Use within SEIS-GOAL-021 and require security review for every declared write
scope.
