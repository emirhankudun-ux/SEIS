# SEIS Cloud / SSH Center Demo

## Purpose

`apps/seis-core/cloud-ssh-center.html` adds a browser-local Cloud / SSH Center for public-safe cloud readiness planning. It supports the SEIS Cloud, SSH, Codespaces, deployment, backup, provider-health, system-health, and rollback concepts without making a live connection or claiming infrastructure is connected.

## What exists

- A standalone static route under `apps/seis-core/cloud-ssh-center.html`.
- Browser-local readiness composer and evidence log.
- Explicit state labels: connected, mock, disabled, planned, and unknown.
- Local-only profile switching for local demo, Codespaces plan, SSH readiness, and deployment plan.
- A schema-backed Cloud / SSH readiness fixture at
  `content/development/seis-cloud-ssh-center-readiness.json`.
- Focused static tests in `apps/seis-core/test/seis-cloud-ssh-center-static.test.js`.

## Real vs mock vs planned

| Surface | Status | Notes |
| --- | --- | --- |
| Static route and UI interactions | Real | Runs in browser with no dependency install. |
| Evidence log | Real local state | Stored only in `localStorage` as `seis.cloud.ssh.center.v1`. |
| GitHub repository status | Mock | No GitHub token or API call is used. |
| SSH connection | Disabled | `sshExecuted: false`; no remote command exists. |
| Deployment | Planned | `deployExecuted: false`; no deployment mutation exists. |
| Environment variables | Unknown | `credentialRead: false`; no `.env` or shell profile is read. |
| Server / port | Preserved | `serverPortChanged: false`; existing server and connection port must remain unchanged without explicit approval. |

## How to run

```bash
python3 -m http.server 4174 --directory apps/seis-core
```

Open `http://127.0.0.1:4174/cloud-ssh-center.html`.

## Validation

```bash
node --test apps/seis-core/test/seis-cloud-ssh-center-static.test.js
npm run check:seis-cloud-ssh-center-readiness
```

## Security notes

This route contains no API keys, private keys, tokens, cookies, service accounts, SSH commands, cloud provisioning commands, deployment commands, DNS changes, or provider adapters. It is a public-safe readiness surface only.

## Next safe actions

- Link this route from the main SEIS Command Center after review.
- Add rollback-first dry-run tests before any real cloud, SSH, VPN, or deployment workflow is enabled.
