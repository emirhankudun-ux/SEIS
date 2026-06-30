# Server Target Selection

## Why This Exists

The release is ready, but live upload must not happen until the server path is known. A wrong document root can overwrite or hide an existing site.

## Configure A Target

For local SSH/localhost cleanup guidance, follow
[`local-to-cloud-ssh-playbook.md`](./local-to-cloud-ssh-playbook.md).

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
node scripts/configure-server-target.mjs docker-node-static --host local-preview.seis.internal --port 4177
```

Google Compute Engine VM:

```bash
npm run cloud:gcp:readiness -- --project example-project
npm run cloud:gcp:server:plan -- --project example-project
npm run vpn:wireguard:peer -- --name admin --public-key CLIENT_PUBLIC_KEY --address 10.44.0.2/32
npm run cloud:gcp:server:apply -- --project example-project --ssh-source-range 203.0.113.10/32 --vpn-source-range 198.51.100.0/24 --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'
```

Existing Linux SSH/VPS with WireGuard:

```bash
npm run cloud:ssh-vpn:readiness -- --ssh-target seis@example.com
npm run cloud:ssh-vpn:server:plan -- --ssh-target seis@example.com --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'
npm run cloud:self-hosted:kit -- --ssh-target root@example.com --peer-public-key CLIENT_PUBLIC_KEY
npm run check:deploy-readiness
```

## Cloud Migration Check for This Page

If you touch local SSH or localhost entries on this page, run the migration audit
before marking any target as ready:

```bash
npm run cloud:migration:audit
npm run cloud:migration:audit -- --json
```

Keep `docker-node-static` examples as local preview only. For publish-ready paths,
use a public cloud lane first.

Cloud static candidates are also modeled for Azure Static Web Apps, AWS Amplify
static hosting, and Firebase Hosting. Keep them inactive until the project id,
public URL, token storage location, and rollback owner are explicit.

Public cloud is for everyone. VPN cloud targets are only for workplaces and
teams with explicit peer membership.

Before a public GitHub Pages handoff, run:

```bash
npm run cloud:public:readiness -- --repo OWNER/REPO
```

Confirm that the repository Pages settings use GitHub Actions:

```bash
gh api repos/OWNER/REPO/pages --jq '.build_type'
```

The expected value is `workflow`. After the repo setting is confirmed, rerun the
`Deploy Public Cloud` workflow and keep the Pages artifact gate paired with the
Second Brain Chrome browser smoke in `.github/workflows/pages.yml`.

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
