# SEIS MCP Permission Risk Matrix

## Purpose

This document explains the public-safe MCP permission risk matrix for SEIS. The matrix supports the five-year agency orchestration contract by classifying MCP use into safe, review-required, approval-gated, and blocked classes.

The machine-readable source is `content/development/seis-mcp-permission-risk-matrix.json`.

## Policy

SEIS does not blindly install or enable MCPs.

Default rules:

- Official or owner-approved MCPs are eligible for activation.
- Installed MCPs are usable only after verification.
- Candidate MCPs remain documentation-only until reviewed.
- Package runners stay disabled or approval-gated.
- External mutation requires owner confirmation.
- Provider and SSH credentials must never enter public repo files.
- Failed checks must be reported honestly.

## Runtime Baseline

The current repo-owned MCP runtime is treated as local-smoke and repo-backed status only:

- Transport: stdio JSON-RPC.
- Tools: 35.
- Resources: 32.
- Prompts: 3.
- Remote MCP calls: blocked by current runtime boundary.
- Provider keys and SSH credentials: blocked by current credential boundary.

The baseline is read from `content/development/seis-ai-core-mcp-runtime-contract.json`.

## Risk Classes

Low risk:

- Local stdio runtime.
- Repo-backed resource reads.
- Status and plan tools with honest state reporting.

Medium risk:

- Repo-backed check tools.
- Prompt rendering tools.

High risk:

- Installed external MCPs until verified.
- Candidate MCP ecosystem pool.
- Package-runner MCPs.
- Credentialed provider MCPs.
- Browser automation MCPs.

Blocked by default:

- External mutation MCPs.
- SSH, cloud, and deploy MCPs.

Blocked does not mean impossible forever. It means a separate owner-approved runbook, credential boundary, evidence path, and rollback plan are required first.

## Required Evidence

Before any MCP is moved from candidate or high risk into active use, record:

- Source and official status.
- Permission model.
- Authentication and secrets boundary.
- Local/cloud classification.
- External mutation risk.
- Public repo safety.
- SEIS value and priority.
- Required verification command or manual evidence.
- Safe configuration notes.

## Verification

Run:

```bash
node scripts/check-seis-mcp-permission-risk-matrix.mjs
```

When the MCP runtime or plugin integration changes, also run:

```bash
npm run check:seis-agent-plugin-integration
node --test packages/seis-ai/test/mcp-smoke.test.mjs
```

Only claim those broader checks when actually run.

## Next Handoff

Use the matrix when adding MCP registry entries, expanding installed tool visibility, or planning a web demo agent panel. Keep candidate MCPs documentation-only until their risk record is complete.
