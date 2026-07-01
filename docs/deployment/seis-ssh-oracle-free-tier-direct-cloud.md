# SEIS SSH Oracle Free Tier Direct-Cloud

Oracle Cloud Free Tier is the first direct-cloud attempt for moving `SEIS-SSH`
from terminal-compatible Codespaces fallback toward ChatGPT mobile and Codex
24x7 readiness.

This is not a live Oracle connection and not a VM provisioner. It is the safe
Oracle-specific preflight that tells us what can be prepared without account
login, what must happen outside git, and which proof is required before SEIS can
claim mobile/direct-cloud readiness.

## Commands

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

Default local reports:

```text
reports/seis-ssh-oracle-free-tier-plan.json
reports/seis-ssh-oracle-free-tier-plan.md
reports/seis-ssh-oracle-cloud-init-handoff.yaml
reports/seis-ssh-oracle-instance-launch-plan.md
reports/seis-ssh-oracle-owner-input-template.env
reports/seis-ssh-oracle-owner-input-template.md
reports/seis-ssh-oracle-owner-preflight.md
reports/seis-ssh-oracle-owner-launch-command.md
reports/seis-ssh-oracle-owner-launch-command.sh
reports/seis-ssh-oracle-owner-handoff-bundle.md
reports/seis-ssh-oracle-postboot-handoff.md
reports/seis-ssh-oracle-direct-cloud-pipeline.md
reports/seis-ssh-github-codespaces-fallback-plan.md
reports/seis-ssh-cloudflare-access-plan.md
reports/seis-ssh-direct-cloud-readiness-claim.md
```

These reports are ignored because they describe local tool state, redacted
endpoint hints, and the current SSH alias shape.

## What Can Be Done Without Oracle Login

- Verify the OCI CLI binary is available.
- Verify the SEIS public key exists without reading private key material.
- Inspect `SEIS-SSH` with `ssh -G` without opening an SSH session.
- Generate redacted local readiness reports.
- Generate local-only cloud-init handoff user-data for Oracle VM first boot.
- Generate a local-only instance launch plan with Oracle owner-input placeholders.
- Generate a local-only ignored owner input template for Oracle values that must
  stay outside git.
- Generate a local-only owner preflight report that checks local artifacts, OCI
  session hints, and redacted owner-input presence plus shape validity.
- Generate a local-only launch-command handoff shell script only after required
  owner inputs have valid shapes.
- Keep GitHub Codespaces as fallback until an Oracle VM exists.

## What Requires Owner Action Outside Git

- Oracle account login and session setup.
- Tenancy, region, and compartment selection.
- Always Free VM capacity confirmation.
- VM creation or selection.
- Installing the SEIS public key in the VM user account.
- Pasting reviewed cloud-init YAML into Oracle user-data before first boot.
- Any Cloudflare Access or tunnel setup after a real cloud origin exists.

## Cloud-Init Handoff

Generate a local-only Oracle user-data file:

```bash
npm run cloud:ssh:oracle-cloud-init:handoff
```

The generated YAML lives at:

```text
reports/seis-ssh-oracle-cloud-init-handoff.yaml
```

Review that file locally, then paste it into Oracle Cloud's custom
cloud-init/user-data field when creating the VM. It creates the `aiuser` runtime
user, installs the SEIS public key, disables password SSH auth, keeps root login
to `prohibit-password`, installs basic runtime packages, and clones the public
SEIS repo with HTTPS.

The generated YAML embeds the public SSH key, so it is ignored and should stay
local. It does not include private keys, API keys, OCI tokens, OCIDs, hostnames,
or public IPs.

## Instance Launch Plan

Generate a local-only OCI launch command template:

```bash
npm run cloud:ssh:oracle-instance:plan
```

The plan uses the OCI CLI `--user-data-file` option for the generated cloud-init
YAML, but it does not call Oracle APIs or create a VM. It keeps tenancy,
compartment, subnet, image, and availability-domain values as placeholders for
owner review.

## Owner Input Template

Create the local ignored owner input template:

```bash
npm run cloud:ssh:oracle-owner:template
```

The template writes:

```text
reports/seis-ssh-oracle-owner-input-template.env
```

Fill that file locally with Oracle Console or OCI CLI values, then run:

```bash
npm run cloud:ssh:oracle-owner:preflight -- --owner-inputs-file reports/seis-ssh-oracle-owner-input-template.env
```

The template starts with blank values instead of fake OCIDs or endpoints. The
preflight does not treat blank, placeholder, or malformed values as ready.
If the template file already exists, generation preserves it by default so local
Oracle values are not accidentally erased. Regenerate with `--force` only after
review.

## Owner Preflight

After the cloud-init handoff and launch plan exist, generate the final local
owner preflight:

```bash
npm run cloud:ssh:oracle-owner:preflight
```

