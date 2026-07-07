# NVIDIA Skills Downloadable Catalog QA

## Scope

This review covers the SEIS AI-contained NVIDIA Skills downloadable catalog at
`packages/seis-ai/downloadable/nvidia-skills`.

The catalog is a public-safe metadata snapshot. It is not a global agent skill
install, not a live NVIDIA provider connection, and not model or dataset
readiness evidence.

## Local Payload State

The downloadable catalog payload under `packages/seis-ai/downloadable/` is
ignored by `.gitignore`. A local checkout may contain the full local snapshot
for review, but PR-ready commits do not require the ignored payload.

## Clean Checkout Behavior

`npm run check:seis-ai-nvidia-skills-downloadable` passes in two modes:

- With the local ignored payload present, it validates the manifest, catalog,
  skill-card counts, signatures, hashes, and sensitive-pattern boundary.
- Without the local ignored payload, it validates only the public-safe package
  script, AI Core documentation link, this QA boundary, and the no-live-provider
  claim.

## Source

- Public catalog: <https://build.nvidia.com/skills>
- Source repository: <https://github.com/NVIDIA/skills>
- Snapshot commit: `2dceed62b9edac32db67a0f0cf7d0fdd88765ce0`
- Snapshot date: 2026-06-30

## Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Manifest parses | Local-payload check | `nvidia-skills-downloadable-manifest.json` records source, counts, hashes, and safety boundary when the ignored local payload is present. |
| Catalog parses | Local-payload check | `skills.sh.json` records 14 groupings and 225 grouped catalog skills when the ignored local payload is present. |
| Downloadable card count | Local-payload check | 226 skill directories are mirrored as public skill cards in the ignored local payload. |
| Signature count | Local-payload check | 226 `skill.oms.sig` files are mirrored in the ignored local payload. |
| Full runtime bodies excluded | Local-payload check | No `SKILL.md` files are embedded in the local SEIS AI downloadable folder. |
| Runtime payloads excluded | Local-payload check | No `scripts`, `references`, `assets`, or `.git` directories are embedded in the local payload. |
| Secret-pattern scan | Local-payload check | No private key, provider key, GitHub token, or OpenAI-style secret pattern was detected in the local downloadable folder. |
| Validator command | Passed | `npm run check:seis-ai-nvidia-skills-downloadable` validates the catalog contract. |

## Boundary

- No NVIDIA API key, NGC token, SSH private key, model weight, dataset, or
  provider credential is stored in the repository.
- No global Codex, Claude, Cursor, Kiro, or other agent skill directory was
  modified.
- No NVIDIA provider call, model download, dataset download, SSH operation,
  GitHub mutation, deployment, benchmark, or training run was performed.
- Any later activation of a specific NVIDIA skill must be explicit, scoped, and
  human-reviewed before using the per-skill install command.

## Risk

The catalog is a point-in-time snapshot. NVIDIA may add, remove, or change
skills after the recorded commit. Refreshing the snapshot should rerun the
validator, update this QA report, and preserve the no-credential boundary.

## Next Handoff

The next safe integration step is to expose this manifest through a read-only
SEIS AI status resource or tool once the iCloud workspace allows reliable access
to the larger `packages/seis-ai/src` files.
