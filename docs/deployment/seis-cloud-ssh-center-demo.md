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
- A PR-boundary gate, `npm run check:seis-cloud-ssh-center-pr-boundary`,
  that proves this Cloud SSH Center PR does not touch generated source bundles,
  workflow bypasses, reports, builds, or secret-bearing generated history files.
- A public-safe `ownerInputChecklist` for the direct-cloud fields required before
  any 24/7 claim.
- A `mobile24x7AcceptanceLadder` linked to
  `content/development/seis-ssh-mobile-direct-cloud-acceptance-ledger.json`.
- Explicit Mac-off continuity metadata: Codespaces may be online but can sleep,
  while true 24/7 mode requires direct-cloud proof.
- Focused static tests in `apps/seis-core/test/seis-cloud-ssh-center-static.test.js`.

## Real vs mock vs planned

| Surface | Status | Notes |
| --- | --- | --- |
| Static route and UI interactions | Real | Runs in browser with no dependency install. |
| Evidence log | Real local state | Stored only in `localStorage` as `seis.cloud.ssh.center.v1`. |
| GitHub repository status | Mock | No GitHub token or API call is used. |
| Mac-independent remote runtime | Planned | SEIS should continue without the local Mac once an approved cloud runtime is active. |
| Always-on direct cloud | Planned | The current known blocker remains `mobile-24x7-requires-direct-cloud-transport`. |
| SSH connection | Disabled | `sshExecuted: false`; no remote command exists. |
| Deployment | Planned | `deployExecuted: false`; no deployment mutation exists. |
| Environment variables | Unknown | `credentialRead: false`; no `.env` or shell profile is read. |
| Server / port | Preserved | `serverPortChanged: false`; existing server and connection port must remain unchanged without explicit approval. |

## Computer off / always-on boundary

The target is that SEIS remains reachable whether the local Mac is open or closed. The current safe split is:

- `npm run cloud:ssh:online:strict` proves that the configured `SEIS-SSH` alias is reachable now.
- `npm run cloud:ssh:mobile-24x7:strict` is the stricter gate for ChatGPT mobile / always-on use.
- Codespaces can support Mac-independent remote work while the Codespace is awake, but it can sleep and is not treated as true 24/7 direct cloud.
- True always-on mode requires direct-cloud SSH transport, TCP reachability, SSH auth, remote runtime checks, `ssh-ai`, the SEIS repo, and remote Codex evidence.
- Until that stricter gate passes, the public-safe state remains planned, not ready.

## Direct-cloud owner packet

The `ownerInputChecklist` stores field names only. It does not store live host
values, private key material, provider credentials, or console access. Real
values stay local and outside Git.

Required before a 24/7 claim:

- `SEIS_SSH_HOST` or `SEIS_CLOUD_HOST`: approved always-on VM endpoint.
- `SEIS_SSH_PORT`: SSH TCP port, defaulting to `22` unless explicitly approved.
- `SEIS_SSH_USER`: least-privilege runtime user, defaulting to `aiuser`.
- `SEIS_SSH_IDENTITY_FILE`: local identity-file path only; key material is never committed.
- `SEIS_REMOTE_REPO_DIR`: remote SEIS repository directory, defaulting to `/opt/seis/SEIS`.
- `scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh`: reviewed bootstrap runbook.
- `provider console / owner approval`: rollback owner and provider-console access.

## 24/7 acceptance ladder

The Cloud / SSH Center mirrors the mobile direct-cloud acceptance ledger. The
visible ladder keeps each evidence step separate from the final ready claim, and
`npm run check:seis-cloud-ssh-center-readiness` cross-validates the ladder
against the ledger:

- `npm run cloud:ssh:mobile-direct:profile`: configuration-only profile inputs.
- `npm run cloud:ssh:mobile-direct:bootstrap:plan`: public-key-only bootstrap dry run.
- `npm run cloud:ssh:mobile-direct:bootstrap:apply`: reviewed remote VM bootstrap.
- `npm run cloud:ssh:mobile-direct:config:plan`: managed `SEIS-SSH` block preview.
- `npm run cloud:ssh:mobile-direct:config:install`: local managed alias install.
- `npm run cloud:ssh:mobile-direct:probe:strict`: direct-cloud transport, TCP, SSH auth, and remote runtime evidence.
- `npm run cloud:ssh:mobile-direct:doctor:strict`: final mobile 24/7 handoff report.
- `npm run check:seis-ssh-mobile-direct-cloud`: repo-side contract guard.

Only the strict doctor can support the `mobile-24x7-ready` claim. Earlier green
steps are useful evidence, not the final ready state.

## Secret scan boundary

The GitHub `Secret & Vulnerability Scan` is a full-history gate and may report
legacy generated bundle findings that are outside this route's current diff.
Do not bypass that gate from this demo route.

Use the PR-boundary gate to prove the current Cloud SSH Center change stays
scoped:

```bash
npm run check:seis-cloud-ssh-center-pr-boundary
```

That check verifies:

- the diff stays inside the expected Cloud SSH Center files;
- `.github/workflows/`, `sources/`, `reports/`, `dist/`, `build/`, and
  `node_modules/` are not changed by this PR;
- `sources/github-unified-source/_generated/github-code-bundle.txt` is absent
  from `HEAD`;
- changed files do not contain private-key, GitHub token, OpenAI key, or inline
  credential-assignment patterns.

It is not a replacement for the full-history secret scan. If the full-history
gate fails, resolve or explicitly approve the historical secret-cleanup path
separately.

## How to run

```bash
python3 -m http.server 4174 --directory apps/seis-core
```

Open `http://127.0.0.1:4174/cloud-ssh-center.html`.

## Validation

```bash
node --test apps/seis-core/test/seis-cloud-ssh-center-static.test.js
npm run check:seis-cloud-ssh-center-readiness
npm run check:seis-cloud-ssh-center-pr-boundary
npm run cloud:ssh:online:strict
npm run cloud:ssh:mobile-24x7:strict
```

## Security notes

This route contains no API keys, private keys, tokens, cookies, service accounts, SSH commands, cloud provisioning commands, deployment commands, DNS changes, or provider adapters. It is a public-safe readiness surface only.

## Next safe actions

- Link this route from the main SEIS Command Center after review.
- Add rollback-first dry-run tests before any real cloud, SSH, VPN, or deployment workflow is enabled.
