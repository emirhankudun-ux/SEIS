# Server Target Selection

## Why This Exists

The release is ready, but live upload must not happen until the server path is known. A wrong document root can overwrite or hide an existing site.

## Configure A Target

Hostinger/static:

```bash
node scripts/configure-server-target.mjs hostinger-static --domain example.com
```

Apache/shared hosting:

```bash
node scripts/configure-server-target.mjs apache-shared-hosting --domain example.com --document_root public_html
```

Docker/Node:

```bash
node scripts/configure-server-target.mjs docker-node-static --host 127.0.0.1 --port 4177
```

Cloud static candidates are also modeled for Azure Static Web Apps, AWS Amplify
static hosting, and Firebase Hosting. Keep them inactive until the project id,
public URL, token storage location, and rollback owner are explicit.

Then run:

```bash
npm run check:deploy-readiness
npm run server-upload:dry-run
```

## Current Safe State

If `activeTarget` is `null`, upload stays blocked but the release package and backup remain preserved.

`npm run server-upload:dry-run` now returns a machine-readable `blockedBy` list with the exact confirmation questions that still block live upload. It also returns `candidateRequirements` so automation can show the required input keys for each target without opening the JSON file.

## Confirmation Flow

Before setting `activeTarget`, answer the confirmation questions in `deploy/server-targets.json`:

- hosting provider or server
- public domain or preview URL
- exact document root or deploy path
- rollback owner

The safe default is to keep `activeTarget` as `null` until all required questions are answered.

## Local Secrets Rule

Use `deploy/server-targets.local.example.json` as a shape reference only. Keep real hostnames, private paths, and credentials out of Git unless they are public deployment metadata.
