# SEIS SSH Direct-Cloud Provider Matrix

This matrix decides how `SEIS-SSH` should move from terminal-compatible cloud
SSH toward ChatGPT mobile and Codex 24x7 readiness.

It is not a live provider connection. It is the provider-selection contract that
keeps the next move honest, public-safe, and reversible.

## Decision

Recommended order:

1. `oracle-cloud-free-tier`
2. `github-codespaces`
3. `cloudflare-access-tunnel`
4. `google-cloud-compute`

Active recommendation:

```text
oracle-cloud-free-tier -> direct-cloud SSH -> optional Cloudflare Access layer -> SEIS-SSH
```

Reason: Oracle Cloud Free Tier is the best fit for an always-on no-cost VM when
login, tenancy, capacity, and SSH key installation are available.

## Provider Roles

| Provider | Role | 24x7 direct-cloud fit | Current blocker |
| --- | --- | --- | --- |
| Oracle Cloud Free Tier | Primary direct-cloud candidate | Strong when VM capacity exists | Needs account session, tenancy, VM, and public key install |
| GitHub Codespaces | Development fallback | Not 24x7 | Sleeps, budget limits, ProxyCommand picker warning |
| Cloudflare Access / Tunnel | Identity/access layer | Not a VM by itself | Needs a real cloud origin and credential-safe login |
| Google Cloud Compute | Strong when billing/IAM work | Good when verified | Billing, API, IAM, and firewall prerequisites |

## What This Means For SEIS-SSH

`SEIS-SSH` remains the only visible alias.

Codespaces can stay as the current terminal-compatible fallback, but it must not
be described as ChatGPT mobile 24x7 direct-cloud readiness.

Cloudflare can protect or broker access later, but it is not a replacement for the cloud VM. Do not expose the local Mac through Cloudflare as the default
public SEIS-SSH path.

Oracle is the clean next attempt because it can provide the always-on VM layer
without turning the local computer into infrastructure.

## Oracle Free Tier Plan

Before any live Oracle work, use the Oracle-specific read-only plan:

```bash
npm run cloud:ssh:oracle-free-tier:plan
npm run check:seis-ssh-oracle-free-tier-plan
npm run cloud:ssh:oracle-cloud-init:handoff
npm run check:seis-ssh-oracle-cloud-init-handoff
npm run cloud:ssh:oracle-instance:plan
npm run check:seis-ssh-oracle-instance-launch-plan
npm run cloud:ssh:oracle-owner:template
npm run check:seis-ssh-oracle-owner-input-template
npm run cloud:ssh:oracle-owner:preflight
npm run check:seis-ssh-oracle-owner-preflight
npm run cloud:ssh:oracle-owner:launch-command
npm run check:seis-ssh-oracle-owner-launch-command
npm run cloud:ssh:oracle-owner:handoff
npm run check:seis-ssh-oracle-owner-handoff
npm run cloud:ssh:oracle-postboot:handoff
npm run check:seis-ssh-oracle-postboot-handoff
npm run cloud:ssh:oracle-direct-cloud:pipeline
npm run check:seis-ssh-oracle-direct-cloud-pipeline
npm run cloud:ssh:github-codespaces:fallback-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run cloud:ssh:cloudflare-access:plan
npm run check:seis-ssh-cloudflare-access-plan
npm run cloud:ssh:direct-cloud:claim
npm run check:seis-ssh-direct-cloud-readiness-claim
```

Planner source:

```text
deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json
docs/deployment/seis-ssh-oracle-free-tier-direct-cloud.md
scripts/create-seis-ssh-oracle-free-tier-plan.mjs
scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs
scripts/create-seis-ssh-oracle-instance-launch-plan.mjs
scripts/create-seis-ssh-oracle-owner-input-template.mjs
scripts/create-seis-ssh-oracle-owner-preflight.mjs
scripts/create-seis-ssh-oracle-owner-launch-command.mjs
scripts/create-seis-ssh-oracle-owner-handoff-bundle.mjs
scripts/create-seis-ssh-oracle-postboot-handoff.mjs
scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs
scripts/create-seis-ssh-cloudflare-access-plan.mjs
scripts/create-seis-ssh-github-codespaces-fallback-plan.mjs
scripts/create-seis-ssh-direct-cloud-readiness-claim.mjs
```

The Oracle planner does not log in, call provider APIs, create VMs, open SSH, or
write SSH config. It only verifies local preflight state and reports which
owner-side Oracle steps are still required.

The cloud-init handoff generator writes local-only ignored artifacts for Oracle
user-data. It embeds only the SEIS public key, never private keys or provider
credentials.

The instance launch plan generator writes a local-only OCI command template
with owner-input placeholders and `--user-data-file`. It never runs `oci compute
instance launch`.

The owner input template generator writes a local-only ignored `.env` file with
blank Oracle fields. It gives the owner one safe place to put availability
domain, compartment, subnet, image, and optional post-boot endpoint values
without committing them. If the file already exists, it is preserved by default;
overwrite requires an explicit `--force` review command.

