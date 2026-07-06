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

Release artifact retention is governed by
[`release-artifact-retention-policy.md`](./release-artifact-retention-policy.md).
Do not delete, move, or replace retained release zips without explicit
maintainer approval.

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

If local SSH/local-preview remnants appear during setup, follow
[`local-to-cloud-ssh-playbook.md`](./local-to-cloud-ssh-playbook.md) first.

Use the selected server provider once domain/account details are confirmed.

| Server Type | Action |
| --- | --- |
| Static hosting | Upload `dist/seis-static.zip` and extract at the site root |
| Hostinger | Use static website deploy with the confirmed domain |
| Vercel/Netlify | Point publish directory to `dist/seis-static` |
| GitHub Pages | Publish `dist/seis-static` from a deployment branch |
| Google Compute Engine VM | Provision `gcp-compute-vm`, connect over WireGuard/SSH, then upload only the prepared release artifact |
| Existing SSH/VPS WireGuard host | Verify `ssh-wireguard-vps`, connect over WireGuard/SSH, then upload only the prepared release artifact |

Use public cloud targets for everyone-facing releases. Use WireGuard-backed VM
targets only for workplace and team operations.

Before deciding on a live upload target, run:

```bash
npm run cloud:migration:audit
npm run cloud:migration:audit -- --strict
```

This keeps local preview entries visible as local-only and confirms no local
SSH-like assumptions are accidentally treated as publishable targets.

For GitHub Pages public cloud, run `npm run cloud:public:readiness -- --repo
OWNER/REPO` before handoff. For GCP team VPN cloud, run `npm run
cloud:gcp:readiness -- --project PROJECT_ID` before any apply command. For an
existing SSH/VPS team VPN cloud host, run `npm run cloud:ssh-vpn:readiness --
--ssh-target USER@HOST` before handoff.

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
