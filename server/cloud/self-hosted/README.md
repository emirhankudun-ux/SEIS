# SEIS Self-Hosted Cloud

The SEIS self-hosted cloud kit turns an approved Linux host into a private
team/workplace cloud workspace using the existing SSH + WireGuard installer.
It is the operator-owned path for creating SEIS Cloud when a managed provider
or existing VPS lane is not ready.

## Generate The Kit

```bash
npm run cloud:self-hosted:kit -- \
  --ssh-target root@HOST \
  --peer-public-key CLIENT_PUBLIC_KEY
```

The command writes generated handoff files under
`dist/seis-cloud-self-hosted-kit`:

- `install-seis-cloud-host.sh`
- `apply-seis-cloud.sh`
- `readiness.sh`
- `ssh-config.seis-cloud`
- `SEIS-CLOUD-HANDOFF.md`

## Portable SSH Config

Use the remote-only SSH config installer on this Mac and on any future computer:

```bash
npm run cloud:ssh-config:install
```

This maps the single `SEIS-SSH` alias to the GitHub Codespace cloud transport.
It does not expose local Mac, LAN, VPN, or direct VPS aliases in the ChatGPT/Codex
SSH picker:

```bash
npm run cloud:ssh-config:install -- \
  --codespace seis-cloud-primary-q75g47p769j6hxrv
```

The installer writes one portable remote alias:

- `SEIS-SSH`

It intentionally does not write local Mac aliases such as `127.0.0.1` or
`.local` hostnames.

## Access Model

The long-term SSH model is defined in `deploy/seis-ssh-access-model.json` and
documented in `docs/deployment/seis-ssh-access-model.md`.

- Individual users use normal cloud SSH through `SEIS-SSH` without VPN.
- Companies and teams require a WireGuard or equivalent peer-authenticated VPN.
- Developers use a closed cloud development system for sensitive and long-running
  work.

## What The Host Becomes

- A non-root `seis` operator account.
- Key-only SSH with password login disabled.
- WireGuard `wg0` for approved workplace/team peers.
- Codex remote host tooling.
- Release handoff roots at `/opt/seis/releases` and `/opt/seis/current`.

## Apply

Run the generated `apply-seis-cloud.sh` only after TCP/22 is reachable from the
operator network and UDP/51820 is scoped to approved peers.

## Validate

```bash
npm run cloud:ssh:online:strict
npm run check:seis-ssh-access-model
npm run check:ssh-vpn-cloud-server
```

The kit must not contain SSH private keys, WireGuard private keys, provider
tokens, certificates, or `.env` values.
