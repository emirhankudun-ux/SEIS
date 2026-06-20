# SEIS Goal Evidence Ledger

Date: 2026-06-20

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
| `SEIS-EVID-011` | passed | Review cadence | Daily, weekly, and monthly cadence records validate without claiming performed reviews. |
| `SEIS-EVID-012` | passed | Planning horizons | Yearly, quarterly, monthly, weekly, and active-project records validate. |
| `SEIS-EVID-013` | passed | Progress ledger | Completed, deferred, and follow-up records validate with evidence and limitations. |
| `SEIS-EVID-014` | passed | Objective coverage | Goal Tracking OS mission requirements are mapped to evidence, limitations, and next safe actions. |
| `SEIS-EVID-015` | passed | Review log | Daily Goal Tracking OS review for 2026-06-20 was performed from current evidence. |
| `SEIS-EVID-016` | passed | Completion gate | Strict completion gate distinguishes proved foundation work from partial and blocked full-objective requirements. |
| `SEIS-EVID-017` | passed | Review log | Weekly Goal Tracking OS review for 2026-W25 was performed from current evidence and next PR queue state. |
| `SEIS-EVID-018` | passed | Review log | Monthly Goal Tracking OS review for 2026-06 was performed from current evidence, roadmap state, and readiness blockers. |
| `SEIS-EVID-019` | passed | Command Center shell | Static Command Center shell was generated and validated from a local non-LLM contract. |
| `SEIS-EVID-020` | passed | Requirement matrix | Goal Tracking OS requirements are mapped to proof, gaps, evidence ids, and next safe actions. |

## Validation

Run:

```bash
npm run check:goal-tracking
```

The validator checks the goal registry, required goal docs, evidence ledger,
execution board, review cadence, review log, planning horizons, progress
ledger, objective coverage, completion gate, requirement matrix, generated
Command Center view model, and generated static page.
