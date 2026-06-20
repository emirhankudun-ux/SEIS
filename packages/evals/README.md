# @seis/evals

Status: Fixture-backed report package

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

The first prompt and app-state evaluation report is generated from fixture data:

- `schemas/fixture-evaluation-report.schema.json`
- `reports/evals/ai-core-fixture-evaluation-report.json`
- `reports/evals/ai-core-fixture-evaluation-report.md`
- `npm run check:ai-core-fixture-evaluation-report`
- `npm run automation:ai-core-fixture-evaluation-report`

No benchmark result, live model score, provider performance result, safety
certification, or trained SEIS model claim is created by this package.

See `docs/evals/evaluation-strategy.md`.
