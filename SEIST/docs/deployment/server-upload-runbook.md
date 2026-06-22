# Server Upload Runbook

## Deployable Package

Build the static package:

```bash
npm run build:static
npm run prepare:server
npm run plan:upload
```

Output:

```text
dist/seis-static.zip
dist/server-upload-manifest.json
deploy/upload-plan.json
releases/latest.json
dist/server-drop/
```

This archive is safe to upload to a static server because it contains a flattened web root with:

- `index.html`
- `src/`
- `public/`
- `assets/styles/seis.tokens.css`
- `manifest.webmanifest`
- `robots.txt`
- `sitemap.xml`
- selected drawing assets
- `content/lab/operating-system.json`
- deployment, strategy, server, and polyglot documentation
- `contracts/polyglot/seis-experience-contract.json`
- `_deploy/server-targets.json`

For manual server handoff, use:

```text
dist/server-drop/
```

It contains the zip, checksum manifest, upload plan, and latest release pointer in one folder.

## Server Options

Use the selected server provider once domain/account details are confirmed.

| Server Type | Action |
| --- | --- |
| Static hosting | Upload `dist/seis-static.zip` and extract at the site root |
| Hostinger | Use static website deploy with the confirmed domain |
| Vercel/Netlify | Point publish directory to `dist/seis-static` |
| GitHub Pages | Publish `dist/seis-static` from a deployment branch |

## Do Not Upload

- raw legacy zip extractions
- `.playwright-mcp`
- `.next`
- `node_modules`
- unreviewed old source dumps

## Current Missing Input

The server/domain name is not present in this workspace. Live deploy should wait until the target domain or hosting account is confirmed.

The current deploy registry keeps `activeTarget` empty on purpose. This means packaging, hashing, local backup, and readiness checks can run now, while live upload remains blocked until the selected server details are configured.

## Hostinger Deployment Gate

When the domain is confirmed, deploy only this archive:

```text
dist/seis-static.zip
```

Do not deploy the whole repository.

## Safe Deploy Guard

Run:

```bash
npm run check:deploy-readiness
npm run server-upload:dry-run
```

If no target is configured in `deploy/server-targets.json`, the command exits safely and reports that live upload is blocked. This prevents accidentally pushing the package to the wrong server path.

## Recovery

If `dist/` is cleaned, restore the last verified package:

```bash
npm run build:static
npm run prepare:server
npm run check:deploy-readiness
```
