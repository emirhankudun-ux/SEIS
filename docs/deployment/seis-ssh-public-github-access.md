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

Codex GitHub SSH clone work is tracked separately in
[`seis-codex-git-ssh-handoff.md`](./seis-codex-git-ssh-handoff.md). That handoff
can prove GitHub Git transport and SSH commit signing, but it does not prove
`SEIS-SSH` live runtime or mobile 24/7 readiness.

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

Use this read-only sequence for a GitHub review:

```bash
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-access-report
npm run check:seis-ssh-public-access-report-fixtures
npm run check:seis-ssh-network-boundaries
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

These commands prove repo governance and public-access wiring. The report,
onboarding, and contributor-doctor checks fail closed when the local config has
no explicit `Host SEIS-SSH` block. They still do not prove a live SSH session.

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

## GitHub Pull Request Guard

Every pull request that changes the SEIS-SSH contract, runbooks, checks, or
workflow is covered by
`.github/workflows/seis-ssh-public-access.yml`. The workflow is a fast,
static-only GitHub status check for contributors and maintainers. It runs the
public contract, missing-alias regression fixture, shared network-boundary
tests, onboarding, contributor doctor, live-readiness evidence, access-model,
cloud-roadmap, closed-runtime, and enterprise checks before review.

GitHub-hosted runners use the tracked
`scripts/fixtures/seis-ssh-public-access.conf` parser fixture. It contains an
explicit `Host SEIS-SSH`, preserves `github.codespaces` and port `22`, and never
opens a connection. Fixture output is labeled `static-fixture-verified` with
`readinessReady: false`; it cannot be used as live endpoint evidence. A
separate negative fixture proves that a missing alias exits non-zero.

Run the same local gate before opening a PR:

```bash
npm run check:seis-ssh-github-pr-contract
```

The workflow requests `contents: read` only. It does not run `gh auth`,
`gh cs ssh`, `ssh -T`, a live SSH session, deployment, credential access, or
server/port mutation. A passing status check proves repository wiring and
honest boundaries, not that the remote endpoint is online.

The SSH contract and its workflow are owner-reviewed through `.github/CODEOWNERS`.
GitHub contributors can therefore use the same visible `SEIS-SSH` alias and
receive deterministic feedback without sharing maintainer credentials.

`npm run report:seis-ssh-public-contributor-doctor` writes a self-service
doctor report to
`reports/seis-ssh-public-access/contributor-doctor-latest.md`. It checks local
tool availability, the GitHub remote shape, and the sanitized `SEIS-SSH`
snapshot without contacting GitHub, opening SSH, or writing SSH config. Use it
when a contributor says "will this work on my machine?" before any live SSH or
endpoint migration is considered.

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

## Endpoint Continuity Evidence

The public report exposes a sanitized endpoint fingerprint so a maintainer can
compare the resolved `SEIS-SSH` target without publishing the host name,
Codespace identifier, identity-file path, or raw `ProxyCommand`. The fingerprint
covers the resolved host, port, and normalized transport shape.

Record a local baseline once after reviewing the current endpoint:

```bash
npm run record:seis-ssh-endpoint-continuity
npm run check:seis-ssh-endpoint-continuity
```

The baseline and result stay under the ignored `reports/` directory. Recording
the baseline does not write `~/.ssh/config` or open SSH. A missing baseline is
reported as `baseline-required`; a fingerprint or port mismatch fails closed
and cannot overwrite the baseline automatically. Endpoint migration still
requires explicit owner approval and a reviewed change.

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
npm run check:seis-ssh-public-onboarding
npm run check:seis-ssh-public-contributor-doctor
npm run check:seis-ssh-live-readiness-evidence
npm run check:seis-ssh-enterprise-benchmark
npm run check:seis-ssh-endpoint-continuity
git diff --check
```
