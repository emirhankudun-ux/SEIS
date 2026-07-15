---
name: seis-issue-triage
description: Classify recorded local issues for human triage without modifying issue trackers.
---

# SEIS Issue Triage

Inspect bounded issue JSON records, normalize severity from explicit fields and
labels, and identify open high-priority items for human review.

## Safety boundary

- Read-only, local-only, and no network access.
- Does not close, label, assign, comment on, or otherwise mutate issues.
- Classification is a triage suggestion, not an authoritative product decision.

## Command

    node scripts/seis-issue-triage-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_issue_triage_status and seis_issue_triage.

## Goal linkage

Use within SEIS-GOAL-021 and route findings to the responsible owner.
