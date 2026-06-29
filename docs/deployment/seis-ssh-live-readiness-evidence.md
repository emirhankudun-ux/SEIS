# SEIS SSH Live Readiness Evidence

This document records the latest approval-gated live `SEIS-SSH` probe without
publishing secrets or changing the endpoint.

Core invariant:

```text
Keep the same server and port.
Ayni sunucu ve baglanti noktasi korunur.
```

## Latest Live Probe

Observed date: 2026-06-29

Command:

```bash
npm run cloud:ssh:online -- --connect-timeout 12
```

Result: blocked.

What the live probe proved:

- `SEIS-SSH` resolves as the single cloud-only alias.
- The current transport is GitHub Codespaces.
- The current port is `22`.
- The same server and port policy was preserved.
- No SSH config was written.
- No server, firewall, `sshd`, or GitHub setting was changed.

What blocked live readiness:

- GitHub Codespaces refused to start the current Codespace because of an HTTP
  402 billing issue.
- The remote session did not become online.
- `/workspaces/SEIS` and remote Codex CLI could not be verified.
- Codespaces `ProxyCommand` transport remains terminal-compatible but not
  generic-picker proven.

## Allowed Claims

- Public contract, onboarding pack, and contributor doctor are review-ready.
- The latest live probe preserves the same server and port policy.
- The latest live probe is blocked by a provider billing condition.

## Forbidden Claims

- Do not claim `SEIS-SSH` is live-ready.
- Do not claim ChatGPT mobile 24x7 readiness.
- Do not claim GUI picker compatibility.
- Do not change `HostName` or `Port` to bypass the billing issue.
- Do not add duplicate visible SEIS SSH aliases.

## Human Approval Needed

- Resolve GitHub Codespaces billing, or approve an equivalent direct-cloud or
  broker path that still preserves the one-alias contract.
- Rerun `npm run cloud:ssh:online:strict` only with explicit live SSH approval.
- Run direct-cloud/mobile checks only after the endpoint is approved and
  reachable.

## Validation

```bash
npm run check:seis-ssh-live-readiness-evidence
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-contributor-doctor
```
