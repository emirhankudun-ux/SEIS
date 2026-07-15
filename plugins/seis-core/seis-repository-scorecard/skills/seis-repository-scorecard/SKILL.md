---
name: seis-repository-scorecard
description: Score bounded local repository evidence without popularity or external GitHub signals.
---

# SEIS Repository Scorecard

Use this skill for a deterministic local scorecard covering identity, security,
governance, testing, automation and release evidence.

## Safety boundary

- Read-only and local-only.
- Never query GitHub, popularity metrics, credentials or external services.
- A score is not a security, architecture or release approval.

## Command

    node scripts/seis-repository-scorecard-mcp-server.mjs --score --path /path/to/repository

The MCP tools are seis_repository_scorecard_status and
seis_repository_scorecard.

## Goal linkage

Use within SEIS-GOAL-021. Record missing evidence separately from the numeric
score; do not optimize the score by adding decorative files.
