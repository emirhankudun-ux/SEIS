---
name: seis-security-review
description: Review SEIS security, privacy, least-privilege, secret-safety, SSH/cloud, CI, GitHub readiness, plugin/skill, and validation-claim risks inside the SEIS GitHub repository. Use when assessing vulnerabilities, hardening scripts, reviewing PRs, checking governance changes, or preventing unverified deploy, merge, push, connected, ready, protected, or hardened claims.
---

# SEIS Security Review

Use this skill to review SEIS changes with the security-first priority order:
security, architecture, documentation, tests, reliability, performance,
automation, then features.

## Canonical Surfaces

Inspect only the surfaces needed for the current task, starting from:

- `SECURITY.md`
- `CODEX.md`
- `AGENTS.md`
- `docs/governance/seis-master-prompt.md`
- `docs/governance/seis-master-prompt-change-checklist.md`
- `docs/governance/seis-master-prompt-github-controls.md`
- `data/seis-master-prompt-acceptance-criteria.json`
- `data/seis-master-prompt-github-controls.json`
- `scripts/check-seis-master-prompt.mjs`
- `scripts/ultra_ssh_manager.py`
- `.github/workflows/seis-master-prompt-governance.yml`
- `.github/CODEOWNERS`

## Workflow

1. Classify the change: repository governance, SSH/cloud hardening, CI,
   plugin/skill, app code, data, documentation, or release readiness.
2. Check secret safety before functionality: reject private keys, API keys,
   inline passwords, token assignments, copied `.env` values, and sensitive
   personal or infrastructure details.
3. Check least privilege: review users, tokens, GitHub permissions, workflow
   permissions, SSH access, cloud access, firewall scope, and service accounts.
4. Check rollback and recovery: require documented recovery steps before
   destructive, network, SSH, firewall, deploy, or migration operations.
5. Check idempotency: hardening scripts must avoid duplicated config lines,
   conflicting firewall rules, and partial state when rerun.
6. Check validation honesty: Do not claim pushed, merged, deployed, connected,
   ready, protected, or hardened without direct evidence from the relevant
   local command, GitHub state, cloud provider state, or explicit maintainer
   waiver.
7. Check generated artifacts: when governance or source surfaces change, update
   the implementation map, acceptance criteria, generated reports, and focused
   checks that enforce them.

## Expected Checks

Recommend the narrowest relevant checks. Do not claim they passed unless they
were actually run.

```bash
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:open-source-governance
npm run quality
```

For SSH hardening changes, add the SSH manager test path when it exists:

```bash
python3 -m unittest scripts.tests.test_ultra_ssh_manager
```

## Review Priorities

- Block secrets, credentials, private keys, token leaks, and sensitive logs.
- Prefer rollback-ready and idempotent scripts over one-way hardening.
- Keep port knocking, firewall, SSH, rescue user, and VPN decisions explicitly
  ordered to avoid lockout.
- Keep emergency accounts console-only unless the maintainer explicitly accepts
  a documented remote-access model.
- Keep generated keys and temporary passwords out of persistent logs and
  repository files.
- Require GitHub evidence before claiming branch protection, checks, CODEOWNERS,
  or release readiness.

## Hard Stop

Stop and ask for explicit maintainer approval before destructive operations,
deploy, merge, push, history rewrite, firewall lockout risk, live SSH changes,
or any action that could expose secrets or block access.
