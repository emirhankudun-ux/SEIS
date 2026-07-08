# SEIS SSH Public GitHub Access

This runbook turns `SEIS-SSH` into the public, contributor-friendly access
story for GitHub while preserving the existing target.

Core invariant:

```text
Keep the same server and port.
Ayni sunucu ve baglanti noktasi korunur.
```

The public promise is simple: one memorable alias, clear evidence, no secrets
in git, no fake online status, and no local-Mac dependency.

## What Is Real Today

- `SEIS-SSH` is the only visible SEIS SSH alias.
- The repository has static checks for the access model, picker compatibility,
  mobile direct-cloud readiness contracts, closed runtime, cloud roadmap, and
  enterprise benchmark.
- The current local picker check sees `SEIS-SSH` as a terminal-compatible
  Codespaces transport. Some GUI pickers may show this as offline because it
  uses `ProxyCommand`.
- Direct-cloud/mobile 24x7 readiness remains blocked until a reachable
  always-on endpoint, key auth, remote runtime, strict probe, and strict doctor
  report are verified.

## What Must Not Change

- Do not rename `SEIS-SSH`.
- Do not add duplicate visible SEIS SSH aliases.
- Do not change the current `HostName` or `Port` for `SEIS-SSH` without explicit
  owner approval.
- Do not replace the existing server with `localhost`, a `.local` LAN host, or
  an unreviewed VPS shortcut.
- Do not print or commit private keys, tokens, `.env` values, cookies, provider
  keys, or VPN private keys.

## Contributor Quickstart

Start here on a new machine or fresh clone:

```bash
npm run run:seis-ssh-public-github-quickstart
npm run run:seis-ssh-public-first-run
npm run run:seis-ssh-public-troubleshooting
```

The GitHub quickstart command is the safest one-command entrypoint for a public
contributor. It reduces the first-run guide, troubleshooting guide, contributor
doctor, and support packet into a step-by-step path from fresh clone to
secret-safe GitHub support issue. It does not contact GitHub, write
`~/.ssh/config`, open SSH, or change the server or port.

On a clean GitHub Actions runner or fresh machine, missing local `SEIS-SSH`
configuration is treated as `setup-needed` evidence, not a CI failure. The
public CI gate still fails on unsafe contract drift, local/LAN targets, secrets,
live-ready overclaims, or server/port mutation.

This first-run command is read-only. It produces a sanitized local snapshot,
shows whether setup is needed, and keeps missing `SEIS-SSH` configuration as a
clear next action instead of pretending live SSH is ready. It does not contact
GitHub, write `~/.ssh/config`, open SSH, or change the server or port.

The troubleshooting command is also read-only. It maps setup-needed, picker
warning, local/LAN target, provider billing, and live-ready claim states to safe
next actions without contacting GitHub, writing config, opening SSH, or changing
the server or port.

Use this fuller read-only sequence for a GitHub review after first-run:

```bash
npm run check:seis-ssh-public-first-run
npm run report:seis-ssh-public-first-run
npm run check:seis-ssh-public-troubleshooting
npm run report:seis-ssh-public-troubleshooting
npm run check:seis-ssh-public-support-packet
npm run report:seis-ssh-public-support-packet
npm run check:seis-ssh-public-github-quickstart
npm run report:seis-ssh-public-github-quickstart
npm run check:seis-ssh-public-merge-readiness
npm run report:seis-ssh-public-merge-readiness
npm run check:seis-ssh-public-github-policy
npm run report:seis-ssh-public-github-policy
npm run check:seis-ssh-public-signing-guide
npm run report:seis-ssh-public-signing-guide
npm run check:seis-ssh-public-review-bundle
npm run report:seis-ssh-public-review-bundle
npm run check:seis-ssh-ai-mcp-handoff
npm run report:seis-ssh-ai-mcp-handoff
npm run check:seis-ssh-public-client-compatibility
npm run report:seis-ssh-public-client-compatibility
npm run check:seis-ssh-public-pr-template
npm run check:seis-ssh-public-ci-workflow
npm run check:seis-ssh-public-readiness-matrix
npm run check:seis-ssh-public-artifact-hygiene
npm run run:seis-ssh-public-onboarding
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-access-report
npm run check:seis-ssh-public-onboarding
npm run check:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-live-readiness-evidence
npm run report:seis-ssh-public-access
npm run report:seis-ssh-public-onboarding
npm run report:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-cloud-roadmap
```

