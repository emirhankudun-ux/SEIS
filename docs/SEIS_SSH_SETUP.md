# SEIS-SSH Setup (Safe)

## Purpose

Provide public-safe onboarding for remote-development concepts and readiness checks.

## Scope

- Local-first docs and planning
- Approval-ready checklists
- Rollback and evidence discipline

## What SEIS-SSH is

- A documented public alias and readiness model for contributor GitHub onboarding.
- A planning surface for remote workflows, not a config file.
- A safe "dry-run first" model before any live command or deployment.

## What SEIS-SSH is not

- Not a credential distribution layer.
- Not live production automation in this PR.
- Not a place for private hostnames or machine-specific secrets.

## Safe profile model

Use sample metadata only in docs:

- profile label
- reviewed owner
- required approvals
- readiness status

## Local environment variables (examples only)

```bash
export SEIS_SSH_ALIAS="seis-github"
export SEIS_SSH_USER=""
export SEIS_SSH_HOST=""
export SEIS_SSH_PORT="22"
export SEIS_SSH_PREFERRED_TOOL="codespaces|vscode|local-shell"
```

Leave all values empty or placeholder-only in public docs.

## Minimal onboarding checklist

- confirm repository safety and branch hygiene
- verify local tool versions for your environment
- validate `SEIS-SSH` contract files and onboarding docs
- verify no secret placeholders are committed
- document open questions and ownership
- record rollback owner and recovery step for each rollout item

## Deployment readiness

Only after explicit approval and evidence should deployment claims be made. Live
SSH execution remains out-of-scope for docs-only PRs.

## Required checks before rollout

- `npm run check:seis-ssh-public-access`
- `npm run check:seis-ssh-public-onboarding`
- `npm run check:seis-ssh-public-contributor-doctor`
- `npm run check:seis-ssh-live-readiness-evidence`
- `npm run check:seis-ssh-access-model`

## Do not include

- private keys
- real hostnames with credentials
- raw private environment values
- production secrets in screenshots or logs

## Rollback-first principle

For every planned rollout item, define rollback owner, impact, and recovery step.

## Safe command example set (dry-run only)

- `ssh -V`
- `git remote -v`
- `ssh -F /dev/null -G SEIS-SSH` (inspect-only when allowed by environment)

All commands above should be read-only or plan-oriented.
