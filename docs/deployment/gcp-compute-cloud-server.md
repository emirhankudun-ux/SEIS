# GCP Compute Cloud Server

SEIS can use a small Google Compute Engine VM as a team/workplace cloud host for
Codex remote work. The VM also runs WireGuard so approved workplace or team
peers can join the cloud private network and work through the same host.

Public cloud remains the surface for everyone. This VM lane is not an
everyone-facing cloud surface.

## Contract

- Provider id: `gcp-compute-vm`
- Provisioner: `scripts/provision-gcp-cloud-server.mjs`
- Readiness: `scripts/check-gcp-cloud-readiness.mjs`
- Startup script: `server/cloud/gcp/startup-seis-cloud.sh`
- Check: `npm run check:gcp-cloud-server`
- Default SSH user: `seis`
- Default public bootstrap alias after creation: `seis-gcp-cloud`
- Default VPN alias after creation: `seis-gcp-cloud-vpn`
- Default VPN address: `10.44.0.1`
- Default VPN port: `51820/udp`

## Readiness

Readiness is read-only and creates no cloud resources:

```bash
npm run cloud:gcp:readiness -- --project PROJECT_ID
```

The readiness report checks the active `gcloud` account, billing state, Compute
Engine API, VM presence, scoped SSH firewall rule, and scoped WireGuard firewall
rule. It returns `status: "blocked"` until the real cloud host exists and the
network rules are narrow enough for workplace/team access.

Use strict mode only when a pipeline or release handoff must fail if the team
VPN cloud host is not already ready:

```bash
npm run cloud:gcp:readiness:strict -- --project PROJECT_ID
```

## Plan

Planning is read-only and creates no cloud resources:

```bash
npm run cloud:gcp:server:plan -- --project PROJECT_ID
```

The plan prints the exact `gcloud` commands that would enable Compute Engine,
create the scoped SSH firewall rule, create the WireGuard firewall rule, and
create the VM.

## Peer Intake

Each approved teammate generates their own WireGuard private key on their device
and shares only the public key. Create the metadata peer string locally:

```bash
npm run vpn:wireguard:peer -- \
  --name teammate-name \
  --public-key CLIENT_PUBLIC_KEY \
  --address 10.44.0.2/32
```

The helper prints a `metadataPeer` value that can be passed to the VM
provisioner with `--vpn-peer`. The generated client config is a template and
uses `CLIENT_PRIVATE_KEY` as a placeholder so private keys never enter Git.

## Apply

Applying can create billable Google Cloud resources. Use a narrow SSH source
range, usually your current public IP with `/32`:

```bash
npm run cloud:gcp:server:apply -- \
  --project PROJECT_ID \
  --zone us-central1-a \
  --instance seis-cloud-dev \
  --ssh-source-range YOUR_PUBLIC_IP/32 \
  --vpn-source-range WORKPLACE_OR_TEAM_PUBLIC_CIDR \
  --vpn-peer 'teammate-name|CLIENT_PUBLIC_KEY|10.44.0.2/32'
```

The provisioner refuses to apply without `ssh_source_range` /
`--ssh-source-range`. When WireGuard is enabled, it also refuses to apply
without `vpn_source_range` / `--vpn-source-range`.

## What The VM Installs

The startup script installs a minimal SSH/Codex host surface:

- `openssh-server`
- `git`
- `curl`
- `rsync`
- `wireguard`
- standalone Codex CLI
- `/opt/seis` release root
- `/opt/seis/vpn/wireguard-server-public.key`
- key-only SSH with password and root SSH login disabled

## Connect

After apply succeeds, add the printed block to `~/.ssh/config`:

```sshconfig
Host seis-gcp-cloud
  HostName EXTERNAL_IP
  User seis
  IdentityFile ~/.ssh/id_ed25519_seis_codex
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3

Host seis-gcp-cloud-vpn
  HostName 10.44.0.1
  User seis
  IdentityFile ~/.ssh/id_ed25519_seis_codex
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

Then verify:

```bash
ssh -o BatchMode=yes seis-gcp-cloud 'command -v codex && codex --version'
ssh -o BatchMode=yes seis-gcp-cloud 'sudo cat /opt/seis/vpn/wireguard-server-public.key'
ssh -o BatchMode=yes seis-gcp-cloud-vpn 'hostname && command -v codex'
ssh seis-gcp-cloud 'codex login --device-auth'
ssh seis-gcp-cloud 'codex remote-control start --json'
```

## Safety

- Do not use `0.0.0.0/0` for SSH.
- Do not use `0.0.0.0/0` or `::/0` for WireGuard source ranges.
- Treat WireGuard peers as workplace/team members, not public users.
- Do not commit private keys, tokens, `.env` files, or generated credentials.
- Keep the VM stopped or deleted when it is not needed.
- Keep `deploy/server-targets.json` blocked until project, zone, instance,
  `ssh_source_range`, `vpn_source_range`, VPN admin peer, origin, path, and
  rollback owner are explicit.
