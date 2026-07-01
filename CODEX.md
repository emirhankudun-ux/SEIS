# SEIS Codex Guide

SEIS uses Codex as the primary execution layer for repository work, automation,
quality checks, and implementation handoff.

## Workflow

Canonical flow:

```text
GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge
```

Local Codex work must stay compatible with that flow:

1. Inspect `git status --short --branch` and `git remote -v`.
2. Keep work on `main` or a short-lived review branch.
3. Make small, reversible changes.
4. Refresh generated reports after source-surface changes.
5. Run the lightest relevant checks first, then `npm run quality`.
6. Use GitHub CLI read-only checks before claiming GitHub state is current.
7. Do not push, archive, privatize, delete, or transfer repositories without
   explicit maintainer confirmation.

## GitHub SSH Handoff

Codex may use the SEIS SSH clone for GitHub Git operations when the repo-local
SSH command, signing key, GitHub auth, and remote probe are verified. The
public-safe procedure lives in
[`docs/deployment/seis-codex-git-ssh-handoff.md`](./docs/deployment/seis-codex-git-ssh-handoff.md).

This handoff is not the same as `SEIS-SSH` live cloud readiness. A working
GitHub SSH clone can support branch, commit, push, and PR work, but mobile 24/7
or remote-runtime claims still require the strict `SEIS-SSH` evidence gates.

## Remote Codex CLI Bridge

When `SEIS-SSH` is online, Codex can verify the remote cloud workspace and
remote Codex CLI with:

```bash
npm run cloud:ssh:remote-codex:status
npm run cloud:ssh:remote-codex:strict
```

The bridge is read-only by default. It verifies `/workspaces/SEIS`, `git`, and
`codex --version`; it does not execute prompts, edit files, push branches, or
publish releases without a separate approval-gated action.

## Primary Identities

Codex work should route through the SEIS identity map:

- `SEIS` for ecosystem governance and open-source operating model.
- `SEIS-Agent` for unified agent orchestration.
- `SEIS-Cloud` for SSH-enabled, VPN-ready cloud infrastructure.
- `SEIS-Code` for engineering, tests, MCP, and automation.
- `SEIS-Design` for design systems, accessibility, and product experience.
- `SEIS-Data` for memory, context, analytics, reports, and provenance.

Canonical records:

- [`data/seis-operating-identities.json`](./data/seis-operating-identities.json)
- [`docs/governance/seis-operating-identities.md`](./docs/governance/seis-operating-identities.md)

## Security

- Use SSH Ed25519 keys only.
- Use least privilege for SSH, GitHub, cloud, and deployment operations.
- Never expose credentials, tokens, private keys, certificates, provisioning
  profiles, `.env` contents, or secrets in prompts, commits, logs, docs, or
  generated artifacts.
- Treat SSH/VPN cloud as a workplace/team surface, not a public launch surface.

## Validation

Common checks:

```bash
npm run check:seis-operating-identities
npm run check:seis-ai-agent
npm run check:ssh-vpn-cloud-server
npm run check:ssh-hardening-contract
npm run quality
```

SSH hardening behavior is tracked in
`data/ssh-hardening-operation-contract.json`. Codex may use additional focused
checks when the affected files require them.
