# SEIS Agent Registry

SEIS uses supervised, role-based collaboration. The registry describes
responsibility and evidence boundaries; it does not create persistent
background workers or grant permissions.

## Sources

- `SEIS_AGENT_WORKFORCE.md` is the canonical bounded-agent workforce contract.
- `content/development/seis-agency-team.json` is the machine-readable agency overlay.
- `docs/ai/agent-registry.md` explains the current role and permission model.
- `docs/ai/agent-runtime.md` documents the plan-only/read-only runtime boundary.
- `docs/SEIS_GOAL_TRACKING.md` defines the long-term role families.

## Agency operating overlay

The agency-shaped operating model is documented in
docs/governance/SEIS_AGENCY_OPERATING_MODEL.md. Its machine-readable contract
is content/development/seis-agency-team.json.

The overlay groups thirteen agency role families into five delivery pods and
defines a validated 300-person planning model. It does not create runtime
workers, grant permissions, or claim current payroll or hiring evidence.

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
