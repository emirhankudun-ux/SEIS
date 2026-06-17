# Server Drop Handoff

## Purpose

`dist/server-drop/` is the small handoff folder for preserving UI-UX Digital Lab outside the working tree. It gathers the static archive, checksum manifest, upload plan, and latest release pointer in one place.

## Create The Drop

```bash
npm run build:static
npm run prepare:server
npm run plan:upload
```

The command creates:

```text
dist/server-drop/
  README.md
  seis-static.zip
  server-upload-manifest.json
  upload-plan.json
  release-latest.json
```

## Upload Rule

Upload only `seis-static.zip` after the target domain, host, and path are confirmed. Use the SHA-256 in `server-upload-manifest.json` to verify the package before extracting it on the server.

## Safe State

If `upload-plan.json` says `blocked_until_target_confirmed`, the drop is preserved but live upload is still intentionally blocked.
