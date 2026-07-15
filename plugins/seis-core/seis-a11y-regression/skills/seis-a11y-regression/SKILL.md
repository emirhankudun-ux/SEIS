---
name: seis-a11y-regression
description: Audit declared local accessibility metadata without launching a UI or claiming compliance.
---

# SEIS A11y Regression

Use this skill to inspect bounded JSON declarations for keyboard, focus,
contrast, reduced-motion and accessible-label coverage.

## Safety boundary

- Read-only and local-only.
- Never launches a browser, screen reader or application.
- Declared metadata is not rendered accessibility proof.

## Command

    node scripts/seis-a11y-regression-mcp-server.mjs --audit --path /path/to/repository

The MCP tools are seis_a11y_regression_status and
seis_a11y_regression.

## Goal linkage

Use within SEIS-GOAL-021 and hand findings to accessibility and design review.
