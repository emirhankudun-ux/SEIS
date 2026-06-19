# SEIS Goal Evidence Ledger

Date: 2026-06-19

This ledger defines how Goal Tracking OS stores progress evidence without
depending on an LLM. The structured evidence file is
[`../../content/development/seis-goal-evidence.json`](../../content/development/seis-goal-evidence.json).

Evidence records are not completion claims by themselves. They support goal
status, blocker status, validation status, or next safe actions. A goal can be
completed or validated only when the evidence proves the full requirement.

## Evidence Rules

- Store evidence as small structured records.
- Use repo-relative paths only.
- Summarize command output instead of storing private machine paths.
- Mark failed or blocked checks honestly.
- Keep limitations visible.
- Do not store secrets, tokens, private hosts, private keys, or `.env` values.
- Do not use expired evidence to support current progress.
- Do not use LLM summaries as sole proof.

## Evidence Statuses

| Status | Meaning |
| --- | --- |
| `passed` | A command or review passed for the stated scope. |
| `failed` | A command or review failed for the stated scope. |
| `blocked` | Evidence proves a blocker, not a completed state. |
| `observed` | Current state was observed without pass/fail semantics. |
| `partial` | Evidence supports only part of a broader requirement. |

## Evidence Types

| Type | Purpose |
| --- | --- |
| `validation` | Local command or review output. |
| `repository-state` | Branch, worktree, or file-state observation. |
| `blocker` | Human or technical blocker evidence. |
| `security-scan` | Sensitive-pattern or security-adjacent check. |
| `commit` | Commit or branch state evidence. |
| `review` | Human-readable review record. |

## Current Evidence Snapshot

| Evidence ID | Status | Supports | Summary |
| --- | --- | --- | --- |
| `SEIS-EVID-001` | passed | Goal Tracking OS | Goal registry validator passed for 20 goals and 20 categories. |
| `SEIS-EVID-002` | passed | Command Center / app baseline | Existing web audit still passes. |
| `SEIS-EVID-003` | blocked | Foundation validation | Foundation check is blocked by missing governance docs and validator script. |
| `SEIS-EVID-004` | blocked | Repository hygiene | Tracked deletion set remains unresolved and unstaged. |
| `SEIS-EVID-005` | observed | GitHub workflow | Foundation commits are local only; no push was performed. |
| `SEIS-EVID-006` | passed | Security/public readiness | Scoped sensitive-pattern scan passed for Goal Tracking OS files. |
| `SEIS-EVID-007` | partial | Repository hygiene | Tracked deletion set classified for recovery without approving deletion. |
| `SEIS-EVID-008` | passed | Goal execution | Execution registry validates tasks, subtasks, blockers, decisions, and references. |
| `SEIS-EVID-009` | passed | Command Center view | Generated Command Center view model passed freshness validation. |
| `SEIS-EVID-010` | passed | Command Center static page | Generated static Goal Tracking Center page passed freshness validation. |

## Validation

Run:

```bash
npm run check:goal-tracking
```

The validator checks the goal registry, required goal docs, evidence ledger,
execution board, generated Command Center view model, and generated static page.
