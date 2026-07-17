# SEIS GitHub Merge Gates

SEIS uses protected main-branch rules. Auto-merge can be enabled on a pull
request, but GitHub can still keep the PR blocked until review, signature,
linear-history, code-scanning, code-quality, and branch-update requirements are
satisfied.

Source of truth: `content/development/seis-github-merge-gates.json`.

Validator: `npm run check:seis-github-merge-gates`.

## Current protected-branch expectations

- Direct pushes to `main` are not part of the Codex workflow.
- Force push and history rewrite are forbidden.
- Preferred merge method is squash merge.
- Pull requests need human review before protected integration.
- The observed rules require 10 approving reviews.
- Code owner review is required.
- Last-push approval is required.
- Review thread resolution is required.
- Signed commits and linear history are part of the protected-main gate.
- CodeQL, code quality, security, governance, and readiness checks must not be blocking.

## Why auto-merge can remain blocked

Auto-merge is a queue request, not a permission bypass. If GitHub reports a PR
as `mergeStateStatus: BLOCKED`, Codex should not claim the PR merged. The safe
interpretation is that at least one protected-branch requirement remains open.

Recent observed examples:

- PR #58 had auto-merge enabled and successful checks, but GitHub still reported
  `mergeStateStatus: BLOCKED`.
- PR #62 had auto-merge enabled and was also blocked by protected-branch policy
  while checks and review gates were still settling.

## Safe operator actions

- Keep work on short-lived feature branches.
- Open focused PRs with validation and rollback notes.
- Enable auto-merge when safe.
- Wait for CodeQL, security, governance, and quality checks.
- Ask human reviewers to satisfy review count, code owner review, and last-push approval.
- Continue independent work in separate branches when the blocker is review-only.

## Forbidden actions for Codex

- Do not use admin merge bypass without explicit PR-specific owner approval.
- Do not weaken branch protection to make a PR merge faster.
- Do not force push.
- Do not push directly to `main`.
- Do not rewrite history.
- Do not claim a PR merged until GitHub reports `mergedAt` and a merge commit.

## Review checklist

- PR has a clear scope and rollback plan.
- Required checks are passing or their failures are documented.
- Human reviewers have enough context to approve.
- Code owner review is satisfied.
- Last-push approval is satisfied.
- No admin bypass was used.
