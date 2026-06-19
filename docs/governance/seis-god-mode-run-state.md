# SEIS God Mode Run State

The run-state ledger tracks the current God Mode package before validation, commit, push, and CI evidence exist.

## Current state

`pending-validation`

## Required states

| State | Meaning |
| --- | --- |
| Source-controlled artifacts | Contracts, docs, scripts, and package gates exist with local validation output. |
| Runtime surfaces | Dashboard panels were verified through headless Chrome/CDP runtime evidence. |
| Telemetry contracts | Web/native shared contracts contain telemetry events and checker output. |
| Validation commands | Core validation commands and full quality governance passed locally. |
| Commit boundary | Commit package boundary is reviewed but no files are staged. |
| Push and CI | Push and CI evidence do not exist yet. |
| Protected user work | Unrelated user work remains protected until explicit final staging and commit approval. |
| Eval critic advisory | SEIS-owned eval critic aggregate verdict is captured in runtime evidence. |

## Completion rule

Run state remains `pending-validation` until the reviewed boundary is staged intentionally and push or CI evidence is captured.

## Eval critic advisory

The run-state ledger includes the `seis-eval-critic-seed-v0` aggregate verdict
from `reports/seis-eval-critic-advisory/latest.json`. The verdict must remain
`pass` across action decision, execution plan, and execution run reports before
God Mode runtime evidence can be treated as current.

## Validation log

`content/development/seis-god-mode-validation-log.md`

## Canonical contract

```text
content/development/seis-god-mode-run-state.json
```

## Quality gate

```bash
npm run check:seis-god-mode-run-state
```
