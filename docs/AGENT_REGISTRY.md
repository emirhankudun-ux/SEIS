# SEIS Agent Registry

SEIS uses supervised, role-based collaboration. The registry describes
responsibility and evidence boundaries; it does not create persistent
background workers or grant permissions.

## Sources

- `content/development/seis-agent-registry.json` is the machine-readable source.
- `docs/ai/agent-registry.md` explains the current role and permission model.
- `docs/ai/agent-runtime.md` documents the plan-only/read-only runtime boundary.
- `docs/SEIS_GOAL_TRACKING.md` defines the long-term role families.

## Permission Defaults

| Level            | Meaning                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| `read-only`      | Inspect public-safe repository evidence.                                        |
| `plan-only`      | Produce scoped plans, risks, checks, and handoffs.                              |
| `write-gated`    | Edit only approved paths with a single writer and validation evidence.          |
| `external-gated` | Request remote or external mutation after approval and dry-run evidence.        |
| `forbidden`      | Secrets, destructive git, hidden background execution, and unreviewed mutation. |

Codex is the current single writer. Review agents return inspected paths,
changes, validation, risks, blockers, rollback, and the next handoff. No agent
may claim provider execution, SSH access, deployment, or live AI without direct
evidence.

## Required Handoff

Every role report names the goal, scope, affected files, validation commands,
failed or skipped checks, security notes, and whether the output is planning,
read-only evidence, or an approved action.
