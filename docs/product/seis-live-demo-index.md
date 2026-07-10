# SEIS Live Demo Index

`apps/web/seis-live-demo-index.html` is a browser-local index for the current SEIS live demo.

## Purpose

The page gives reviewers one stable local entry point so the demo does not depend on memory of scattered files. It links only existing real browser artifacts and keeps mock or planned modules labeled.

## Real local artifacts linked

- `apps/web/index.html`
- `apps/web/desktop.html`
- `apps/web/seis-linux-replica.html`
- `apps/web/seis-code.html`
- `apps/web/wow-gallery.html`

## Demo flow tracked

The page lists the required 15-beat SEIS presentation flow from opening landing page through final ecosystem showcase.

## Safety boundary

The page does not execute SSH, call GitHub, deploy, call AI providers, request credentials, store secrets, or weaken branch protection.

## Validation

Run:

```bash
node scripts/check-live-demo-index.mjs
```

The validator checks that the live demo index exists, all real route links point to existing `apps/web` files, the 15 required demo beats are present, real/mock/planned states are visible, and the no-mutation safety boundary is documented.
