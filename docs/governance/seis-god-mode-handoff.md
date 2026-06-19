# SEIS God Mode Handoff

The handoff standard prevents God Mode work from being treated as complete before validation, commit, push, or CI evidence exists.

## Required sections

| Section | Purpose |
| --- | --- |
| Summary | Explain what changed and why it matters. |
| Changed Surfaces | List affected product, platform, governance, agent, security, and validation surfaces. |
| Validation Status | State whether validation has run and what remains unverified. |
| Risks | Preserve known risks instead of hiding them. |
| Rollback | Define the bounded rollback path. |
| Next Commands | List the commands that must run before completion or release claims. |
| Protected User Work | State that unrelated user work must not be overwritten. |

## Validation evidence

Validation status is backed by:

- `content/development/seis-god-mode-validation-log.md`
- `content/development/seis-god-mode-completion-audit.json`
- `content/development/seis-god-mode-run-state.json`
- `content/development/seis-god-mode-runtime-evidence.json`
- `content/development/seis-god-mode-feature-growth-ledger.json`
- `docs/governance/seis-command-center-feature-growth-integration-plan.md`
- `reports/seis-commit-packages.md`

## Staging review

The commit package plan has been reviewed in read-only mode. No files are staged yet; final staging, commit, push, and CI evidence remain open gates.

## Completion rule

A handoff is complete only when validation status, risks, rollback, next commands, and protected user work are explicit and current.

## Canonical contract

```text
content/development/seis-god-mode-handoff.json
```

## Quality gate

```bash
npm run check:seis-god-mode-handoff
```
