# SEIS-SSH

## Purpose

SEIS-SSH is the documented remote-development and cloud-readiness surface for
safe contributor onboarding and review.

## What SEIS-SSH is

- A governance-safe concept for local and remote workflow planning.
- A standards surface for host/policy, not a credential store.
- A pre-flight onboarding layer for contributor readiness.

## What SEIS-SSH is not

- A live deployment tool by default.
- A credential distribution mechanism.
- A tool for unattended remote execution.

## Local development

1. Start locally first.
2. Validate with local scripts and browser gates.
3. Use SEIS-SSH docs only for planning, readiness, and migration notes.

## Remote workspace concept

GitHub Codespaces and cloud shells are optional targets. They require:

- explicit human approval
- sample-safe config
- no real credentials in repo
- visible rollback path

## OpenSSH / Ed25519 safety

- Never store private keys in repo.
- Never claim host access without approval evidence.
- Never post real hostnames or usernames in public files.

## Environment variables

Public docs may reference examples only:

```bash
export SEIS_SSH_ALIAS=...
export SEIS_SSH_HOST=...
export SEIS_SSH_USER=...
```

## Credential policy

- No secrets, PEM, `*.key`, or private host profiles in Git.
- `.env` values are never committed.

## Demo SSH profiles

Keep demo profiles metadata-only (`label`, `intent`, `status`, `review notes`).

## Safe commands

- `ssh -V` (local tool check only, no remote connect)
- `git remote -v`
- local docs and config checks
- offline readiness dry-run scripts

## Dangerous commands

- Recursive destructive deletes
- raw credential writes
- remote command execution without explicit authorization

## Deployment readiness

- `plan`, `owner`, `rollback`, and `required approvals` before claiming deployment
  readiness.

## Rollback readiness

Define rollback plan before rollout:

- who owns each step
- expected impact per step
- recovery verification

## Future plans

- Planned: Tailscale/VPN path and one-command bootstrap
- Planned: approval-gated production SSH runbooks

## Security checklist

- no real keys
- no real host credentials
- no unverified deployment claims
