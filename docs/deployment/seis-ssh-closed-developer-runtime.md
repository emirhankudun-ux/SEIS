# SEIS SSH Closed Developer Runtime

SEIS developer work uses the same visible SSH target as every other cloud SSH
surface:

```text
SEIS-SSH
```

The difference is the runtime policy. Developers can work in an isolated cloud
development system, but sensitive runtime state must stay outside the
open-source repo.

## Contract

Machine-readable contract:

```text
deploy/seis-ssh-closed-runtime-contract.json
```

Validation command:

```bash
npm run check:seis-ssh-closed-runtime
```

## Required Runtime Properties

- `SEIS-SSH` is the only visible SSH alias.
- The SSH target resolves through a cloud transport.
- The remote repo exists at `/workspaces/SEIS`.
- Codex CLI is installed remotely.
- Sensitive work does not depend on a local Mac account.
- Sensitive work does not depend on `127.0.0.1` or `.local` LAN hostnames.
- Direct public VPS access is not the default developer surface.
- Private runtime state is never committed to the repo.

## Private Runtime State

These belong outside the repo:

- SSH private keys
- GitHub tokens
- WireGuard private keys
- certificates
- temporary build credentials
- long-running agent session state
- runtime-only environment variables

If a handoff is needed, write only sanitized status. Do not include secrets.

## Sanitized Handoff Manifest Shape

Allowed fields:

```json
{
  "targetAlias": "SEIS-SSH",
  "runtimeType": "closed-cloud-development-system",
  "remoteRepoPath": "/workspaces/SEIS",
  "remoteCodexVersion": "codex-cli 0.141.0",
  "lastValidatedCommand": "npm run cloud:ssh:online:strict",
  "workMode": "cloud-isolated-workspace",
  "nextActions": [],
  "secretDisclosure": "none"
}
```

Forbidden fields:

- `privateKey`
- `token`
- `password`
- `wireguardPrivateKey`
- `certificate`

## Drift Signals

Treat any of these as drift:

- more than one SEIS SSH target appears in the picker
- `SEIS-SSH` stops resolving through cloud transport
- developer runtime depends on `127.0.0.1`
- developer runtime depends on a `.local` hostname
- company or team work is allowed without VPN controls
- private runtime state appears in repo artifacts
- remote Codex CLI is missing

## Validation

```bash
npm run check:seis-ssh-closed-runtime
npm run check:seis-ssh-cloud-roadmap
npm run check:seis-ssh-access-model
npm run cloud:ssh:online:strict
```
