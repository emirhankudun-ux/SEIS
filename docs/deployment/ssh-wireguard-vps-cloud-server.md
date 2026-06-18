# SSH WireGuard VPS Cloud Server

SEIS can use an existing Linux cloud or VPS host as a team/workplace cloud
server when a provider-specific VM lane is blocked. This path is for SSH hosts
that already exist outside the repo and can be reached with key-based SSH.

Public cloud remains the surface for everyone. This lane is only for workplace
and team operations through approved WireGuard peers.

## Contract

- Provider id: `ssh-wireguard-vps`
- Readiness: `scripts/check-ssh-wireguard-cloud-readiness.mjs`
- Plan: `scripts/provision-ssh-wireguard-cloud-server.mjs`
- Installer: `server/cloud/ssh-wireguard/install-seis-cloud-host.sh`
- Check: `npm run check:ssh-vpn-cloud-server`
- Default VPN address: `10.44.0.1`
- Default VPN port: `51820/udp`

## Readiness

Readiness is read-only and creates no cloud resources:

```bash
npm run cloud:ssh-vpn:readiness -- --ssh-target seis@example.com
```

Strict readiness fails unless the selected host is reachable over SSH and has
Codex, WireGuard, an active `wg-quick@wg0` interface, and
`/opt/seis/vpn/wireguard-server-public.key`:

```bash
npm run cloud:ssh-vpn:readiness:strict -- --ssh-target seis@example.com
```

## Full SSH Cloud Coverage

This lane is intended to be a complete workplace/team SSH cloud host, not just a
login endpoint. Readiness checks for:

- Codex remote availability through `codex`.
- Release handoff roots at `/opt/seis/releases` and `/opt/seis/current`.
- Source and upload tooling through `git`, `curl`, `rsync`, `sudo`, and `unzip`.
- WireGuard server state through `wg`, `wg-quick@wg0`, and
  `/opt/seis/vpn/wireguard-server-public.key`.
- Key-only SSH hardening through the installer contract.

## Connect and verify

After SSH proof-of-concept and WireGuard peer approval, add this block to
`~/.ssh/config` with your approved host and key:

```sshconfig
Host seis-cloud-vps
  HostName TEAM_VPN_HOST
  User seis
  IdentityFile ~/.ssh/id_ed25519_seis_codex
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3

Host seis-cloud-vpn
  HostName 10.44.0.1
  User seis
  IdentityFile ~/.ssh/id_ed25519_seis_codex
  IdentitiesOnly yes
  ServerAliveInterval 30
  ServerAliveCountMax 3
```

Replace `TEAM_VPN_HOST` with the approved SSH host and `User` if your SSH
service account differs.

Then verify the SSH + WireGuard + Codex preflight checks:

```bash
ssh -o BatchMode=yes seis-cloud-vps 'command -v codex && codex --version'
ssh -o BatchMode=yes seis-cloud-vps 'sudo cat /opt/seis/vpn/wireguard-server-public.key'
ssh -o BatchMode=yes seis-cloud-vpn 'hostname && command -v codex'
```

After connectivity and checks pass, set the deploy target:

```bash
node scripts/configure-server-target.mjs \
  ssh-wireguard-vps \
  --ssh_target seis-cloud-vps \
  --ssh_user seis \
  --vpn wireguard \
  --vpn_admin_peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32' \
  --origin ssh://seis-cloud-vpn \
  --path /opt/seis \
  --rollback_contact repository-maintainer
```

Then run:

```bash
npm run check:deploy-readiness
```

## Plan

Planning prints the commands to review before touching the host:

```bash
npm run cloud:ssh-vpn:server:plan -- \
  --ssh-target seis@example.com \
  --vpn-peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32'
```

The plan is intentionally not a live apply command. Run the generated SSH
commands only after host ownership, rollback owner, maintenance window, and the
approved WireGuard peer are confirmed.

## Self-Hosted SEIS Cloud Kit

When SEIS owns the cloud host setup end to end, generate a local operator kit
instead of writing one-off SSH commands:

```bash
npm run cloud:self-hosted:kit -- \
  --ssh-target root@example.com \
  --peer-public-key CLIENT_PUBLIC_KEY
```

The kit writes `dist/seis-cloud-self-hosted-kit` with the installer, an apply
script, an SSH config snippet, a readiness script, and a handoff note. It does
not generate or store SSH private keys, WireGuard private keys, provider tokens,
or certificates.

After the host is reachable, run the generated apply script, append the reviewed
SSH config snippet to `~/.ssh/config`, then validate:

```bash
npm run cloud:ssh-vpn:readiness:strict -- --ssh-target seis-cloud-vps
```

## Safety

- Keep real hostnames, usernames, and credentials out of Git.
- Use one `/32` WireGuard address per approved workplace/team peer.
- Do not use this provider for everyone-facing public surfaces.
- Do not commit private WireGuard keys or generated client configs.
- Keep GitHub Pages or another public provider as the everyone-facing cloud.
