# AI Core Browser CI Proposal

## Purpose

Define the review-ready proposal for running browser-run AI Core QA evidence in
GitHub Actions without changing the current metadata-only CI gate.

## Scope

This proposal covers only `npm run qa:seis-core:ai-core-evidence` for
`apps/seis-core`. It does not enable the command in CI by itself.

## Current Status

The active CI workflow runs `npm run quality:governance`, which includes
metadata-only AI Core evidence checks such as
`npm run check:ai-core-browser-qa-evidence` through the governance chain. It
does not install Chrome/Chromium and does not run browser-required QA commands.

## Proposed Browser-Enabled Workflow Shape

A future, separately reviewed workflow may run the browser artifact gate only
after all of these conditions are met:

1. The workflow installs or provides a pinned Chrome/Chromium-compatible binary.
2. `SEIS_BROWSER_BIN` is set when auto-detection is not reliable.
3. The workflow runs `npm run qa:seis-core:ai-core-evidence`.
4. Artifacts under `reports/tmp/seis-core-ai-core-panel-navigation/` are treated
   as temporary QA evidence, not committed source files.
5. The job timeout is long enough for browser startup but short enough to fail
   closed on hangs.
6. The workflow remains provider-free, SSH-free, deployment-free, payment-free,
   and infrastructure-mutation-free.

## Recommended Commands

Metadata-only CI gate:

```bash
npm run check:ai-core-eval-evidence
```

Browser-enabled CI candidate:

```bash
npm run qa:seis-core:ai-core-evidence
```

Local browser verification:

```bash
SEIS_BROWSER_BIN=/path/to/chrome npm run qa:seis-core:ai-core-evidence
```

## Timeout Policy

- Keep the workflow job timeout bounded.
- Preserve the browser runner's internal 45 second scenario timeout.
- Treat timeout as failed evidence, not as a skipped pass.
- Do not retry in a loop without a documented retry budget.

## Artifact Policy

- `reports/tmp/` remains ignored by Git.
- Browser DOM dumps and JSON reports may be uploaded as CI artifacts only after
  review.
- Uploaded artifacts must not contain provider keys, private keys, raw private
  configuration, live provider responses, repository secrets, SSH data, or
  deployment logs.
- Browser artifacts do not prove backend integration, live provider routing,
  benchmark results, model safety, or deployment readiness.

## Failure Semantics

- Missing browser binary means the browser-enabled job failed its environment
  prerequisite.
- Failed panel counts, step order, safety flags, or non-claims mean evidence
  drift.
- Metadata-only CI must remain usable even when browser-enabled evidence is not
  configured.
- Browser evidence failures must not be converted into fake success or
  overbroad production-readiness claims.

## Approval Boundary

Enabling browser artifact evidence in GitHub Actions is a CI behavior change and
must be reviewed separately. This proposal does not authorize live providers,
GitHub write actions, SSH, deployment, payment, infrastructure mutation,
benchmark execution, model training, checkpoint publication, or dataset
download.

## Acceptance Criteria For A Future CI Change

- Chrome/Chromium setup is explicit and reproducible.
- `npm run check:ai-core-eval-evidence` still runs as metadata-only CI evidence.
- `npm run qa:seis-core:ai-core-evidence` runs only in the browser-enabled job.
- The review-only workflow draft in
  `docs/evals/ai-core-browser-ci-workflow-draft.md` is approved before an
  active `.github/workflows/` workflow is added.
- The approval packet in
  `docs/evals/ai-core-browser-ci-activation-approval.md` is accepted before an
  active workflow PR is prepared.
- `reports/tmp/` artifacts remain ignored and are not committed.
- Provider, SSH, deployment, payment, and infrastructure mutation remain absent.
- Failure output explains whether the issue is missing browser setup or evidence
  drift.

## Related Documents

- `docs/evals/ai-core-browser-evidence-gates.md`
- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `docs/evals/evaluation-strategy.md`
- `apps/seis-core/README.md`

## Next Safe Action

Review the non-active workflow draft in
`docs/evals/ai-core-browser-ci-workflow-draft.md` and the activation approval
packet in `docs/evals/ai-core-browser-ci-activation-approval.md`. Create a
separate active CI workflow change only if human approval confirms the
repository is ready to pin and maintain a Chrome/Chromium setup for browser
artifact evidence.
