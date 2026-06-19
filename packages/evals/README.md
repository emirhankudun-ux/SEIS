# @seis/evals

Status: Placeholder contract package

This package will hold evaluation fixtures and harnesses for prompts, model
routes, agent tasks, app states, and future model experiments.

## Planned Responsibilities

- prompt regression fixtures
- router policy fixtures
- agent safety checks
- app state contract checks
- benchmark metadata validation

## Current Links

The first prompt regression fixture pack lives in
`packages/prompt-engine/fixtures/assistant-surface-regression-suite.json` and is
validated by `npm run check:prompt-regression-fixtures`.

No benchmark result, live model score, provider performance result, safety
certification, or trained SEIS model claim is created by this package.

See `docs/evals/evaluation-strategy.md`.
