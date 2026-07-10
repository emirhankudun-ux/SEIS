# SEIS Files Demo

`apps/web/seis-files.html` is a standalone browser-local SEIS Files demo.

## Purpose

SEIS Files is part of the required SEIS creative operating system ecosystem. This page turns Files from planned scope into a real local artifact without touching the user's real filesystem.

## Working interactions

- Search virtual files and folders.
- Switch between grid and list views.
- Filter by virtual location.
- Open files and folders into a preview panel.
- Track recent virtual files.
- Create virtual files.
- Create virtual folders.
- Rename selected virtual item.
- Delete selected virtual item in safe mode.
- Reset the virtual collection.
- Persist virtual state in `localStorage` only.

## Seed collection

- Desktop OS
- AI Core Notes.md
- SEIS Code Workspace
- Design Tokens.json
- Music Session.playlist
- Store Catalog.local
- Cloud SSH Boundary.md
- Demo Readiness

## State semantics

- `real`: standalone page, virtual file tree, search, view switching, preview, recent list, local create, local rename, local delete-safe-mode, and local persistence.
- `safe`: all mutation stays in the browser's virtual collection.
- `planned`: real filesystem providers, cloud sync, permissions, conflict resolution, upload/download, and indexed repository awareness remain future work.

## Safety boundary

- No API keys are required.
- No real filesystem read is performed.
- No real filesystem write is performed.
- No real filesystem rename is performed.
- No real filesystem delete is performed.
- No upload or sync is performed.
- No SSH is executed.
- No GitHub mutation is performed.
- No deployment is triggered.
- No AI provider call is performed.
- No branch protection is changed.
- No private keys, tokens, passwords, cookies, service accounts, or `.env` values are read or stored.

## Validation

Run:

```bash
node scripts/check-seis-files-demo.mjs
```

The validator checks the page, virtual file controls, seed collection, localStorage boundary, safe-mode wording, and filesystem safety claims.
