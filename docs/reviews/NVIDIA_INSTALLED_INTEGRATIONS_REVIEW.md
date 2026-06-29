# NVIDIA Installed Integrations Review

Date: 2026-06-29
Status: Ready for internal review
PR queue item: `1D`
Backlog item: `SEIS-BL-051`

This review covers `feat: install NVIDIA skill integrations into SEIS`.

## What Is Installed

SEIS installs 11 local NVIDIA Codex skill manifests as registry-backed,
searchable, UI-visible capability records:

- NVIDIA AI-Q Deploy
- NVIDIA AI-Q Research
- NVIDIA cuOpt User Rules
- NVIDIA Dynamo Interconnect Check
- NVIDIA Dynamo Router Starter
- NVIDIA NemoClaw Quickstart
- NVIDIA Omniverse CAD to SimReady
- NVIDIA Omniverse Realtime Viewer
- NVIDIA Omniverse USD Performance Tuning
- NVIDIA Physical AI Infrastructure
- NVIDIA Physical AI Neural Reconstruction

The source-of-truth record is
`content/development/seis-nvidia-installed-integrations.json`.

## SEIS Surfaces

- Desktop NVIDIA Catalog shows all 11 installed lanes.
- SEIS Store exposes each lane as an `Installed/Gated` item.
- SEIS Search Plugin results include all installed lanes.
- SEIS Search Cloud results include AI-Q, Dynamo, and Physical AI lanes.
- SEIS AI Plugin Center shows the installed NVIDIA lane table.
- SEIS Command Center validation queue includes the installed integrations gate.
- VFS dry-run exports include the installed NVIDIA lane list.

## Runtime Boundary

Runtime remains blocked. This PR does not:

- Clone or update NVIDIA runtime repositories.
- Run remote installer scripts.
- Install Docker, Kubernetes, Helm, Terraform, Azure CLI, or GPU runtimes.
- Start AI-Q, Dynamo, NemoClaw, Omniverse, cuOpt, or Physical AI services.
- Call NVIDIA Build, NIM, NGC, AI-Q, cuOpt, Dynamo, or Omniverse endpoints.
- Download model weights, containers, datasets, CAD files, USD scenes, or simulator assets.
- Read, print, write, or store provider credentials or API keys.
- Execute SSH, cluster, cloud, or GitHub write actions.

## Required Validation

```bash
npm run check:seis-nvidia-installed-integrations
npm run check:seis-nvidia-accelerator-catalog
npm run plan:nvidia-catalog-install
npm run check:desktop-os
npm run check:seis-ultimate-demo
git diff --check
```

Browser smoke is recommended for UI review:

```bash
npm run check:desktop-os-browser-smoke
```

## Review Decision

Ready for internal review. Runtime promotion requires a separate allowlisted
plan for one specific NVIDIA lane and explicit human approval.
