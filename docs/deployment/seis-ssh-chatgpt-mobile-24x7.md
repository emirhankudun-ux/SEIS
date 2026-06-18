# SEIS SSH for ChatGPT Mobile 24/7

This runbook defines the production-ready target for using SEIS SSH from
ChatGPT mobile and Codex without depending on a local Mac being online.

## Target state

`SEIS-SSH` stays the single stable SSH alias.

The alias is mobile 24/7 ready only when all of these are true:

1. `SEIS-SSH` resolves to a direct always-on cloud host, not a Codespaces
   `ProxyCommand`.
2. The cloud host exposes SSH on port `22` or a documented production SSH port.
3. The configured public key is accepted by the cloud host.
4. `/opt/ssh-ai` is installed on the host.
5. `ssh-ai.service` is active.
6. The SEIS repo and Codex runtime are available remotely.

Codespaces can be useful for development and can pass the basic online check,
but it is not the 24/7 mobile target because it can sleep and requires a
GitHub CLI `ProxyCommand`.

## Readiness commands

Use the normal online check when you only need to know whether the current alias
can open a remote terminal:

```bash
npm run cloud:ssh:online
```

Use the mobile 24/7 check when the result must be safe for ChatGPT mobile,
new devices, and long-lived Codex sessions:

```bash
npm run cloud:ssh:mobile-24x7
```

Use the strict variant in release, bootstrap, and CI handoff flows:

```bash
npm run cloud:ssh:mobile-24x7:strict
```

The strict check exits non-zero until the alias is direct-cloud, SSH key auth
works, and the remote runtime is active.

## Direct-cloud setup flow

1. Provision or select an always-on VM.
2. Confirm the public IP and SSH port are reachable from the internet.
3. Install the local SEIS public key into the remote user's
   `~/.ssh/authorized_keys`.
4. Install the SSH-AI runtime:

```bash
cd server/cloud/ssh-ai-shell
./remote-bootstrap.sh <PUBLIC_IP> root 22 ~/.ssh/id_ed25519_seis_codex ~/.ssh/id_ed25519_seis_codex.pub --apply-seis-ssh-alias
```

5. Switch the single alias to direct-cloud after the endpoint authenticates:

```bash
npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user root --apply
```

6. Require the mobile gate to pass:

```bash
npm run cloud:ssh:mobile-24x7:strict
```

## Current known blocker pattern

If the checker reports `mobile-24x7-requires-direct-cloud-transport`, the alias
is still Codespaces-backed. That can be online, but it is not the 24/7 mobile
target.

If the checker reports `direct-cloud-endpoint-unreachable`, fix the cloud
firewall, security group, public IP routing, or `sshd` listener before applying
the direct-cloud alias.

If the checker reports `direct-cloud-ssh-auth-unavailable`, install the public
key on the remote host or fix the remote user before applying the alias.

## Safety rules

- Do not commit private keys, API keys, tokens, or generated credentials.
- Keep private keys in `~/.ssh` or another ignored secret store.
- Keep `.gitignore` protecting key material.
- Do not call `SEIS-SSH` mobile-ready unless
  `npm run cloud:ssh:mobile-24x7:strict` passes.

## Local handoff report

Generate a local, ignored JSON and Markdown handoff report when debugging mobile
readiness from a laptop, Codex session, or ChatGPT desktop session:

```bash
npm run cloud:ssh:mobile-24x7:report
```

Default outputs:

- `reports/seis-ssh-mobile-24x7-readiness.json`
- `reports/seis-ssh-mobile-24x7-readiness.md`

These files are intentionally git-ignored because they describe the current
operator machine and SSH alias state. The report redacts the home directory and
blocks API-key/private-key patterns before writing the artifact.
