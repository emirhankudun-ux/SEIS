# SEIS Public Demo Smoke Matrix

This matrix records the current real browser demo entrypoints that should keep working while SEIS grows into the full AI-native creative operating system demo.

## Real entrypoints checked

| ID | File | Purpose |
| --- | --- | --- |
| website | `apps/web/index.html` | public landing and product story |
| desktop-os | `apps/web/desktop.html` | browser desktop OS shell |
| linux-replica | `apps/web/seis-linux-replica.html` | Linux-like supplied-reference demo |
| linux-replica-public | `apps/web/seis-linux-replica-public-demo.html` | public Linux replica entry |
| seis-code | `apps/web/seis-code.html` | browser IDE demo |
| wow-gallery | `apps/web/wow-gallery.html` | cinematic visual showcase |
| cockpit | `apps/web/seis-cockpit.html` | SEIS cockpit demo surface |

## What the check proves

- Each listed real entrypoint exists under `apps/web`.
- Each entrypoint is non-empty.
- Each entrypoint has a `<title>`.
- Each entrypoint has a viewport meta tag.
- This document records the purpose of each entrypoint.
- The smoke matrix does not claim live provider, SSH, GitHub, or deployment mutation.

## Safety boundary

- No API keys are required.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.

## Validation

Run:

```bash
node scripts/check-public-demo-smoke-matrix.mjs
```

This is a focused smoke check, not a full browser test. It is meant to protect the current public demo entrypoints from accidental deletion, empty rewrites, missing basic metadata, or unsafe live claims.