The owner preflight report checks local artifacts, OCI session hints, and
redacted owner-input presence plus shape validity before any owner-side launch
command is run. It does not read OCI config contents, call Oracle APIs, create
VMs, open SSH, or print OCIDs/endpoints in full.

The owner launch command handoff creates an ignored local shell script only
after required owner inputs have valid shapes. JSON and Markdown reports never
print raw owner values or the full launch command.

The owner handoff bundle gives the owner one redacted status file with current
stage, next action, run order, and blockers. It does not call Oracle APIs,
create VMs, open SSH, write SSH config, or print raw owner values.

The post-boot handoff records the endpoint continuity after Oracle assigns a
public endpoint, but it still does not call provider APIs, open SSH, or write
SSH config.

The direct-cloud pipeline refreshes all local-only Oracle reports and summarizes
the current blocked stage without running strict live probes.

The GitHub Codespaces fallback plan is local-only and keeps Codespaces honest:
it can be terminal-compatible, but it is `fallbackOnly`, not mobile 24x7
direct-cloud readiness. It does not call GitHub APIs, run `gh auth status`,
open SSH, write SSH config, or print ProxyCommand details.

The Cloudflare Access plan is optional and runs only after a real cloud origin
exists. It keeps Cloudflare as an identity/access layer, not a VM replacement;
it does not call Cloudflare APIs, run tunnel login, open SSH, write SSH config,
or permit the local Mac as the default SEIS-SSH origin.

The readiness claim gate reads the local owner preflight and strict doctor
reports, then keeps the final ChatGPT mobile/Codex 24x7 claim blocked unless
all live evidence exists. It does not call provider APIs or open SSH.

## Required Evidence Before Claiming Readiness

```bash
npm run check:seis-ssh-oracle-cloud-init-handoff
npm run check:seis-ssh-oracle-instance-launch-plan
npm run check:seis-ssh-oracle-owner-input-template
npm run check:seis-ssh-oracle-owner-preflight
npm run check:seis-ssh-oracle-owner-launch-command
npm run check:seis-ssh-oracle-owner-handoff
npm run check:seis-ssh-oracle-postboot-handoff
npm run check:seis-ssh-oracle-direct-cloud-pipeline
npm run check:seis-ssh-cloudflare-access-plan
npm run check:seis-ssh-github-codespaces-fallback-plan
npm run check:seis-ssh-oracle-free-tier-plan
npm run check:seis-ssh-direct-cloud-provider-matrix
npm run check:seis-ssh-public-access
npm run check:seis-ssh-picker-compatibility
npm run check:seis-ssh-mobile-direct-cloud
npm run cloud:ssh:mobile-direct:probe:strict
npm run cloud:ssh:mobile-direct:doctor:strict
npm run cloud:ssh:direct-cloud:claim
```

The final two strict commands are expected to fail until a real direct-cloud
endpoint exists and accepts the SEIS public key.

## Forbidden Defaults

- Do not share private SSH keys.
- Do not commit OCI, gcloud, Cloudflare, GitHub, or tunnel credentials.
- Do not expose local Mac SSH as the default SEIS-SSH endpoint.
- Do not add a second visible SSH picker alias.
- Do not claim live readiness while the target is still Codespaces-only.

## Next Safe Actions

1. Run the Oracle-specific read-only plan.
2. Generate cloud-init, the instance launch plan, and the owner input template.
3. Complete Oracle Cloud login and tenancy selection outside git.
4. Fill the ignored owner input template locally and rerun owner preflight.
5. Generate the ignored owner launch-command handoff and review it locally.
6. Generate the owner handoff bundle for one redacted owner-facing run order.
7. Create or select an always-on VM only after quota/capacity is confirmed.
8. Install the existing SEIS public key on the VM.
9. Run strict direct-cloud probe and doctor.
10. Run the Cloudflare Access plan only after the cloud VM is real.
11. Run the GitHub Codespaces fallback plan to keep the fallback status explicit.
12. Add Cloudflare Access only after the cloud VM is real and the origin policy is identity-gated.

Machine-readable source:

```text
deploy/seis-ssh-direct-cloud-provider-matrix.json
```

## Activation Planner

Before attempting Oracle, Cloudflare, GitHub Codespaces, or Google Cloud live
work, generate the read-only activation plan:

```bash
npm run cloud:ssh:direct-cloud:plan
npm run check:seis-ssh-direct-cloud-activation-plan
```

Planner source:

```text
scripts/create-seis-ssh-direct-cloud-activation-plan.mjs
docs/deployment/seis-ssh-direct-cloud-activation-plan.md
```

The planner does not authenticate to providers, open SSH, write SSH config, or
probe live hosts. It only reports current local tool availability, sanitized
`SEIS-SSH` alias state, and the next safe action.
