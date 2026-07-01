# Gitleaks Owner Decision Pack

Date: 2026-07-01

## Purpose

This pack gives a maintainer-safe decision path for the repository-level
Gitleaks history blocker tracked in GitHub issue #129. It does not include
secret values, does not weaken scanning, and does not approve a merge bypass.

## Current Evidence

- Blocking checks: `Secret & Vulnerability Scan` and `Security Summary`.
- Affected PRs: #77 and #126.
- Historical commit: `f3d385d6`.
- Historical path: `sources/github-unified-source/_generated/github-code-bundle.txt`.
- Current working tree: the generated bundle path is not present.
- Existing guardrail: PR #77 prevents generated unified-source bundles from
  returning to tracked source control.

## Non-Negotiables

- Do not paste detected values into issues, PR comments, docs, prompts, logs,
  screenshots, or handoff files.
- Do not force push.
- Do not disable SEIS Guardian.
- Do not apply broad `.gitleaks.toml` allowlists without explicit owner
  approval.
- Do not merge blocked PRs by bypassing the failed security check.
- Treat all findings as sensitive until the owner completes private review or
  confirms rotation.

## Decision Path A: Rotate And Rewrite History

Use this when the owner cannot prove that every historical finding is synthetic
or already invalid.

Owner actions:

1. Privately inspect the original findings without copying values into public
   artifacts.
2. Rotate any credential class that may have been real.
3. Run an owner-approved history rewrite plan from a clean protected-branch
   maintenance window.
4. Coordinate branch protection, open PR rebases, release tags, and contributor
   clone recovery.
5. Re-run full-history Gitleaks and all required branch checks.

Expected result:

- The full-history scan can remain strict.
- PR #77 and PR #126 become mergeable after rebasing or refreshing checks.

Risks:

- History rewrite affects contributors and open branches.
- Requires disciplined announcement and recovery instructions.

## Decision Path B: Keep Scheduled Full-History, Use PR Range Scans

Use this when the owner wants full-history scanning as a scheduled security
reminder but does not want historical debt to block unrelated feature PRs.

Owner actions:

1. Keep scheduled SEIS Guardian full-history scans.
2. Explicitly approve pull request and push checks that scan the changed commit
   range or working tree for new leaks.
3. Document the policy difference in `SECURITY.md` and this security folder.
4. Keep issue #129 open until historical findings are privately resolved.
5. Re-run PR #77 and PR #126 checks after the policy change.

Expected result:

- New PRs remain protected from new secret leaks.
- Historical security debt remains visible through scheduled scans.

Risks:

- This is a policy change and must be owner-approved.
- Scheduled full-history failures still require owner triage.

## Decision Path C: Confirm Synthetic Or Rotated Evidence

Use this only when the owner privately verifies that all historical findings are
fixtures, examples, redacted samples, or already-rotated credentials.

Owner actions:

1. Inspect the original source privately.
2. Confirm the finding class and rotation/synthetic status without exposing
   values.
3. Add a narrow, evidence-backed note to issue #129.
4. Approve the narrowest possible scanner handling.
5. Re-run required checks.

Expected result:

- The repository has an auditable explanation for the historical findings.
- PRs can proceed without publishing sensitive values.

Risks:

- A mistaken synthetic classification can leave real credentials exposed in
  history.
- This path must be documented carefully and reviewed by the owner.

## Recommended Immediate Order

1. Keep PR #77 open and auto-merge enabled.
2. Let PR #77 remain blocked until owner decision is made.
3. Choose Path A, B, or C in issue #129.
4. Apply the chosen remediation in a dedicated security PR.
5. Re-run PR #77.
6. Re-run PR #126 after PR #77 or the security policy change lands.

## Validation Commands

Local guard:

```sh
npm run check:generated-source-bundles
```

Whitespace and docs hygiene:

```sh
git diff --check
```

GitHub evidence:

```sh
gh pr checks 77
gh pr checks 126
gh issue view 129
```

## Rollback

This document can be reverted without changing runtime behavior. Reverting it
does not remove the Gitleaks blocker, the generated bundle guard, or issue #129.