`npm run run:seis-ssh-public-onboarding` is the single contributor-friendly
deep-readiness command after first-run. It runs read-only dry-run checks,
validates the local setup, prints expected onboarding evidence, and writes a
clean set of onboarding/public-contributor report files. It requires local
prerequisite readiness (SSH, Git, `SEIS-SSH` alias) and does not open an SSH
session.

These commands prove repo governance and public-access wiring. They do not
prove a live SSH session.

When a user already has `SEIS-SSH` in `~/.ssh/config`, the connection entrypoint is:

```bash
ssh SEIS-SSH
```

This preserves the existing host and port from the local `HostName` / `Port`
settings. If `Port` is not set, OpenSSH defaults to `22`, so the same-port
invariant remains enforced by contract.

Use this one-line check to confirm the resolved host/port before attempting a
session:

```bash
ssh -G SEIS-SSH
```

The latest approval-gated live probe is recorded in
[`seis-ssh-live-readiness-evidence.md`](./seis-ssh-live-readiness-evidence.md).
As of 2026-06-29, it is blocked by a GitHub Codespaces billing issue. The
current `SEIS-SSH` server and port policy remains preserved, but live-ready and
mobile-24x7 claims are forbidden until strict online evidence passes.

`npm run report:seis-ssh-public-access` writes a sanitized local review packet
under `reports/seis-ssh-public-access/`. It uses `ssh -G SEIS-SSH` only to read
the local OpenSSH config expansion; it does not open an SSH session. Direct
hostnames are redacted and represented by a short SHA-256 prefix so reviewers
can compare endpoint continuity without publishing the server name.

`npm run report:seis-ssh-public-first-run` writes the first-run guide to
`reports/seis-ssh-public-access/first-run-latest.md`. It is designed for a
new GitHub contributor who needs one safe starting command, a sanitized local
snapshot, local tool readiness, and the next approved setup path without
config writes or live SSH.

`npm run report:seis-ssh-public-troubleshooting` writes the troubleshooting
guide to `reports/seis-ssh-public-access/troubleshooting-latest.md`. It is the
safe artifact to attach when a contributor asks whether `SEIS-SSH` is missing,
offline, blocked by provider billing, picker-incompatible, or unsafe for a live
claim.

`npm run report:seis-ssh-public-support-packet` writes the issue-ready support
packet to `reports/seis-ssh-public-access/support-packet-latest.md`. Use it
before opening the `SEIS SSH access support` GitHub issue form. It gives the
contributor copy/paste fields for command names, sanitized status labels,
warning IDs, blocker IDs, transport class, port, and endpoint fingerprint prefix
without including full `ssh -G` output, full hostnames, full IPv4/IPv6 addresses,
private keys, tokens, passwords, cookies, `.env` values, or provider
credentials.

`npm run report:seis-ssh-public-github-quickstart` writes the contributor-facing
quickstart to
`reports/seis-ssh-public-access/github-quickstart-latest.md`. It is the best
artifact for a public GitHub user who wants one clear read-only path: start
first-run, diagnose warnings, run the local doctor, and prepare the support
packet without raw SSH config output, hostnames, IP addresses, shared
credentials, live SSH, config writes, or endpoint changes.

`npm run report:seis-ssh-public-merge-readiness` writes the public PR merge
readiness report to
`reports/seis-ssh-public-access/merge-readiness-latest.md`. It keeps the
GitHub side honest when static SEIS-SSH checks are green but repository policy
still blocks merge. The current policy snapshot records
`requiredApprovingReviewCount: 10`, `requireCodeOwnerReview: true`,
`requireLastPushApproval: true`, required signatures,
`mergeStateStatus: BLOCKED`, and auto-merge enabled. This report does not call
GitHub auth, merge, admin-bypass, open live SSH, or change `SEIS-SSH` host/port.

