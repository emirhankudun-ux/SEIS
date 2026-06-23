# AI Core Browser CI Activation Approval Packet

## Purpose

Define the human approval packet required before turning the review-only AI Core
browser evidence workflow draft into an active GitHub Actions workflow.

This document does not enable CI behavior. It records what must be reviewed,
approved, validated, and rollback-ready before an active workflow PR is created.
Approval required. No active workflow is created by this packet.

## Scope

This approval packet covers only the proposed
`.github/workflows/ai-core-browser-evidence.yml` workflow for
`npm run qa:seis-core:ai-core-evidence`.

It does not change `.github/workflows/ci.yml`, does not add an active workflow,
and does not authorize live providers, SSH, deployment, payment, infrastructure
mutation, benchmark execution, model training, checkpoint publication, or
dataset download.

## Current Status

- Active CI remains metadata-only through `npm run quality:governance`.
- Browser-run AI Core QA evidence is available locally through
  `npm run qa:seis-core:ai-core-evidence`.
- The review-only draft lives in
  `docs/evals/ai-core-browser-ci-workflow-draft.md`.
- This approval packet is planning evidence only, not browser QA pass evidence.

## Required Human Approval

Approval is required before any of these actions:

- Creating `.github/workflows/ai-core-browser-evidence.yml`.
- Running `npm run qa:seis-core:ai-core-evidence` in GitHub Actions.
- Adding `actions/upload-artifact` to an active workflow.
- Adding a Chrome/Chromium setup action or relying on runner browser state.
- Making browser evidence a required branch-protection check.

Approval must confirm:

- The active metadata-only workflow remains unchanged.
- The proposed browser workflow is separate and manually triggered first.
- The upload-artifact action is pinned to an approved commit SHA.
- The Chrome/Chromium binary path is verified or setup is pinned and reviewed.
- The active workflow uses contents permission only in read-only mode.
- Artifact retention is short and bounded.
- Failure semantics remain fail-closed.
- No secrets or private configuration can enter browser artifacts.

## Active Workflow PR Contents

A future active workflow PR should include exactly one active workflow file:

- `.github/workflows/ai-core-browser-evidence.yml`

The workflow should:

- Use `workflow_dispatch` for the first activation.
- Use read-only `contents` permission.
- Use existing pinned checkout and setup-node action conventions.
- Use an approved pinned SHA for `actions/upload-artifact`.
- Set `SEIS_DATA_MODE=mock`.
- Set `SEIS_PRIVACY_MODE=local-only`.
- Set `SEIS_BROWSER_BIN` only to a reviewed runner path.
- Verify the browser binary before running QA.
- Run `npm run qa:seis-core:ai-core-evidence`.
- Upload only `reports/tmp/seis-core-ai-core-panel-navigation/`.
- Retain artifacts for 7 days or less.
- Keep timeout bounded.

The PR must not change `.github/workflows/ci.yml` unless a separate approval
explicitly authorizes that change.

## Validation Plan

Before opening the active workflow PR, run locally:

```bash
npm run check:ai-core-eval-evidence
npm run qa:seis-core:ai-core-evidence
npm run check:release-sync
npm run check:language-distribution
npm run check:seis-technology-stack
git diff --check
```

The active workflow PR must preserve:

- `npm run check:ai-core-browser-qa-evidence` as a metadata-only validator.
- `npm run qa:seis-core:ai-core-evidence` as the browser artifact gate.
- `reports/tmp/` as ignored generated evidence.
- `browserUiEvaluationCount` at `2` unless a separate browser QA expansion is
  reviewed.
- Planning documents as source documents only, not browser UI pass evidence.

## Rollback Plan

If the active workflow creates false failures, excessive runtime, artifact
leakage risk, or runner instability:

1. Disable or remove `.github/workflows/ai-core-browser-evidence.yml` in a
   follow-up PR.
2. Keep `.github/workflows/ci.yml` metadata-only.
3. Keep local `npm run qa:seis-core:ai-core-evidence` available for evidence
   regeneration.
4. Preserve browser evidence docs and validators.
5. Record the failure mode in the five-year review before retrying activation.

## Security Boundaries

The active workflow must remain:

- provider-free
- SSH-free
- deployment-free
- payment-free
- infrastructure-mutation-free
- secret-free
- local-only
- mock-data-only
- read-only for repository contents

Browser artifacts must not contain provider keys, SSH data, deployment logs,
private configuration, live provider responses, or repository secrets.

## Non-Claims

This approval packet does not prove live provider routing, live retrieval,
backend integration, cross-browser certification, benchmark performance,
model safety, SEIS-owned model training, checkpoint validity,
deployment readiness, or production availability.

## Related Documents

- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `docs/evals/evaluation-strategy.md`
- `packages/evals/README.md`

## Next Safe Action

If human approval is granted, prepare a separate PR that adds only the active
browser evidence workflow with approved pinned actions and the boundaries above.
