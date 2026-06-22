# SEIS God Mode Staging Manifest

The staging manifest defines what belongs to the current God Mode work package before commit or push.

## Current state

`planned-not-staged`

Review status: `reviewed-not-staged`

Evidence:

- `reports/seis-commit-packages.md`
- `reports/seis-commit-packages.json`
- `content/development/seis-god-mode-validation-log.md`

## Staging principles

| Principle | Rule |
| --- | --- |
| Bounded staging | Stage only files that belong to the God Mode work package. |
| User-work protection | Preserve unrelated user work and existing dirty files. |
| Validation first | Do not claim commit readiness until validation stays current and reviewed files are intentionally staged. |
| Reversible slice | Keep rollback possible by grouping related contracts, docs, checkers, dashboard surfaces, telemetry, and package scripts. |

## Required groups

| Group | Purpose |
| --- | --- |
| Dashboard Runtime | User-visible panels, renderers, styles, service worker cache version. |
| Shared Contracts | Web/native telemetry parity. |
| God Mode Contracts | Source of truth for feature, validation, handoff, audit, and run state. |
| Governance Docs | Human-readable operating model and decision records. |
| Quality Checkers | CI-linked gates. |
| Plugin Skill | God Mode plugin capability and agent skill. |
| Package Quality Chain | Package scripts and governance chain. |

The current God Mode contract, governance-docs, and quality-checkers groups include the feature growth ledger so topic-by-topic improvement evidence is staged with the rest of the package.

## Protected paths

`apps/seis-core/index.html` is protected from this package unless explicitly reviewed and included.

## Canonical contract

```text
content/development/seis-god-mode-staging-manifest.json
```

## Quality gate

```bash
npm run check:seis-god-mode-staging-manifest
```
