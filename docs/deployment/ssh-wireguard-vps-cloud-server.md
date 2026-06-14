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

## Safety

- Keep real hostnames, usernames, and credentials out of Git.
- Use one `/32` WireGuard address per approved workplace/team peer.
- Do not use this provider for everyone-facing public surfaces.
- Do not commit private WireGuard keys or generated client configs.
- Keep GitHub Pages or another public provider as the everyone-facing cloud.
