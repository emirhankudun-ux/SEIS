# SEIS Demo Readiness Evidence Bundle

This evidence bundle records the minimum current-state artifacts that should exist before SEIS is presented as a browser-local AI-native creative operating system demo.

It is a focused readiness guard. It does not replace full build, browser automation, accessibility review, security review, or human product review.

## Real browser demo artifacts

| Artifact | File | Evidence role |
| --- | --- | --- |
| Website | `apps/web/index.html` | public landing and product story |
| Desktop OS | `apps/web/desktop.html` | browser desktop OS shell |
| Linux Replica | `apps/web/seis-linux-replica.html` | Linux-like supplied-reference demo surface |
| Public Linux Replica | `apps/web/seis-linux-replica-public-demo.html` | public entry for the Linux replica |
| SEIS Code | `apps/web/seis-code.html` | browser IDE demo surface |
| WOW Gallery | `apps/web/wow-gallery.html` | cinematic visual showcase |
| SEIS Cockpit | `apps/web/seis-cockpit.html` | cockpit/control-room demo surface |

## Core governance and product docs

| Artifact | File | Evidence role |
| --- | --- | --- |
| README | `README.md` | product overview and run context |
| AGENTS | `AGENTS.md` | AI-agent operating rules |
| Security Policy | `SECURITY.md` | repository security boundary |
| Status | `docs/STATUS.md` | current project status |
| Demo Status | `docs/product/seis-demo-status.md` | real/mock/planned demo status |
| Desktop OS Notes | `docs/product/seis-desktop-os.md` | desktop product surface documentation |

## Readiness states

- `real`: a local artifact exists and is checked by the bundle validator.
- `mock`: a demo-safe concept or UI may exist, but no external live mutation is claimed.
- `planned`: a required ecosystem capability remains future implementation work.

## Safety boundary

- No API keys are required.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No AI provider call is performed.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.
- Mock and planned states must remain labeled until verified.

## What the validator proves

- Every listed browser demo artifact exists.
- Every listed browser demo artifact is non-empty.
- Every listed browser demo artifact has a `<title>`.
- Every listed browser demo artifact has a viewport meta tag.
- Every listed governance/product document exists and is non-empty.
- The evidence bundle records real/mock/planned state semantics.
- The safety boundary is explicitly documented.

## What the validator does not prove

- It does not run a full build.
- It does not launch a browser.
- It does not click rendered UI controls.
- It does not verify every module is fully implemented.
- It does not perform live GitHub, SSH, deployment, cloud, model, provider, or credential checks.

## Validation

Run:

```bash
node scripts/check-demo-readiness-bundle.mjs
```

Use this as a low-cost guard before broader demo readiness checks.
