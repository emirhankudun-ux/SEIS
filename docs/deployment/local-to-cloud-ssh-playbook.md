# Local-to-Cloud SSH Migration Playbook

## Scope

This playbook is for replacing local SSH-heavy deployment assumptions with the
cloud-first lanes already modeled in SEIS.

## What to keep local

- `docker-node-static` examples that point to `127.0.0.1` are for local preview.
- Local smoke commands (`127.0.0.1` for web previews) are development-only.

## What to route to cloud

- Public releases: public cloud providers documented in
  [`server-upload-runbook.md`](./server-upload-runbook.md).
- Team/workplace private runtime with WireGuard: `gcp-compute-vm` or
  `ssh-wireguard-vps`.

## Run this audit

```bash
npm run cloud:migration:audit
npm run cloud:migration:audit -- --json
```

Use `--strict` when you want CI-like blocking behavior.

```bash
npm run cloud:migration:audit -- --strict
```

## Migration mapping

| Local pattern | Cloud route |
| --- | --- |
| `docker-node-static --host 127.0.0.1` | Keep as local validation only, then switch to public cloud lane |
| SSH target placeholder in local examples | Replace with approved `USER@HOST` and run `cloud:ssh-vpn` readiness before handoff |
| `generic-sftp` SSH auth example | Prefer team VPN hosts with `cloud:ssh-vpn:*` or GCP VM lane |

## Cloud commands to keep in memory

- `npm run cloud:ssh-vpn:readiness -- --ssh-target USER@HOST`
- `npm run cloud:ssh-vpn:server:plan -- --ssh-target USER@HOST --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'`
- `npm run cloud:gcp:readiness -- --project PROJECT_ID`
- `npm run cloud:gcp:server:plan -- --project PROJECT_ID`

