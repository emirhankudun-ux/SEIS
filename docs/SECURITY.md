# SEIS Security

Status: active public-safe policy

## Secrets

Never commit keys, tokens, passwords, private keys, private hosts, credentials,
or sensitive personal data. `.env.example` contains placeholders only. If a
secret is detected, report path and category, never value, and recommend
rotation when exposure is plausible.

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

The repository-level vulnerability disclosure process remains in `SECURITY.md`.
