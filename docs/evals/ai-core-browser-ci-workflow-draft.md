# AI Core Browser CI Workflow Draft

## Purpose

Provide a review-only GitHub Actions workflow draft for running browser-run AI
Core QA evidence after browser infrastructure is approved.

This document is not an active workflow. It must not be copied into
`.github/workflows/` until the browser runner, action pinning, artifact
retention, and failure semantics are reviewed.

## Scope

This draft covers only `npm run qa:seis-core:ai-core-evidence` for
`apps/seis-core`. It does not change the active metadata-only CI workflow and
does not enable browser-required QA by itself.

## Current Status

The active GitHub Actions workflow remains metadata-only through
`npm run quality:governance`. Browser-run AI Core QA evidence is currently a
local or browser-enabled-runner gate, not an active CI gate.

The metadata validator remains `npm run check:ai-core-browser-qa-evidence`.

## Review-Only Workflow Draft

```yaml
name: AI Core Browser Evidence

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  ai-core-browser-evidence:
    name: AI Core browser evidence
    runs-on: ubuntu-latest
    timeout-minutes: 8
    env:
      SEIS_BROWSER_BIN: /usr/bin/google-chrome
      SEIS_DATA_MODE: mock
      SEIS_PRIVACY_MODE: local-only
      CI: "true"

    steps:
      - name: Checkout
        uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3

      - name: Use Node.js
        uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version: "20"

      - name: Verify Chrome/Chromium binary
        run: |
          test -x "$SEIS_BROWSER_BIN"
          "$SEIS_BROWSER_BIN" --version

      - name: Browser-run AI Core QA evidence
        run: npm run qa:seis-core:ai-core-evidence

      - name: Upload browser evidence artifacts
        if: always()
        uses: actions/upload-artifact@<approved-pinned-sha>
        with:
          name: seis-core-ai-core-panel-navigation
          path: reports/tmp/seis-core-ai-core-panel-navigation/
          if-no-files-found: error
          retention-days: 7
```

## Activation Requirements

- Keep this as review-only documentation until CI behavior change is approved.
- Replace `actions/upload-artifact@<approved-pinned-sha>` with a reviewed,
  pinned action SHA before activation.
- Confirm the selected runner image provides the expected Chrome/Chromium
  binary or add an approved pinned setup step.
- Keep `permissions.contents` read-only.
- Keep `SEIS_PRIVACY_MODE=local-only` and `SEIS_DATA_MODE=mock`.
- Keep the job provider-free, SSH-free, deployment-free, payment-free, and
  infrastructure-mutation-free.
- Keep artifact retention short and bounded.

## Timeout Policy

- The job timeout is bounded at 8 minutes in the draft.
- The browser runner's scenario timeout remains the source-level guard.
- Timeout is a failed evidence result, not a skipped pass.
- Repeated retries must not be added without a documented retry budget.

## Artifact Policy

- Artifacts are limited to `reports/tmp/seis-core-ai-core-panel-navigation/`.
- `reports/tmp/` remains ignored by Git and must not become committed source.
- Uploaded artifacts must not contain provider keys, SSH data, private
  configuration, deployment logs, live provider responses, or repository
  secrets.
- Browser artifacts remain QA evidence only; they do not prove backend
  integration, live provider routing, model safety, benchmarks, deployment
  readiness, or SEIS-owned model training.

## Failure Semantics

- Missing Chrome/Chromium binary is an environment prerequisite failure.
- Failed scenario IDs, viewports, step order, panel counts, safety flags,
  artifact paths, or non-claims are evidence drift.
- Upload artifact failure means the evidence package is incomplete.
- Failure output must not be converted into fake success.

## Non-Claims

This draft does not enable live providers, embeddings, persistent memory writes,
raw-content return, GitHub write actions, SSH, deployment, payment,
infrastructure mutation, benchmark execution, model training, checkpoint
publication, or dataset download.

## Related Documents

- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `docs/evals/evaluation-strategy.md`
- `packages/evals/README.md`

## Next Safe Action

Review the draft as a CI behavior change proposal. Only after approval, create
an active `.github/workflows/ai-core-browser-evidence.yml` change with pinned
actions and the same safety boundaries.
