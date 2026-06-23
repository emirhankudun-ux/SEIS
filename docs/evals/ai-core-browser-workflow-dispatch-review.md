# AI Core Browser Workflow Dispatch Review

## Purpose

Record the first GitHub Actions dispatch availability check for the manual AI
Core Browser Evidence workflow.

## Scope

This review covers only the workflow dispatchability of
`.github/workflows/ai-core-browser-evidence.yml` on branch
`seis/ai-core-app-foundation-continuation`.
Canonical dispatch invariant: branch-protection decision requires first-run
GitHub evidence.

It does not run live providers, SSH, deployment, payment, infrastructure
mutation, benchmark execution, model training, checkpoint publication, dataset
download, or branch-protection changes.

## Current Status

The workflow file exists on the feature branch and is pushed to GitHub, but it
is not visible to GitHub Actions as a dispatchable workflow until it exists on
the repository default branch.

PR #44 now exists for the feature branch, but GitHub reports the pull request as
`CONFLICTING` against `main`. That means the default-branch workflow dispatch
step remains blocked until conflict resolution is reviewed and a human-approved
merge places the workflow file on the default branch.

Attempted command:

```bash
gh workflow run ai-core-browser-evidence.yml --ref seis/ai-core-app-foundation-continuation
```

Observed result:

```text
HTTP 404: workflow ai-core-browser-evidence.yml not found on the default branch
```

## Interpretation

No GitHub Actions run was created. No browser artifacts were uploaded. This is a
workflow visibility blocker, not a browser QA failure and not a product failure.

The manual workflow still needs conflict-resolution review, normal PR review,
and human-approved merge before `workflow_dispatch` can create first-run GitHub
evidence.

## Evidence Requirements For The Next Step

After the workflow is present on the default branch, the next dispatch attempt
must collect:

- GitHub run ID.
- Branch/ref used for the run.
- Workflow name and workflow file path.
- Job result.
- Chrome/Chromium verification output category, without private data.
- Artifact package name.
- Artifact retention value.
- Confirmation that artifacts are limited to
  `reports/tmp/seis-core-ai-core-panel-navigation/`.
- Confirmation that no provider keys, SSH data, deployment logs, private
  configuration, live provider responses, or repository secrets are present in
  artifacts.

## Security Boundaries

The workflow must remain:

- workflow_dispatch only
- read-only for repository contents
- provider-free
- SSH-free
- deployment-free
- payment-free
- infrastructure-mutation-free
- secret-free
- local-only
- mock-data-only

## Non-Claims

This dispatch review does not prove live provider routing, live retrieval,
backend integration, cross-browser certification, benchmark performance, model
safety, SEIS-owned model training, checkpoint validity, deployment readiness, or
production availability.

## Related Documents

- `.github/workflows/ai-core-browser-evidence.yml`
- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `reports/evals/ai-core-fixture-evaluation-report.md`

## Next Safe Action

Use `docs/reviews/SEIS_AI_CORE_PR44_CONFLICT_RESOLUTION_REVIEW.md` to resolve
PR #44 through reviewed file classes before any merge attempt. After conflict
resolution and human-approved merge place
`.github/workflows/ai-core-browser-evidence.yml` on the default branch, run the
manual workflow with `workflow_dispatch`, inspect the uploaded artifact package,
and record first-run evidence before any branch-protection decision.
