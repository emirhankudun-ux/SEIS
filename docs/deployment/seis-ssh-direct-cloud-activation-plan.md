# SEIS SSH Direct-Cloud Activation Plan

This plan is the safe bridge between provider selection and a real
`SEIS-SSH` direct-cloud endpoint.

It does not log in to cloud providers, open SSH, write `~/.ssh/config`, create
VMs, or probe live hosts. It inspects only local tool availability, the current
`SEIS-SSH` alias shape, and the public key readiness needed for the next
owner-approved step.

## Command

```bash
npm run cloud:ssh:direct-cloud:plan
npm run check:seis-ssh-direct-cloud-activation-plan
```

Default local reports:

```text
reports/seis-ssh-direct-cloud-activation-plan.json
reports/seis-ssh-direct-cloud-activation-plan.md
```

These reports are local-only and ignored because they can describe the current
machine, installed tools, and redacted endpoint fingerprints.

## What It Answers

- Is `SEIS-SSH` still Codespaces-backed or already direct-cloud?
- Is the SEIS public key present locally?
- Are `oci`, `gh`, `cloudflared`, and `gcloud` installed locally?
- Which provider path is currently the safest next move?
- Which commands are still approval-gated?

## Current Provider Order

1. Oracle Cloud Free Tier for the first always-on VM attempt.
2. GitHub Codespaces as terminal-compatible fallback.
3. Cloudflare Access/Tunnel only after a real cloud origin exists.
4. Google Cloud Compute after billing, IAM, and Compute API are ready.

## Oracle-Specific Preflight

Use the Oracle-specific planner before any live Oracle work:

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

This planner is stricter about the Oracle path: it separates what can be done
without Oracle login from the owner-side steps that must remain outside git.
The owner input template creates an ignored local `.env` file with blank Oracle
fields so real compartment, subnet, image, availability-domain, and endpoint
values do not enter public files. Existing owner input files are preserved by
default; overwriting requires explicit `--force` review.
The owner preflight is the final local-only check before an owner runs an OCI
launch command. It records only redacted presence, shape validity, and SHA-256
prefixes for availability-domain, OCID, and endpoint inputs.
The owner launch-command handoff writes the raw OCI launch command only to an
ignored local shell script when inputs are valid; reports keep raw owner values
out of JSON and Markdown.
The owner handoff bundle creates one redacted owner-facing run order and status
snapshot. It does not call Oracle APIs, create VMs, open SSH, write SSH config,
or print raw owner values.
The post-boot handoff is the first local-only report after Oracle assigns a
public endpoint; it records endpoint continuity and the activation/proof order
without opening SSH.
The direct-cloud pipeline refreshes and summarizes every local-only Oracle
direct-cloud report so the next owner action is visible from one command.
The GitHub Codespaces fallback plan documents the current terminal-compatible
fallback without calling GitHub APIs, checking auth status, opening SSH, writing
SSH config, or claiming mobile 24x7 direct-cloud readiness.
The Cloudflare Access plan runs only after a real cloud origin exists. It does
not call Cloudflare APIs, run tunnel login, open SSH, write SSH config, or allow
the local Mac as the default SEIS-SSH origin.
The readiness claim gate runs after strict probe and strict doctor evidence
exists; it keeps the final mobile/Codex 24x7 claim blocked when live evidence is
missing.

## Safety Rules

- Do not print or commit private keys.
- Do not print or commit provider tokens, session files, tunnel certs, or cloud
  credentials.
- Do not expose the local Mac as the default public SEIS-SSH endpoint.
- Do not claim 24x7 readiness until strict probe and doctor pass.
- Do not change the current `SEIS-SSH` host or port without owner approval.

Machine-readable provider source:

```text
deploy/seis-ssh-direct-cloud-provider-matrix.json
```