This report still does not call Oracle APIs or create a VM. It checks whether
the local OCI CLI is present, whether OCI config/session hints exist, whether
the local cloud-init and launch-plan artifacts exist, and whether owner-provided
Oracle inputs are present and match the expected shapes.

Owner input values are never printed in full. Availability domains, OCIDs, IPs,
and hostnames are represented only by presence, detected kind, and a short
SHA-256 prefix.

## Owner Launch Command Handoff

After the owner input template is filled and preflight confirms valid shapes,
generate the local launch-command handoff:

```bash
npm run cloud:ssh:oracle-owner:launch-command
```

If ready, the raw OCI launch command is written only to:

```text
reports/seis-ssh-oracle-owner-launch-command.sh
```

The JSON and Markdown reports do not print raw OCIDs, availability-domain
values, endpoints, or the full launch command. Existing shell handoffs are
preserved by default; use `--force` only after review.

## Owner Handoff Bundle

Generate the redacted owner handoff bundle whenever you need one owner-facing
status file:

```bash
npm run cloud:ssh:oracle-owner:handoff
```

The bundle reads local reports and shows current stage, next action, run order,
and blockers. It does not call Oracle APIs, create VMs, open SSH, write SSH
config, or print raw OCIDs/endpoints.

## Post-Boot Handoff

After Oracle assigns a public IP or DNS name, generate a post-boot handoff:

```bash
npm run cloud:ssh:oracle-postboot:handoff -- --public-ip <PUBLIC_IP>
```

The report keeps the endpoint redacted and records only endpoint kind plus a
short SHA-256 prefix. It does not open SSH or write config. It shows the owner
run order for refreshing owner preflight, running a switch plan, activating the
single `SEIS-SSH` alias, running strict probe/doctor, and then running the
readiness claim gate.

## Direct-Cloud Pipeline

Use the pipeline report when you want one command to refresh and summarize the
safe local Oracle direct-cloud state:

```bash
npm run cloud:ssh:oracle-direct-cloud:pipeline
```

The pipeline refreshes only local-only reports and then shows the current
blocked stage plus the next owner action. It does not run strict live probes,
open SSH, write SSH config, create VMs, or call Oracle APIs.

## GitHub Codespaces Fallback Plan

While Oracle is blocked by login, capacity, or owner-side launch steps, keep
Codespaces as a terminal-compatible fallback only:

```bash
npm run cloud:ssh:github-codespaces:fallback-plan
```

The plan does not call GitHub APIs, does not run `gh auth status`, does not open
SSH, does not write SSH config, and does not claim mobile 24x7 direct-cloud
readiness.

## Optional Cloudflare Access Plan

After Oracle assigns a real public endpoint, generate the local Cloudflare
Access plan:

```bash
npm run cloud:ssh:cloudflare-access:plan
```

This report keeps Cloudflare as an identity/access layer after the cloud VM
origin exists. It does not call Cloudflare APIs, run tunnel login, create a
tunnel, open SSH, write SSH config, read tunnel credentials, or permit the local
Mac as the default `SEIS-SSH` origin.

## Activation Shape

After the Oracle VM exists and the public key is installed, the owner-approved
activation command is:

```bash
npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user aiuser
```

Use `aiuser` when the SEIS cloud-init handoff was applied. Use `opc` only for a
manual Oracle Linux setup that did not create the SEIS runtime user.

The direct-cloud activation output is redacted by default. It reports endpoint
kind and a short SHA-256 prefix for continuity checks instead of printing the
real Oracle host, IP, or local identity-file path.

## Required Proof Before Readiness Claims

```bash
npm run cloud:ssh:mobile-direct:probe:strict
npm run cloud:ssh:mobile-direct:doctor:strict
npm run cloud:ssh:direct-cloud:claim
```

Until both strict commands pass and the readiness claim gate allows the claim,
the honest status is planning or blocked, not ChatGPT mobile 24x7 ready.

## Safety Rules

- Do not commit OCI config, session files, private keys, tunnel certs, or tokens.
- Do not print Oracle OCIDs, real hostnames, public IPs, or session details in
  public docs or reports.
- Do not expose the local Mac through Cloudflare as the default SEIS-SSH path.
- Do not add a second visible SSH alias.
- Do not claim live AI, live SSH, or mobile 24x7 readiness without strict proof.

Machine-readable source:

```text
deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json
```

Planner source:

```text
scripts/create-seis-ssh-oracle-free-tier-plan.mjs
scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs
scripts/create-seis-ssh-oracle-instance-launch-plan.mjs
scripts/create-seis-ssh-oracle-owner-input-template.mjs
scripts/create-seis-ssh-oracle-owner-preflight.mjs
scripts/create-seis-ssh-oracle-owner-launch-command.mjs
scripts/create-seis-ssh-oracle-postboot-handoff.mjs
scripts/create-seis-ssh-oracle-direct-cloud-pipeline.mjs
```
