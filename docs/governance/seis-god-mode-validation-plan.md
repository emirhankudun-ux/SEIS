# SEIS God Mode Validation Plan

The validation plan defines the command sequence required to prove God Mode development. It separates feature creation from verified completion.

## Required command sequence

| Area | Command |
| --- | --- |
| God Mode foundation | `npm run check:seis-god-mode-developer` |
| Module coverage | `npm run check:seis-god-mode-module-coverage` |
| Goal evidence | `npm run check:seis-goals-evidence-ledger` |
| Repo health | `npm run check:seis-repo-health-manifest` |
| Governance index | `npm run check:seis-governance-index` |
| Agent lanes | `npm run check:seis-agent-lane-status` |
| Release readiness | `npm run check:seis-god-mode-release-readiness` |
| Validation plan | `npm run check:seis-god-mode-validation-plan` |
| Work package | `npm run check:seis-god-mode-work-package` |
| ADR workflow | `npm run check:seis-god-mode-adr-workflow` |
| Handoff | `npm run check:seis-god-mode-handoff` |
| Completion audit | `npm run check:seis-god-mode-completion-audit` |
| Run state | `npm run check:seis-god-mode-run-state` |
| Staging manifest | `npm run check:seis-god-mode-staging-manifest` |
| Changelog | `npm run check:seis-god-mode-changelog` |
| Feature growth ledger | `npm run check:seis-god-mode-feature-growth-ledger` |
| Full governance | `npm run quality:governance` |

## Operating rule

Do not claim completion until the relevant feature gates and full governance chain have passed with current-state evidence.

## Canonical contract

```text
content/development/seis-god-mode-validation-plan.json
```

## Quality gate

```bash
npm run check:seis-god-mode-validation-plan
```
