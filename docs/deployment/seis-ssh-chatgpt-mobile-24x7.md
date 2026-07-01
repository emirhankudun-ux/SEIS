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

### One-command host remediation planner

If `cloud:ssh:mobile-24x7:strict` fails on network reachability or transport,
run the triage planner with live probe and then iterate the generated command list:

```bash
npm run cloud:ssh:host-fix-plan -- --public-ip 21.0.3.171 --user root --live
npm run cloud:ssh:host-fix-plan -- --public-ip 21.0.3.171 --user root --json
```

Use `--json` output when you want machine-consumable artifacts for automation
or bugreport sharing. Re-run after each blocker is fixed and continue with:

## Direct-cloud setup flow

1. Provision or select an always-on VM.
2. Confirm the public IP and SSH port are reachable from the internet.
3. Install the local SEIS public key into the remote user's
   `~/.ssh/authorized_keys`.
4. Install the SSH-AI runtime:
   - `curl -fsSL https://ollama.com/install.sh | sh` (for model backend), then setup `/opt/ssh-ai` shell runtime
   - Run `sudo ln -s /opt/ssh-ai/ai_shell.py /usr/local/bin/ai` and enable `ssh-ai.service`.
5. Apply direct-cloud mode in one command:

```bash
npm run cloud:ssh:direct-cloud:switch -- --public-ip <PUBLIC_IP> --direct-user root --apply
```

   `--apply` is required for the config write in switch mode. This is a validated
   plan/apply path.

6. Or use the one-command activator (switch + mobile readiness):

```bash
npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user root
npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user root --skip-mobile-check
```

   The activator automatically runs `cloud:ssh:mobile-24x7:strict` at the end.
   Use `--skip-mobile-check` to complete direct-cloud switch verification
   (reachable + SSH auth) and skip the final mobile-24x7 strict gate.

7. Require the mobile gate to pass:

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


## One-time runtime hardening after host reachability is fixed

If SSH still times out after `direct-cloud` is configured, run this on the host first to remove common 22/tcp blockers.

```bash
# For UFW
sudo ufw status verbose
sudo ufw allow 22/tcp
sudo ufw reload

# For firewalld
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload

# For sshd
sudo ss -ltnp | rg ":22\b"
sudo nano /etc/ssh/sshd_config
sudo systemctl restart sshd
sudo systemctl status sshd

# Validate remote host SSH and key auth from local
ssh -i ~/.ssh/id_ed25519_seis_codex -p 22 root@<PUBLIC_IP> "echo ok"
```

```bash
# 1) Verify SSH port and auth with existing identity
ssh -i ~/.ssh/id_ed25519_seis_codex -p 22 root@<PUBLIC_IP> "hostname"

# 2) Verify sshd + service
systemctl status sshd
systemctl status ssh-ai

# 3) Validate direct-cloud check stack
npm run cloud:ssh:online:strict
npm run cloud:ssh:mobile-24x7:strict
```

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

The report contains a machine-readable `claimGate`. It keeps
`readyClaimAllowed`, `continuityClaimAllowed`, and `macOffClaimAllowed` false
unless the report was produced through the strict doctor path and the readiness
check passed. A non-strict report can still be useful for debugging, but it does
not authorize the public claim that SEIS is mobile 24/7 ready or reachable while
the local Mac is closed.
