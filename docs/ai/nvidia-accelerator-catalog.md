# NVIDIA Accelerator Catalog

Status: Local Demo catalog, install blocked by default.

SEIS now tracks the requested NVIDIA GitHub organization, NVIDIA Build skills,
and NVIDIA Build run-anywhere model catalog as a reviewable accelerator intake.
The source-of-truth record is
`content/development/seis-nvidia-accelerator-catalog.json`.

## What Exists

- A SEIS catalog contract for `https://github.com/NVIDIA`.
- Official NVIDIA Build source links for skills and models.
- A read-only GitHub API snapshot showing 756 public NVIDIA repos on
  2026-06-29.
- A dry-run install plan exposed through `npm run plan:nvidia-catalog-install`.
- A validator exposed through `npm run check:seis-nvidia-accelerator-catalog`.
- A Desktop/Store/AI/Cloud/Search surface named NVIDIA Catalog.
- 11 local NVIDIA skill manifests installed into SEIS as runtime-gated
  integration records. See
  `content/development/seis-nvidia-installed-integrations.json` and
  `docs/ai/nvidia-installed-integrations.md`.
- A NVIDIA AI-Q runtime allowlist plan as the first selected runtime candidate,
  still in `Planned/Gated` status. See
  `content/development/seis-nvidia-aiq-runtime-allowlist-plan.json` and
  `docs/ai/nvidia-aiq-runtime-allowlist-plan.md`.

## What Is Not Installed

- No bulk clone.
- No model download.
- No NIM call.
- No Docker pull.
- No GPU provisioning.
- No dependency installation.
- No SSH execution.
- No GitHub write.
- No NVIDIA, NGC, NIM, SSH, cookie, or provider secret is stored.

## Safe Install Path

1. Keep the default dry-run plan.
2. Select a small allowlist of specific repos, skills, or model IDs.
3. Review license, acceptable use, disk size, dependency risk, and provenance.
4. Decide whether the target belongs outside the SEIS repo or as metadata only.
5. Request explicit approval before any clone, model download, NIM call, GPU
   provision, Docker pull, SSH action, dependency install, or provider setup.

## Commands

```bash
npm run check:seis-nvidia-accelerator-catalog
npm run check:seis-nvidia-installed-integrations
npm run check:seis-nvidia-aiq-runtime-allowlist-plan
npm run plan:nvidia-catalog-install
npm run plan:nvidia-catalog-install -- --json
```

`npm run plan:nvidia-catalog-install -- --apply` intentionally fails. Real
installation needs a specific allowlist and explicit approval.

## SEIS Boundary

This is an accelerator catalog, not proof that SEIS has installed every NVIDIA
repository, owns NVIDIA models, can run all NIMs locally, or has live NVIDIA
provider access. Core SEIS remains zero-key and Local Demo compatible.
