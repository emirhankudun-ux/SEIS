# SEIS Command Center Demo

## Purpose

`apps/web/seis-command-center.html` is a standalone browser-local Command Center for the SEIS AI-native creative OS demo. It unifies the visible operating surfaces without requiring provider keys, SSH keys, cloud credentials or deployment access.

The page is intentionally runnable as a static file. It is not a live backend, cloud, SSH or AI provider integration.

## What exists

- System health view for demo readiness.
- AI Core status with Local Demo mode and provider registry status.
- GitHub status for PR rescue status, Foundation Check, Publish Readiness and Quality Governance.
- SSH/cloud status with disabled and approval-needed states.
- Active agents with explicit permissions and safe-state labels.
- Recent decisions that document browser-local first, honest integration states and GitHub source-of-truth governance.
- Roadmap progress covering Year 1 through Year 5.
- Quick actions that save state in `localStorage` under `seis.command.center.demo.v1`.
- Demo launch flow with checklist-style local persistence.
- PR rescue status and review-gate reminders.

## State model

The demo uses these states:

- `local-demo`: implemented in the browser and safe to interact with locally.
- `mock`: realistic demo data, not a connected live integration.
- `approval-needed`: real action requires human review or repository approval.
- `planned`: documented future work.
- `blocked`: intentionally unavailable until a gate is cleared.
- `disabled`: disabled because credentials, approvals or live connections are absent.

## What is mock

- Provider registry status for cloud AI providers.
- Search, DevOps and quality governance activity signals.
- GitHub governance summaries inside the page.
- Cloud sync, deployment, backups and remote workspace concepts.

## What is real

- The HTML/CSS/JavaScript application loads without a build step.
- Tabs, filters, launch checklist, drawer, search, quick actions and toasts are interactive.
- Local state persists through the browser `localStorage` key `seis.command.center.demo.v1`.
- The page does not need API keys or private credentials.

## What is planned

- Real provider router through a backend-only credential boundary.
- Real GitHub PR and merge status through a safe server-side API.
- Real SSH Center only after explicit approval, verified host fingerprints and least-privilege users.
- Real deployment status after deployment tooling is approved and validated.
- Deeper connection to SEIS Desktop OS, AI Core, Search, Code IDE, Design Studio, Cloud, Store, Music, Files and Terminal routes after the standalone demos land.

## How to run

Open the file directly in a browser:

```sh
open apps/web/seis-command-center.html
```

No dependency install is required.

## How to validate

Run the focused validator:

```sh
node scripts/check-seis-command-center-demo.mjs
```

Recommended focused checks for this change:

```sh
node --check scripts/check-seis-command-center-demo.mjs
node scripts/check-seis-command-center-demo.mjs
git diff --check -- apps/web/seis-command-center.html docs/product/seis-command-center-demo.md scripts/check-seis-command-center-demo.mjs
```

## Security notes

- No secrets are embedded.
- No API keys are required.
- No private keys are referenced.
- No network calls are made by the demo page.
- No SSH actions are executed.
- No deployment is claimed.
- Browser state is disposable and should not be treated as a backup or source of truth.

## GitHub and merge governance

The page can show auto-merge intent, but repository review gates still decide whether a PR can merge. Required review, CI or branch-protection failures must be reported as blocked or approval-needed, not bypassed in UI copy.

