# SEIS Security

Status: active public-safe policy

## Secrets

Never commit keys, tokens, passwords, private keys, private hosts, credentials,
or sensitive personal data. `.env.example` contains placeholders only. If a
secret is detected, report path and category, never value, and recommend
rotation when exposure is plausible.

Approved stores, runtime injection boundaries, rotation ownership, and
redaction requirements are defined in the
[Secret Storage Policy](security/SECRET_STORAGE.md). Suspected exposure follows
the [Credential Incident Response](security/CREDENTIAL_INCIDENT_RESPONSE.md)
runbook. Neither document authorizes an agent to inspect a value, rotate a
credential, rewrite history, or mutate an external system.

Public and restricted evidence, configuration, incidents, AI context, SSH, and
media are classified by the
[Public / Private Boundary](PUBLIC_PRIVATE_BOUNDARY.md).

## Permission Boundaries

MCP, agents, package runners, SSH, deployment, and external writes use least
privilege and read-only-first defaults. Mutation requires explicit approval,
target identity, dry-run evidence where possible, and rollback.

## Supply Chain

New dependencies require purpose, maintenance, license, permissions, size,
security, and removal-path review. Unknown scripts and curl-pipe-shell flows
are forbidden by default.

## Public Review

Run scoped secret and public-readiness checks for every PR. Broader history,
dependency, and license scans are release gates. A passing document check is
not proof of live provider, MCP, SSH, deploy, or branch-protection state.

The current baseline and known scanner exception are recorded in
[Security Baseline](security/security-baseline.md). The
[Security Hardening Review](security/hardening/hardening.md) is a derived design
proposal based on a scoped control audit; it is not a formal Codex Security
scan and is not proof that a proposal has been implemented.

The repository-level vulnerability disclosure process remains in `SECURITY.md`.
