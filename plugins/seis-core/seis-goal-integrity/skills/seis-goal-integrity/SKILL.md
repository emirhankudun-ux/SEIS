---
name: seis-goal-integrity
description: Validate bounded SEIS goal records, stable IDs, lifecycle states, and the SEIS-GOAL-021 binding without changing files.
---

# SEIS Goal Integrity

Use this skill before starting meaningful SEIS implementation work or changing a goal status.

## Procedure

1. Read the repository `AGENTS.md`, manifest, and canonical goal sources first.
2. Run `node scripts/seis-goal-integrity-mcp-server.mjs --status`.
3. Run `node scripts/seis-goal-integrity-mcp-server.mjs --validate --path <workspace> --primary-goal SEIS-GOAL-021`.
4. Resolve duplicate IDs and status contradictions before implementation.
5. Use repository-native schema validation for final acceptance; this plugin uses a bounded YAML key heuristic.

## Scope and guardrails

- Inspect goal records under `goals/` and `docs/goals/` within an explicit workspace.
- Read-only and local-only: no goal file is rewritten or auto-completed.
- A `completed` status without evidence or validation is a warning, not proof of completion.
- A missing primary goal is reported honestly; do not create a duplicate `SEIS-GOAL-021` automatically.
- No network, secrets, GitHub writes, branch changes, or background execution.

## MCP

- `seis_goal_integrity_status`
- `seis_goal_integrity_validate`

## Handoff

Report files and records scanned, duplicate IDs, invalid statuses, primary-goal presence, exact command, limitations, and unblock requirements.
