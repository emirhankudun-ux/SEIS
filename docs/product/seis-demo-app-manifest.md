# SEIS Demo App Manifest

The SEIS demo app manifest defines every major app required for the working AI-native creative operating system demo.

## Artifacts

- Manifest: `apps/web/seis-demo-app-manifest.json`
- Launcher: `apps/web/seis-demo-app-launcher.html`
- Validator: `scripts/check-demo-app-manifest.mjs`

## Why this exists

SEIS needs a durable product map so the demo does not restart from scratch when machines or branches change. The manifest makes the demo app inventory explicit, state-labeled, and machine-checkable.

## Required app coverage

- Command Center
- SEIS Desktop OS
- SEIS AI Core
- SEIS Search
- SEIS Code IDE
- SEIS Design Studio
- SEIS Cloud / SSH Center
- SEIS Store
- SEIS Music
- SEIS Launchpad
- SEIS Files
- SEIS Terminal / SSH
- SEIS Website
- SEIS Agents
- SEIS Plugins

Additional real showcase routes may be included when they help demonstrate the product, such as the Linux Replica and WOW Gallery.

## State labels

- `real`: a browser artifact exists and can be opened from the launcher.
- `mock`: a demo-safe surface or route concept exists, but no live external mutation is claimed.
- `planned`: required product scope exists in the roadmap, but live functionality is not implemented yet.

## Safety boundary

The app launcher and manifest do not execute SSH, call GitHub, deploy, call cloud AI providers, request credentials, store secrets, or weaken branch protection.

## Validation

Run:

```bash
node scripts/check-demo-app-manifest.mjs
```

The validator checks required app coverage, valid state labels, no-key demo boundaries, existing route files for `real` entries, and launcher markers.