`npm run report:seis-ssh-public-github-policy` writes the GitHub policy doctor
to `reports/seis-ssh-public-access/github-policy-latest.md`. It helps public
contributors check signed commit setup and understand required signatures,
last-push approval, code owner review, and review-thread resolution before
asking for merge. It does not contact GitHub, run `gh auth status`, open live
SSH, merge, admin-bypass, print signing keys, or change the same server and
port.

`npm run report:seis-ssh-public-signing-guide` writes the public signing guide
to `reports/seis-ssh-public-access/signing-guide-latest.md`. It gives
contributors a safe path to verified signed commits and GitHub signing key
setup when required signatures are active. It does not contact GitHub, write
git config, print signing keys, open live SSH, or change the same server and
port.

`npm run report:seis-ssh-public-review-bundle` writes the public review bundle
to `reports/seis-ssh-public-access/review-bundle-latest.md`. This is the
single best artifact for a GitHub reviewer or installed AI assistant to inspect
the SEIS-SSH public path: it summarizes access, first-run, troubleshooting,
support, quickstart, merge policy, signing, onboarding, and contributor doctor
evidence without raw SSH output, full hostnames, IP addresses, credentials, live
SSH, config writes, GitHub auth calls, or a server/port change.

`npm run report:seis-ssh-ai-mcp-handoff` writes the AI/MCP handoff to
`reports/seis-ssh-public-access/ai-mcp-handoff-latest.md`. It is the safe
artifact for an installed AI assistant, MCP reviewer, plugin-lane reviewer, or
connector reviewer that needs the SEIS-SSH public context. It maps installed AI
routes, repo-local MCP runtime counts, personal SEIS plugin lanes, connector
boundaries, and NVIDIA catalog-only lanes without calling providers, executing
MCP tools, contacting GitHub, opening SSH, writing config, printing secrets, or
changing the same server and port.

`npm run report:seis-ssh-public-client-compatibility` writes the client compatibility
matrix to `reports/seis-ssh-public-access/client-compatibility-latest.md`. It
is the safe artifact when a user asks whether SEIS-SSH is ready for GitHub
Contributor / Clean Runner, Terminal OpenSSH, ChatGPT / Codex SSH Picker, VS
Code / IDE Remote SSH, Installed AI / MCP / Plugin Reviewer, Company / Team VPN
SSH, New Device / Mobile Continuity, or Maintainer Merge Review. It does not
call providers, execute MCP tools, contact GitHub, open SSH, write config,
print secrets, or change the same server and port.

`npm run check:seis-ssh-public-pr-template` verifies that
`.github/PULL_REQUEST_TEMPLATE.md` includes the `SEIS-SSH` review checklist,
same-server/port invariant, no-secret boundary, public artifact hygiene gate,
approval-gated live SSH claim wording, and the support issue/runbook links used
by public GitHub reviewers.

`npm run check:seis-ssh-public-ci-workflow` verifies that
`.github/workflows/seis-ssh-public-access.yml` runs only the read-only public
SEIS-SSH gates on pull requests. It must not execute live SSH, refresh GitHub
auth, write SSH config, set endpoint migration variables, or publish raw
`ProxyCommand` / `IdentityFile` details.

`npm run check:seis-ssh-public-readiness-matrix` simulates a clean GitHub
Actions runner with an empty home directory. It verifies that a fresh clone
without local `SEIS-SSH` config remains GitHub-review-ready as `setup-needed`,
while unsafe local/LAN targets, secrets, live-ready overclaims, live SSH,
config writes, and server/port mutation remain blocked.

`npm run check:seis-ssh-public-artifact-hygiene` generates all public
SEIS-SSH JSON/Markdown reports in a temporary directory and scans them before
they are attached to a public issue or PR. It blocks private keys, API keys,
GitHub classic and fine-grained tokens, inline credentials, full IPv4/IPv6
addresses, private `/Users` paths, raw ProxyCommand details,
identity-file paths, live SSH attempts, and
live-ready overclaims while keeping the same `SEIS-SSH` server and port policy
visible.

`npm run report:seis-ssh-public-onboarding` writes a GitHub review-oriented
onboarding pack to `reports/seis-ssh-public-access/onboarding-pack-latest.md`.
It is read-only, does not write `~/.ssh/config`, does not open live SSH, and
separates three audiences:

