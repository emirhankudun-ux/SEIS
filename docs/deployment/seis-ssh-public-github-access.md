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
- The repo has static checks for the access model, picker compatibility,
  mobile direct-cloud readiness contracts, cloud roadmap, and enterprise
  benchmark.
- The current local picker check can see `SEIS-SSH` as terminal-compatible when
  it uses GitHub Codespaces. Some GUI pickers may still show ProxyCommand
  targets as offline.
- Direct-cloud/mobile 24x7 readiness remains blocked until a reachable
  always-on endpoint, key auth, remote runtime, strict probe, and strict doctor
  report are verified.

## What Must Not Change

- Do not rename `SEIS-SSH`.
- Do not add duplicate visible SEIS SSH aliases.
- Do not change the current `HostName` or `Port` for `SEIS-SSH` without
  explicit owner approval.
- Do not replace the existing server with `localhost`, a `.local` LAN host, or
  an unreviewed VPS shortcut.
- Do not print or commit private keys, tokens, `.env` values, cookies, provider
  keys, or VPN private keys.

## Contributor Quickstart

Use this read-only sequence for a GitHub review:

```bash
npm run run:seis-ssh-public-onboarding
npm run check:seis-ssh-public-access
npm run check:seis-ssh-report-boundary
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run check:seis-ssh-provider-status-board
npm run check:seis-ssh-oracle-owner-action-packet
npm run check:seis-ssh-public-access-report
npm run check:seis-ssh-public-onboarding
npm run report:seis-ssh-public-access
npm run report:seis-ssh-public-onboarding
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-cloud-roadmap
```

`npm run run:seis-ssh-public-onboarding` is the single contributor-friendly
entrypoint command. It runs read-only dry-run checks, validates the local setup,
prints expected onboarding evidence, and writes clean review report files. It
requires local prerequisite readiness and does not open an SSH session.

These commands prove repo governance and public-access wiring. They do not
prove a live SSH session.

## SEIS SSH Report Boundary

Run the report boundary guard before attaching SEIS-SSH evidence to a public
GitHub PR:

```bash
npm run check:seis-ssh-report-boundary
```

This guard verifies generated reports stay ignored while source docs and
contracts stay committable. It does not call provider APIs, does not open SSH,
does not write SSH config, and does not print secrets.

Guard source:

```text
scripts/check-seis-ssh-report-boundary.mjs
```

## GitHub Codespaces Fallback Plan

Use this local-only plan to keep the GitHub Codespaces path explicit:

```bash
npm run cloud:ssh:github-codespaces:fallback-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
```

Source:

```text
scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs
```

The GitHub Codespaces fallback plan is terminal-compatible evidence only. It
does not call GitHub APIs, does not run `gh auth status`, does not open SSH,
does not write SSH config, and does not print ProxyCommand details, tokens,
private keys, or identity files. It keeps Codespaces as fallback-only while
Oracle or another approved direct-cloud VM becomes the mobile 24x7 target.

## SEIS SSH Provider Status Board

Use the status board when you need one owner-facing summary of Oracle,
Codespaces, Cloudflare, and the direct-cloud readiness claim:

```bash
npm run cloud:ssh:provider-status:board
npm run check:seis-ssh-provider-status-board
```

Source:

```text
scripts/create-seis-ssh-provider-status-board.mjs
```

The board refreshes only local, non-mutating SEIS reports. It does not call
provider APIs, open SSH, write SSH config, or print raw endpoints, private
keys, tokens, ProxyCommand details, or provider credentials.

When a user already has `SEIS-SSH` in `~/.ssh/config`, the connection entrypoint
is:

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

`npm run report:seis-ssh-public-access` writes a sanitized local review packet
under `reports/seis-ssh-public-access/`. It uses `ssh -G SEIS-SSH` only to read
the local OpenSSH config expansion; it does not open an SSH session. Direct
hostnames are redacted and represented by a short SHA-256 prefix so reviewers
can compare endpoint continuity without publishing the server name.

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

Use live readiness only when the owner has approved the selected target:

```bash
npm run cloud:ssh:online:strict
```

For mobile/direct-cloud readiness, use the existing direct-cloud runbook:

```bash
npm run check:seis-ssh-direct-cloud-provider-matrix
npm run cloud:ssh:mobile-direct:config:plan
npm run cloud:ssh:mobile-direct:probe:strict
npm run cloud:ssh:mobile-direct:doctor:strict
```

Provider selection is tracked in:

```text
deploy/seis-ssh-direct-cloud-provider-matrix.json
deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json
docs/deployment/seis-ssh-direct-cloud-provider-matrix.md
docs/deployment/seis-ssh-direct-cloud-activation-plan.md
docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md
```

The current provider order is `oracle-cloud-free-tier`, `github-codespaces`,
`cloudflare-access-tunnel`, then `google-cloud-compute`. Cloudflare is modeled
as an identity/access layer, not as a VM replacement, and local Mac tunneling is
not the default public SEIS-SSH path.

Before live provider work, generate the read-only activation plan:

```bash
npm run cloud:ssh:oracle-free-tier:plan
npm run check:seis-ssh-oracle-free-tier-plan
npm run cloud:ssh:oracle-cloud-init:handoff
npm run check:seis-ssh-oracle-cloud-init-handoff
npm run cloud:ssh:oracle-instance:plan
npm run check:seis-ssh-oracle-instance-launch-plan
npm run cloud:ssh:oracle-owner:template
npm run check:seis-ssh-oracle-owner-input-template
npm run cloud:ssh:oracle-owner:preflight
npm run check:seis-ssh-oracle-owner-preflight
npm run cloud:ssh:oracle-owner:launch-command
npm run check:seis-ssh-oracle-owner-launch-command
npm run cloud:ssh:oracle-owner:handoff
npm run check:seis-ssh-oracle-owner-handoff
npm run cloud:ssh:oracle-owner:action-packet
npm run check:seis-ssh-oracle-owner-action-packet
npm run cloud:ssh:oracle-postboot:handoff
npm run check:seis-ssh-oracle-postboot-handoff
npm run cloud:ssh:oracle-direct-cloud:pipeline
npm run check:seis-ssh-oracle-direct-cloud-pipeline
npm run cloud:ssh:github-codespaces:fallback-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run cloud:ssh:provider-status:board
npm run check:seis-ssh-provider-status-board
npm run cloud:ssh:cloudflare-access:plan
npm run check:seis-ssh-cloudflare-access-plan
npm run cloud:ssh:direct-cloud:claim
npm run check:seis-ssh-direct-cloud-readiness-claim
npm run cloud:ssh:direct-cloud:plan
npm run check:seis-ssh-direct-cloud-activation-plan
```

The Oracle owner action packet includes an Oracle Console Checklist for the
missing owner env keys. It is safe for public review because it names Console
areas and env keys, not real OCIDs, endpoints, tokens, private keys, or OCI
session contents.

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
npm run check:seis-ssh-report-boundary
npm run check:seis-ssh-direct-cloud-provider-matrix
npm run check:seis-ssh-cloudflare-access-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run check:seis-ssh-provider-status-board
npm run check:seis-ssh-direct-cloud-activation-plan
npm run check:seis-ssh-oracle-owner-input-template
npm run check:seis-ssh-oracle-owner-launch-command
npm run check:seis-ssh-oracle-owner-handoff
npm run check:seis-ssh-oracle-owner-action-packet
npm run check:seis-ssh-public-access-report
npm run check:seis-ssh-public-onboarding
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-enterprise-benchmark
git diff --check
```
