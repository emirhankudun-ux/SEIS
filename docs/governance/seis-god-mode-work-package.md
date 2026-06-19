# SEIS God Mode Work Package

The work package describes the current God Mode slice as a bounded, reviewable, reversible change set. It exists so feature work, governance work, validation duties, rollback paths, and commit readiness are tracked together.

## Required sections

| Section | Purpose |
| --- | --- |
| Product Surface | User-visible dashboard surfaces and shared web behavior. |
| Goals | Evidence ledger for objectives, acceptance criteria, validation, and rollback. |
| Repos | Repository health, publish safety, plugin posture, and CI governance. |
| Docs | Governance index and living documentation coverage. |
| Agents | Safe autonomy lanes, skill paths, and validation duties. |
| Security, AI, and Rollback | Release readiness gates for security, AI policy, quality evidence, rollback, and CI. |
| Validation | Ordered command sequence and proof targets. |
| Architecture Decisions | ADR template, ADR workflow, and accepted example decision record. |
| Handoff | Summary, changed surfaces, validation status, risks, rollback, next commands, and protected user work. |
| Completion Audit | Evidence-based not-complete state until validation, commit, push, CI, and protected user work are proven. |
| Run State | Current source, runtime, telemetry, validation, commit, push, CI, and protected-user-work state. |
| Staging Manifest | Intended staging groups, protected paths, excluded categories, and commit-readiness boundaries. |
| Changelog | Draft-unverified release notes for every added God Mode feature group. |
| Feature Growth Ledger | Topic-by-topic proof that Dashboard, Goals, Repos, Docs, Agents, Security, AI Policy, Rollback, Validation, and Handoff have improvement evidence. |

## Completion rule

Local governance validation and local browser runtime verification have passed, and the read-only commit package plan has been reviewed. The work package is still not complete until unrelated user changes remain protected through final staging and commit/push/CI or explicit handoff evidence exists.

## Current evidence

- `content/development/seis-god-mode-validation-log.md`
- `content/development/seis-god-mode-runtime-evidence.json`
- `content/development/seis-god-mode-feature-growth-ledger.json`
- `reports/seis-commit-packages.md`

## Canonical contract

```text
content/development/seis-god-mode-work-package.json
```

## Quality gate

```bash
npm run check:seis-god-mode-work-package
```