- GitHub reviewers who can run static checks without credentials.
- Maintainers who must preserve the current `SEIS-SSH` server and port.
- New contributors who use their own authorized GitHub Codespace or approved
  cloud workspace rather than shared maintainer credentials.

The onboarding pack is not anonymous shell access and not a shared private-key
path.

`npm run report:seis-ssh-public-contributor-doctor` writes a self-service
doctor report to
`reports/seis-ssh-public-access/contributor-doctor-latest.md`. It checks local
tool availability, the GitHub remote shape, and the sanitized `SEIS-SSH`
snapshot without contacting GitHub, opening SSH, or writing SSH config. Use it
when a contributor says "will this work on my machine?" before any live SSH or
endpoint migration is considered.

If a contributor still needs help, they should open the `SEIS SSH access
support` issue form at
`.github/ISSUE_TEMPLATE/seis_ssh_access.yml`. The form is intentionally
secret-safe: it asks for command names, sanitized status labels, warning IDs,
and blocker IDs instead of full `ssh -G` output, full hostnames, full IP
addresses, private keys, tokens, passwords, cookies, `.env` values, or provider
credentials. It also repeats that the same `SEIS-SSH` server and port must be
preserved unless the maintainer explicitly approves a migration.

Use live readiness only when the owner has approved the selected target:

```bash
npm run cloud:ssh:online:strict
```

For mobile/direct-cloud readiness, use the existing direct-cloud runbook:

```bash
npm run cloud:ssh:mobile-direct:config:plan
npm run cloud:ssh:mobile-direct:probe:strict
npm run cloud:ssh:mobile-direct:doctor:strict
```

## Same Server And Port Rule

When a maintainer refreshes SSH config, the current `SEIS-SSH` endpoint is the
source of truth. The installer or docs may read:

- existing `HostName` from `~/.ssh/config`
- existing `Port` from `~/.ssh/config`
- `SEIS_SSH_HOST` and `SEIS_SSH_PORT` only for an explicitly approved
  direct-cloud endpoint migration

If no `Port` is configured, OpenSSH default `22` is treated as the preserved
port. A new port is not introduced silently.

## State Labels

| State | Meaning | Allowed claim |
| --- | --- | --- |
| `documented` | Public runbook and checks exist. | GitHub contributors can review the model. |
| `configured` | A managed local `SEIS-SSH` block exists. | The client has an alias. |
| `terminal-compatible` | Codespaces or equivalent works from terminal. | Terminal SSH may work when authenticated. |
| `picker-warning` | UI picker may show ProxyCommand targets offline. | Use direct-cloud only after approved endpoint proof. |
| `policy-blocked-review-ready` | Static public SSH gates are green, but GitHub rules still block merge. | Keep review/signature requirements visible without claiming merge. |
| `policy-setup-needed` | Local signed commit setup is not proven for the contributor. | Configure signing outside the repo or request an approved repository bypass. |
| `runtime-ready` | Strict online check passed. | The remote runtime was verified at check time. |
| `mobile-24x7-ready` | Strict direct-cloud doctor passed. | Mobile/Codex 24x7 claim is allowed. |

## Approval Gates

Human approval is required for:

- changing server or port
- installing or overwriting SSH config
- bootstrapping a remote VM
- executing live SSH
- changing firewall, `sshd`, systemd, VPN, or cloud resources
- pushing, merging, releasing, or publishing public readiness claims

## Validation

```bash
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-first-run
npm run check:seis-ssh-public-troubleshooting
npm run check:seis-ssh-public-support-packet
npm run check:seis-ssh-public-github-quickstart
npm run check:seis-ssh-public-merge-readiness
npm run check:seis-ssh-public-github-policy
npm run check:seis-ssh-public-signing-guide
npm run check:seis-ssh-public-review-bundle
npm run check:seis-ssh-ai-mcp-handoff
npm run check:seis-ssh-public-client-compatibility
npm run check:seis-ssh-public-pr-template
npm run check:seis-ssh-public-ci-workflow
npm run check:seis-ssh-public-artifact-hygiene
npm run check:seis-ssh-public-onboarding
npm run check:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-live-readiness-evidence
npm run check:seis-ssh-enterprise-benchmark
git diff --check
```
