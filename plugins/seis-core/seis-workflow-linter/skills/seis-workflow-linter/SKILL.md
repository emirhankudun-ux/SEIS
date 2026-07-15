---
name: seis-workflow-linter
description: Lint bounded local JSON workflow definitions for approval, audit, retry, and failure-path metadata.
---

# SEIS Workflow Linter

Use this skill to inspect local JSON workflow definitions and report missing
governance fields before a workflow is considered for execution.

## Safety boundary

- Read-only; never executes, enables, schedules, or edits workflows.
- Never grants write permissions or contacts external services.
- A structural lint result is not an execution or security approval.

## Commands

    node scripts/seis-workflow-linter-mcp-server.mjs --status
    node scripts/seis-workflow-linter-mcp-server.mjs --lint --path /path/to/local/tree

The MCP tools are seis_workflow_linter_status and seis_workflow_lint.

## Goal linkage

Use this within SEIS-GOAL-021. Route failures to the automation and approval
gate review, with the workflow path retained as local evidence.
