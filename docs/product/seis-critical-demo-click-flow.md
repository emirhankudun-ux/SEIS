# SEIS Critical Demo Click Flow Contract

This contract defines the minimum browser-local click targets that must remain available for a reviewer walking through the current SEIS demo.

It is intentionally static and conservative. It does not claim full browser automation, live AI, SSH, GitHub writes, deployments, or provider access.

## Critical manual flows

| Flow ID | Starting point | Target file | What the reviewer should see |
| --- | --- | --- | --- |
| website-to-desktop | `apps/web/index.html` | `apps/web/desktop.html` | SEIS Desktop OS shell |
| website-to-linux-replica | `apps/web/index.html` | `apps/web/seis-linux-replica.html` | Linux-like supplied-reference demo |
| website-to-code | `apps/web/index.html` | `apps/web/seis-code.html` | SEIS Code IDE demo |
| desktop-to-linux-replica | `apps/web/desktop.html` | `apps/web/seis-linux-replica.html` | Linux-like supplied-reference demo |
| desktop-to-code | `apps/web/desktop.html` | `apps/web/seis-code.html` | SEIS Code IDE demo |
| desktop-to-wow-gallery | `apps/web/desktop.html` | `apps/web/wow-gallery.html` | Cinematic visual showcase |
| public-linux-entry | `apps/web/seis-linux-replica-public-demo.html` | `apps/web/seis-linux-replica.html` | Full Linux-like demo surface |
| cockpit-to-desktop | `apps/web/seis-cockpit.html` | `apps/web/desktop.html` | SEIS Desktop OS shell |

## What the validator proves

- Each starting point exists.
- Each target file exists.
- Each target file has a `<title>`.
- Each target file has a viewport meta tag.
- Each target file is non-empty.
- Each flow ID and target is documented here.
- No unsafe live integration claim is introduced by this contract.

## What the validator does not prove

- It does not launch a browser.
- It does not click inside a rendered page.
- It does not prove every button in every app works.
- It does not run SSH, GitHub, deployment, provider, model, or cloud checks.

## Safety boundary

- No API keys are required.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No AI provider call is performed.
- No branch protection is changed.
- Mock and planned states must remain labeled until verified.

## Validation

Run:

```bash
node scripts/check-critical-demo-click-flow.mjs
```

This check is a lightweight contract guard for the current demo. A future PR can add real browser automation after the static contract is accepted.
