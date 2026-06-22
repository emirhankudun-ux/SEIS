# Goal Evidence Ledger

Structured source:

- `content/development/seis-goal-evidence.json`

Evidence records support status and next actions. They are not full completion
claims unless the named scope is fully proved.

## Evidence Rules

- Use repo-relative paths.
- Keep limitations visible.
- Do not store secrets, tokens, private keys, `.env` values, or private hosts.
- Do not use LLM summaries as sole proof.
- Do not claim public readiness, release readiness, deployment, SSH, training,
  benchmarks, or dataset state unless those checks were actually performed.

## Current Records

| ID | Status | Scope |
| --- | --- | --- |
| `SEIS-EVID-001` | passed | Goal Tracking docs foundation. |
| `SEIS-EVID-002` | passed | Roadmap and next PR queue foundation. |
| `SEIS-EVID-003` | passed | Command Center Goal view docs. |
| `SEIS-EVID-004` | blocked | Repository hygiene blocker observed. |
| `SEIS-EVID-005` | passed | Goal Tracking validator available. |
| `SEIS-EVID-006` | passed | Static Command Center Goal Tracking view generated. |
