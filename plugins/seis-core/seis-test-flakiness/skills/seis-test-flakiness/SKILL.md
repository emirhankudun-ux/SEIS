---
name: seis-test-flakiness
description: Analyze recorded local test histories for mixed outcomes without rerunning tests.
---

# SEIS Test Flakiness

Use this skill to inspect recorded JSON test attempts and identify mixed
pass/fail histories.

## Safety boundary

- Read-only and local-only.
- Never reruns tests or claims a current build result.
- Mixed history is a triage signal, not proof of nondeterminism.

## Command

    node scripts/seis-test-flakiness-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_test_flakiness_status and seis_test_flakiness.

## Goal linkage

Use within SEIS-GOAL-021 and route mixed histories to QA review.
