# SEIS SSH Cloud Roadmap

SEIS SSH is a long-term cloud-only access system, not a local convenience alias.
The user-facing target remains:

```text
SEIS-SSH
```

This roadmap turns the current setup into a durable operating model for ChatGPT,
Codex, future SEIS clients, individual users, companies, teams, and developers.

For the 5-year enterprise benchmark view, see:

- [seis-ssh-public-github-access.md](./seis-ssh-public-github-access.md)
- [seis-ssh-direct-cloud-provider-matrix.md](./seis-ssh-direct-cloud-provider-matrix.md)
- [seis-ssh-direct-cloud-activation-plan.md](./seis-ssh-direct-cloud-activation-plan.md)
- [seis-ssh-oracle-free-tier-direct-cloud.md](./seis-ssh-oracle-free-tier-direct-cloud.md)
- [seis-ssh-5-year-enterprise-blueprint.md](./seis-ssh-5-year-enterprise-blueprint.md)
- `deploy/seis-ssh-public-access-contract.json`
- `deploy/seis-ssh-direct-cloud-provider-matrix.json`
- `deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json`
- `deploy/seis-ssh-5-year-enterprise-benchmark.json`

## Non-Negotiable Invariants

1. `SEIS-SSH` is the only visible SEIS SSH alias.
2. The alias must resolve to a cloud transport.
3. Local Mac aliases, LAN aliases, direct public VPS aliases, and VPN-specific aliases stay out of the picker.
4. Individual users use normal cloud SSH without VPN.
5. Companies and teams require WireGuard or an equivalent peer-authenticated VPN cloud route.
6. Developers use a closed cloud development system for sensitive or long-running work.
7. Remote readiness is not declared until `/workspaces/SEIS` and Codex CLI are verified.

## Tracks

### Individual Cloud Access

Purpose: keep SEIS usable from ChatGPT mobile, Codex desktop, and future devices
without depending on the current Mac.

Current provider: GitHub Codespaces.

Direct-cloud provider decision source:

```text
deploy/seis-ssh-direct-cloud-provider-matrix.json
docs/deployment/seis-ssh-direct-cloud-provider-matrix.md
docs/deployment/seis-ssh-direct-cloud-activation-plan.md
docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md
```

Current recommendation: use `oracle-cloud-free-tier` as the first always-on VM
candidate, keep `github-codespaces` as a terminal-compatible fallback, and use
`cloudflare-access-tunnel` only as an identity/access layer after a real cloud
origin exists. `google-cloud-compute` stays strong when billing, IAM, Compute
Engine API, and firewall prerequisites are confirmed.

Required evidence:

```bash
npm run check:seis-ssh-oracle-free-tier-plan
npm run check:seis-ssh-oracle-cloud-init-handoff
npm run check:seis-ssh-oracle-instance-launch-plan
npm run check:seis-ssh-oracle-owner-input-template
npm run check:seis-ssh-oracle-owner-preflight
npm run check:seis-ssh-oracle-owner-launch-command
npm run check:seis-ssh-oracle-owner-handoff
npm run check:seis-ssh-oracle-owner-action-packet
npm run check:seis-ssh-oracle-postboot-handoff
npm run check:seis-ssh-oracle-direct-cloud-pipeline
npm run check:seis-ssh-cloudflare-access-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run check:seis-ssh-provider-status-board
npm run check:seis-ssh-direct-cloud-readiness-claim
npm run check:seis-ssh-report-boundary
npm run cloud:ssh:online:strict
```

### SEIS SSH Report Boundary

`npm run check:seis-ssh-report-boundary` verifies generated reports stay ignored
while source docs and contracts stay committable. It does not call provider
APIs, does not open SSH, does not write SSH config, and does not print secrets.

Long-term direction:

- keep one `SEIS-SSH` alias
- document new-computer bootstrap
- keep GitHub CLI codespace auth as an explicit prerequisite
- add a future cloud broker only if it preserves the one-alias contract

### Organization VPN Access

Purpose: keep company and team workspaces private while preserving the same
simple `SEIS-SSH` entry point.

Current provider: WireGuard or equivalent peer-authenticated VPN cloud.

Required evidence:

```bash
npm run check:ssh-vpn-cloud-server
```

Long-term direction:

- require approved peers
- use narrow per-peer `/32` addresses
- reject broad ranges such as `0.0.0.0/0`
- keep provisioning plan-first and non-destructive
- keep team handoff surfaces private and cloud-only

### Developer Closed Cloud System

Purpose: let developers continue sensitive or long-running work in a cloud
runtime that survives local device changes and keeps private runtime state out
of the open-source repo.

Runtime contract:

```text
deploy/seis-ssh-closed-runtime-contract.json
docs/deployment/seis-ssh-closed-developer-runtime.md
```

Required evidence:

```bash
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-access-model
npm run check:seis-ssh-cloud-roadmap
```

Long-term direction:

- separate sensitive runtime state from open-source artifacts
- maintain remote Codex CLI availability
- add closed workspace promotion gates
- add a developer handoff manifest for long-running cloud sessions
- add drift checks for closed-system assumptions
- keep sanitized handoff status separate from private runtime state

## Maturity Phases

### Phase 0: Current Cloud-Only Lock

Exit criteria:

- `SEIS-SSH` is the only active SEIS SSH alias
- `npm run cloud:ssh:online:strict` passes
- access model and roadmap checks pass

### Phase 1: Portable Bootstrap

Bootstrap runbook:

```text
docs/deployment/seis-ssh-new-device-bootstrap.md
```

Exit criteria:

- a new device can install the same `SEIS-SSH` alias
- GitHub CLI and identity-file prerequisites are documented
- public GitHub access reports preserve the current server and port
- no private keys or tokens are committed
- ChatGPT and Codex SSH surfaces select `SEIS-SSH` instead of stale local aliases

### Phase 2: Team VPN Hardening

Exit criteria:

- organization peers are reviewed explicitly
- broad source ranges are rejected
- team handoff surfaces remain private and cloud-only

### Phase 3: Closed Developer Runtime

Exit criteria:

- developer workspaces have closed runtime governance
- sensitive execution state is separated from open-source artifacts
- long-running Codex work can resume from cloud evidence

## Cadence

Weekly:

- run `npm run cloud:ssh:online:strict`
- confirm duplicate SEIS aliases have not returned

Release:

- run `npm run check:seis-ssh-access-model`
- run `npm run check:seis-ssh-cloud-roadmap`
- run `npm run check:seis-ssh-closed-runtime`
- run `npm run check:ssh-vpn-cloud-server`

Incident:

- remove stale aliases instead of adding local fallbacks
- rotate affected credentials outside the repo
- rebuild `SEIS-SSH` from the managed installer

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
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-access-model
npm run check:seis-ssh-enterprise-benchmark
npm run cloud:ssh:online:strict
npm run check:ssh-vpn-cloud-server
```
