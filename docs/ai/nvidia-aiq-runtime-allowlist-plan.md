# NVIDIA AI-Q Runtime Allowlist Plan

Status: Planned/Gated. No AI-Q runtime has been started.

SEIS selected NVIDIA AI-Q as the first candidate for a future approved NVIDIA
runtime window because `aiq-deploy` and `aiq-research` are already installed as
local NVIDIA skill manifests in SEIS. This plan does not clone AI-Q, start a
backend, write `deploy/.env`, call AI-Q endpoints, send research queries, bind
ports, install Docker, install dependencies, use GPU resources, execute SSH, or
store credentials.

The source-of-truth record is
`content/development/seis-nvidia-aiq-runtime-allowlist-plan.json`.

## Current SEIS State

- AI-Q Deploy is installed as an `installed-gated` capability record.
- AI-Q Research is installed as an `installed-gated` capability record.
- The NVIDIA Catalog can display the AI-Q runtime plan as metadata only.
- Core SEIS remains zero-key and works in Local Demo mode.
- Missing Key is not Error.

## First Runtime Candidate

The preferred first runtime window is a backend-only local Skill server with
the default candidate URL:

```text
http://localhost:8000
```

The frontend UI stays disabled for the first approval window unless the user
explicitly chooses the UI path. A non-local `AIQ_SERVER_URL` must be explicitly
trusted by the user before any prompt or research query is sent to it.

## Approval Required Before Runtime

Human approval is required before any of these actions:

- Clone or update `https://github.com/NVIDIA-AI-Blueprints/aiq`.
- Create or modify `deploy/.env`.
- Read, print, write, or store provider credentials.
- Start Docker Compose, Python, Node, Helm, Kubernetes, PostgreSQL, or GPU
  services.
- Bind AI-Q backend or frontend ports.
- Call AI-Q health, chat, async-agent, polling, or report endpoints.
- Send a research query to a local or remote AI-Q backend.
- Run deep research completion validation.
- Execute SSH, cloud, cluster, GitHub write, deployment, or release actions.

## Minimum Runtime Window Checklist

1. Confirm AI-Q is the selected NVIDIA lane.
2. Confirm the target mode: backend-only, CLI, UI, Docker Compose, or
   Kubernetes/Helm.
3. Confirm the checkout location and rollback plan.
4. Confirm network access and repo clone/update approval.
5. Confirm license, dependency, disk, port, and runtime requirements.
6. Confirm `deploy/.env` is ignored before any secret is written.
7. Confirm credentials are configured by the user outside chat and outside
   committed files.
8. Confirm any non-local backend URL is trusted.
9. Confirm validation depth: health-only, shallow chat, or deep research.
10. Confirm no GitHub write, deployment, SSH, or public claim is included.

## Validation Boundary

Current validation only proves that the allowlist plan is present and wired:

```bash
npm run check:seis-nvidia-aiq-runtime-allowlist-plan
npm run check:seis-nvidia-installed-integrations
npm run check:seis-nvidia-accelerator-catalog
npm run plan:nvidia-catalog-install
```

Runtime validation has not been run. Until it is run during an approved window,
SEIS may only claim that AI-Q is selected as a planned/gated runtime candidate,
not that AI-Q is deployed, reachable, authenticated, model-backed, or ready for
research.

## Safe SEIS Integration

The Desktop NVIDIA Catalog, SEIS Search, SEIS AI Core, SEIS Cloud, Store, docs,
and validators can show this plan. They must keep the status as
`Planned/Gated` or `metadata-only-no-runtime` until explicit runtime evidence
exists.
