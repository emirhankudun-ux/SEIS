# SEIS-SSH Setup (Safe)

## Purpose

Provide public-safe onboarding for remote-development concepts and readiness checks.

## Scope

- Local-first docs and planning
- Approval-ready checklists
- Rollback and evidence discipline

## Safe profile model

Use sample metadata only in docs:

- profile label
- reviewed owner
- required approvals
- readiness status

## Minimal onboarding checklist

- confirm repository safety and branch hygiene
- verify local tool versions for your environment
- separate GitHub SSH authentication from GitHub SSH commit signing
- verify no secret placeholders are committed
- document open questions and ownership

## GitHub SSH signing readiness

SEIS can use SSH for both Git transport and commit signing, but the two states
are not the same.

- SSH authentication: proves clone, fetch, and push over `git@github.com:...`
- SSH signing: proves commits satisfy GitHub verified-signature rules

Local Git signing readiness uses public configuration only:

```bash
git config gpg.format ssh
git config commit.gpgsign true
git config user.signingkey ~/.ssh/id_ed25519_seis_codex.pub
```

GitHub verification still requires registering the public key as a GitHub
signing key. The GitHub CLI scope for that owner action is
`admin:ssh_signing_key`. Never commit or print the private key, and do not
force-push rewritten signed commits without explicit owner approval.

## Deployment readiness

Only after explicit approval and evidence should deployment claims be made. Live
SSH execution remains out-of-scope for docs-only PRs.

## Do not include

- private keys
- real hostnames with credentials
- raw private environment values

## Rollback-first principle

For every planned rollout item, define rollback owner, impact, and recovery step.
