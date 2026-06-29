# NVIDIA Installed Integrations

Status: Installed into SEIS registry, runtime remains blocked.

SEIS now tracks 11 local NVIDIA skill manifests from the installed Codex NVIDIA
plugin as local capability records. This is a SEIS integration install, not a
runtime deployment.

The source-of-truth record is
`content/development/seis-nvidia-installed-integrations.json`.

## Installed Into SEIS

- AI-Q Deploy
- AI-Q Research
- cuOpt User Rules
- Dynamo Interconnect Check
- Dynamo Router Starter
- NemoClaw Quickstart
- Omniverse CAD to SimReady
- Omniverse Realtime Viewer
- Omniverse USD Performance Tuning
- Physical AI Infrastructure
- Physical AI Neural Reconstruction

## What This Enables

- SEIS Desktop can show these as installed NVIDIA capability lanes.
- SEIS Store, Search, AI Core, Cloud, and Command Center can route users to the
  correct NVIDIA capability status.
- SEIS Store exposes each lane as an `Installed/Gated` item that opens the
  NVIDIA Catalog.
- SEIS Search includes the installed lanes in Plugin results, with AI-Q,
  Dynamo, and Physical AI lanes also visible from Cloud results.
- SEIS can export a browser-local NVIDIA dry-run plan that includes installed
  skill awareness.
- Validators can prove the integration remains catalog-only and credential-free.

## Runtime Remains Blocked

Runtime remains blocked until explicit human approval exists for a specific
target. SEIS does not currently:

- Clone or update NVIDIA runtime repositories.
- Run remote installer scripts.
- Install Docker, Kubernetes, Helm, Terraform, Azure CLI, or GPU runtimes.
- Start AI-Q, Dynamo, NemoClaw, Omniverse, cuOpt, or Physical AI services.
- Call NVIDIA Build, NIM, NGC, AI-Q, cuOpt, Dynamo, or Omniverse endpoints.
- Download model weights, containers, datasets, CAD files, USD scenes, or
  simulator assets.
- Read, print, write, or store provider credentials or API keys.
- Execute SSH, cluster, cloud, or GitHub write actions.

## Commands

```bash
npm run check:seis-nvidia-installed-integrations
npm run check:seis-nvidia-accelerator-catalog
npm run plan:nvidia-catalog-install
```

## Approval Path

1. Pick one specific installed NVIDIA lane.
2. Pick one specific repo, backend URL, data source, model, scene, cluster, or
   runtime target.
3. Review license, cost, disk, credentials, network, cloud, rollback, and data
   provenance.
4. Add an allowlisted plan before running any live install or deployment command.
