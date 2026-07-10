# SEIS Codex Git SSH Handoff

This runbook records the GitHub SSH path that lets Codex work on SEIS through
the SSH clone, push review branches, and create signed commits without changing
the live `SEIS-SSH` cloud target.

It is intentionally narrower than the SEIS remote runtime:

- GitHub Git SSH proves repository transport to `git@github.com`.
- SSH commit signing proves commit identity when GitHub verifies the signature.
- `SEIS-SSH` live readiness proves a remote cloud host, remote repo, and Codex
  runtime are reachable.

This document separates GitHub Git SSH transport and SSH commit signing from
live SEIS cloud runtime claims.

Do not merge these claims. A working GitHub SSH clone does not prove the
`SEIS-SSH` live VM is online or mobile 24/7 ready.

## Public-Safe Local Shape

Use a repo-local SSH command instead of changing every Git repository on the
machine:

```bash
git config core.sshCommand "ssh -i ~/.ssh/id_ed25519_seis_codex -o IdentitiesOnly=yes"
```

Use SSH signing for commits:

```bash
git config user.name "SEIS Maintainer"
git config user.email "maintainer@example.com"
git config gpg.format ssh
git config commit.gpgsign true
git config user.signingkey ~/.ssh/id_ed25519_seis_codex.pub
```

The private key stays outside the repository. Do not commit `~/.ssh/config`,
private key material, access tokens, `.env` values, or GitHub CLI auth files.

## Verification Sequence

Run these checks from the SEIS SSH clone before claiming the handoff is ready:

```bash
git status --short --branch
git remote -v
git config --get core.sshCommand
git config --get gpg.format
git config --get commit.gpgsign
git config --get user.signingkey
ssh-add -l
ssh -T -o BatchMode=yes git@github.com
git ls-remote origin HEAD
```

GitHub intentionally returns a non-shell message for `ssh -T`; the success
signal is the authenticated greeting plus the statement that GitHub does not
provide shell access.

When GitHub CLI is authenticated, a maintainer may also check that an SSH
signing key exists without printing key material:

```bash
gh api /user/ssh_signing_keys --jq 'map({title,created_at})'
```

Do not print private keys or public key bodies in logs. Fingerprints, key
titles, and creation timestamps are acceptable evidence.

## Mobile And Codex Boundary

This handoff supports ChatGPT mobile and Codex desktop by giving the active
Codex environment a stable GitHub SSH path for branch, commit, push, and PR
work.

It does not make the repo independently reachable from a phone when the local
Mac is offline. Mobile 24/7 claims still require the direct-cloud `SEIS-SSH`
strict doctor:

```bash
npm run cloud:ssh:mobile-direct:doctor:strict
```

## Allowed Claims

- Codex can use the SEIS SSH clone for GitHub Git operations when the checks
  above pass.
- Commits can be called GitHub-verified only after GitHub reports the commit
  signature as verified.
- The setup is public-safe when no keys, tokens, hosts, or `.env` values are
  written to git.

## Blocked Claims

- Do not claim `SEIS-SSH` live runtime readiness from GitHub SSH evidence alone.
- Do not claim ChatGPT mobile 24/7 readiness from a local SSH clone alone.
- Do not claim a branch is published until `git push` or GitHub PR evidence is
  verified.
- Do not claim signature verification until GitHub has accepted the commit as
  verified.

## Validation

Pair this handoff with the existing SEIS SSH public checks:

```bash
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-live-readiness-evidence
git diff --check
```
