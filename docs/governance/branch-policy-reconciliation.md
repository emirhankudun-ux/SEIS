# Branch Policy Reconciliation

Status: active-main-centered-reconciled.

This document reconciles current SEIS branch policy with older UIXApps /
UIXAppTTR-era records that still exist as historical or archive material.

## Current SEIS Rule

`main` is the only permanent branch for SEIS.

Short-lived branches such as `feature/*`, `fix/*`, `docs/*`, `chore/*`,
`codex/*`, and `claude/*` are review surfaces only. Accepted work must converge
back into `main` through reviewable changes.

## Legacy UIXAppTTR Boundary

`UIXAppTTR` is not the current SEIS target branch and must not be presented as
the active branch for new SEIS work.

UIXAppTTR references may remain only when they are clearly treated as:

- legacy UIXApps import or migration history
- historical branch audit evidence
- archived development program records
- old validator references kept for review-only archaeology
- migration notes that point back to the current `main`-centered policy

## Classified Legacy Surfaces

These files may mention UIXAppTTR, but they are not current branch instructions:

| Path | Classification |
| --- | --- |
| `docs/repository-visibility-and-main-sync.md` | historical branch migration audit |
| `docs/governance/development-process.md` | legacy UIXApps development process record |
| `docs/development/uixapps-repository-model.md` | legacy UIXApps branch model |
| `docs/development/uixappttr-branch-model.md` | legacy UIXAppTTR branch model |
| `docs/development/long-term-development-program.md` | legacy long-term program record |
| `docs/strategy/seis-evolution-model.md` | legacy evolution model record |
| `scripts/check-uixappttr-branch.mjs` | legacy branch validator |
| `scripts/check-development-process.mjs` | legacy process validator |
| `scripts/check-development-state.mjs` | legacy development state validator |
| `scripts/check-seis-evolution-model.mjs` | legacy evolution model validator |

## Active Surface Rule

Active contributor-facing surfaces must keep the current branch model:

- `README.md`
- `CONTRIBUTING.md`
- `CODEX.md`
- `docs/governance/branch-policy.md`
- `.github/workflows/ci.yml`
- `.github/workflows/foundation-check.yml`
- `.github/workflows/seis-open-source-governance.yml`

Those files must not instruct contributors, CI, or agents to target UIXAppTTR.

## Validation

Run:

```bash
npm run check:branch-policy-reconciliation
npm run check:open-source-governance
```

The reconciliation check is local-only. It does not inspect or mutate remote GitHub settings,
branch protection, or repository defaults. Remote branch
protection still needs explicit GitHub verification before public readiness
claims.
