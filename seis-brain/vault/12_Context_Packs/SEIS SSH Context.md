---
type: context-pack
module: seis-ssh
status: active-public-safe
priority: high
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Xcode
  - Public GitHub
forbidden_destinations:
  - live SSH session without approval
  - private host credential prompt
  - provider prompt with secrets
---

# SEIS SSH Context

## Purpose

SEIS-SSH is the cloud/remote development layer for SEIS. It is represented here
as a public-safe planning and review context only.

## Current Rule

Use one user-facing target name: `SEIS-SSH`. Do not expose local Mac, LAN,
direct VPS, VPN-specific, or real host aliases as public GitHub defaults.

## Current Boundary

This context pack does not prove live SSH access, does not open a remote shell,
does not install SSH config, does not deploy, and does not store credentials.
Live SSH checks require explicit approval and current command evidence.

## Source Records

- `docs/deployment/seis-ssh-access-model.md`
- `docs/deployment/seis-ssh-cloud-roadmap.md`
- `docs/deployment/seis-ssh-closed-developer-runtime.md`
- `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAppleFirstFoundation.swift`

## Allowed Actions

- Read SEIS-SSH docs and demo metadata.
- Review public-safe SSH readiness gates.
- Propose docs, validators, and metadata-only models.
- Run non-mutating local validators.

## Forbidden Actions

- Print or store private keys.
- Print or store access tokens.
- Add real hostnames, IPs, usernames, or credentials.
- Execute remote destructive cleanup.
- Run SSH, deployment, push, merge, or release commands without explicit human
  approval.

## Verification Commands

```bash
npm run check:seis-ssh-access-model
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-brain-context-packs
```

## Handoff Output

Any SSH-related handoff must report status as demo, planned, blocked, or
verified with command evidence. If live access is not checked in the current
turn, say so directly.
