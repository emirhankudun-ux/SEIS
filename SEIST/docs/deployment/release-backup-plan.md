# Release Backup Plan

## Goal

Keep every deployable SEIS package recoverable even before a live server target is confirmed.

## Commands

```bash
npm run build:static
npm run prepare:server
npm run plan:upload
npm run check:deploy-readiness
```

The backup command writes:

```text
releases/<timestamp>/seis-static.zip
releases/<timestamp>/server-upload-manifest.json
releases/latest.json
deploy/upload-plan.json
```

## Server Rule

Only upload a package whose SHA-256 matches `server-upload-manifest.json`.

## Restore Rule

If the active `dist/` package is deleted or overwritten, run:

```bash
npm run build:static
npm run prepare:server
```

Then verify the restored checksum before any upload:

```bash
npm run check:deploy-readiness
```
