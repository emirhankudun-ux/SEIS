# NVIDIA AI-Q Runtime Allowlist Review

Date: 2026-06-30

PR queue item: `1D.1`

Backlog item: `SEIS-BL-052`

Final decision: Ready for internal review

## Scope

This review records the first runtime candidate after the NVIDIA installed
integrations pass. It selects NVIDIA AI-Q as a planned/gated lane and adds a
reviewable allowlist plan before any live setup command can be considered.

The source-of-truth plan is
`content/development/seis-nvidia-aiq-runtime-allowlist-plan.json`.

## What Is Real

- SEIS has local `aiq-deploy` and `aiq-research` skill manifests installed as
  runtime-gated capability records.
- SEIS has a JSON allowlist plan, AI doc, review packet, Desktop catalog
  surface, index links, roadmap entries, and a validator.
- The planned first runtime mode is backend-only local AI-Q, pending approval.

## What Is Not Real Yet

- AI-Q has not been cloned by this review.
- No `deploy/.env` was created or modified.
- No NVIDIA, NGC, NIM, search provider, cookie, token, or SSH credential was
  read, printed, stored, or committed.
- No Docker, Python service, Node service, Kubernetes, Helm, PostgreSQL, GPU,
  SSH, cloud, deployment, GitHub write, AI-Q endpoint, or research query was
  executed.
- No claim is made that AI-Q is deployed, reachable, authenticated,
  model-backed, or research-ready.

## Approval Gates

Runtime remains blocked until a human approves all relevant gates:

- selected AI-Q runtime mode
- checkout location
- network and clone/update permission
- license and dependency review
- disk, port, runtime, Docker, Node, Python, Kubernetes, Helm, GPU, and cloud
  requirements
- `deploy/.env` ignore proof before secret setup
- user-managed credentials outside chat and committed files
- trusted `AIQ_SERVER_URL` before any query
- validation depth and quota/time acceptance
- shutdown and rollback plan
- no public readiness claim without runtime evidence

## SEIS Surface

SEIS Desktop exposes this as `NVIDIA AI-Q Runtime Allowlist` in the NVIDIA
Catalog. SEIS Search and AI Core can route the user to the same catalog state.
The status must stay `Planned/Gated` or `metadata-only-no-runtime` until a
future approved runtime run creates fresh evidence.

## Validation

Required focused checks:

```bash
npm run check:seis-nvidia-aiq-runtime-allowlist-plan
npm run check:seis-nvidia-installed-integrations
npm run check:seis-nvidia-accelerator-catalog
npm run plan:nvidia-catalog-install
git diff --check
```

Browser smoke is useful before demo review, but this review does not require it
because the change is a metadata, docs, validator, and small Desktop surface
slice.

## Result

The AI-Q runtime lane is now reviewable without lowering the runtime gate. The
next authorized step is an explicit human-approved AI-Q runtime window, not an
automatic install.
