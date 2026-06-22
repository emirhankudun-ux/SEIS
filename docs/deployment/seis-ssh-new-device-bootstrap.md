# SEIS SSH New Device Bootstrap

This runbook keeps SEIS SSH portable when moving to a new computer or using
ChatGPT and Codex SSH surfaces. The target stays cloud-only:

```text
SEIS-SSH
```

Do not create local Mac, LAN, direct VPS, or VPN-specific picker aliases for the
default SEIS connection.

## What This Solves

- ChatGPT mobile and Codex surfaces should use one online SEIS SSH target.
- A new computer should not depend on the old Mac hostname, `127.0.0.1`, or a
  LAN `.local` address.
- The repo remains open-source while private runtime state stays outside the
  repo.
- Companies and teams can still use VPN controls behind the same `SEIS-SSH`
  entry point.

## Required Prerequisites

1. GitHub CLI is installed.
2. GitHub CLI is authenticated with Codespaces scope.
3. The SEIS repo is available locally only as the installer/control surface.
4. The Codespace exists and has `/workspaces/SEIS`.
5. The remote Codespace has Codex CLI installed.
6. SSH bootstrap for your cloud VM is done before forcing SEIS-SSH direct-cloud mode.

For a direct VM bootstrap (port 22 by default), use the remote helper:

```bash
cd server/cloud/ssh-ai-shell
./remote-bootstrap.sh 21.0.3.171 root 22
```

Refresh Codespaces auth when needed:

```bash
gh auth refresh -h github.com -s codespace
```

## Install The Single SSH Alias

From the SEIS repo:

```bash
npm run cloud:ssh-config:install
```

This writes one managed SSH alias:

```text
Host SEIS-SSH
```

The managed alias uses GitHub Codespaces as the cloud transport. It does not add
local Mac, LAN, direct VPS, or VPN-specific picker entries.

## Picker Compatibility

Terminal SSH can use GitHub Codespaces through `ProxyCommand`. Some UI pickers
may not show that target as online even when terminal SSH works. Diagnose that
case with:

```bash
npm run check:seis-ssh-picker-compatibility
```

If the picker requires generic SSH without `ProxyCommand`, keep the same visible
alias and switch only the transport after the cloud endpoint is reachable:

```bash
npm run check:seis-ssh-picker-compatibility -- --probe-direct-host CLOUD_HOST
npm run cloud:ssh:direct-cloud:switch -- --direct-host CLOUD_HOST --direct-user root --apply
npm run cloud:ssh:direct-cloud:switch -- --public-ip 203.0.113.10 --direct-user root --apply
npm run cloud:ssh:direct-cloud:switch -- --provider digitalocean --project seis-prod --public-ip 203.0.113.10 --apply
npm run cloud:ssh:online:strict -- --require-picker-compatible
```
You can also use a single activation command after provisioning:

```bash
npm run cloud:ssh:direct-cloud:activate -- --public-ip 203.0.113.10 --direct-user root
npm run cloud:ssh:direct-cloud:activate -- --direct-host CLOUD_HOST --direct-user root
npm run cloud:ssh:direct-cloud:activate -- --provider digitalocean --project seis-prod --public-ip 203.0.113.10 --direct-user root
```


Do not create extra aliases to work around picker status. `SEIS-SSH` remains the
single visible SEIS SSH target.

## Verify Online Readiness

```bash
npm run cloud:ssh:ensure-online
npm run cloud:ssh:online:strict
```

The command must prove:

- `SEIS-SSH` is cloud-only
- the remote is online
- `/workspaces/SEIS` exists
- Codex CLI is available remotely

Do not call the target ready if any of those checks fail.

## ChatGPT And Codex SSH Surfaces

In the SSH picker, select:

```text
SEIS-SSH
```

Ignore or remove stale entries such as:

- `SEIS-CLOUD`
- `seis-cloud-root`
- `seis-cloud-vpn`
- `seis-local-mac`
- `seis-lan-mac`

If old entries still appear, refresh the picker or restart the client after
running:

```bash
npm run cloud:ssh-config:install
npm run cloud:ssh:online:strict
```

## Security Rules

- Do not commit private SSH keys.
- Do not commit GitHub tokens.
- Do not commit WireGuard private keys.
- Do not paste credentials into generated reports.
- Do not add a local fallback alias just to make the picker look online.

## Audience Routing

Individual users:

- use `SEIS-SSH`
- use normal cloud SSH
- do not require VPN

Companies and teams:

- use `SEIS-SSH`
- require WireGuard or equivalent peer-authenticated VPN controls
- keep team routes private and cloud-only

Developers:

- use `SEIS-SSH`
- use a closed cloud development system for sensitive or long-running work
- keep private runtime state outside the open-source repo
- use only sanitized handoff status when a long-running cloud session must be resumed

Closed developer runtime contract:

```text
deploy/seis-ssh-closed-runtime-contract.json
docs/deployment/seis-ssh-closed-developer-runtime.md
```

## Validation

```bash
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-access-model
npm run check:seis-ssh-picker-compatibility
npm run cloud:ssh:online:strict
```
