# GitHub PR Queue Readiness

Last updated: 2026-06-30

This document is the current review map for the SEIS GitHub pull request queue.
It complements the older consolidation review by recording the active
post-SSH-clone state without closing, merging, or rewriting branches by default.

## Current Queue Shape

The current public queue has three high-priority verified draft replacements:

| PR | Branch | Status | Purpose |
| --- | --- | --- | --- |
| #76 | `codex/ssh-signing-readiness-verified-20260630` | Draft, mergeable, GitHub-verified commit | Documents the SEIS-SSH signing readiness gate. |
| #77 | `codex/security-history-remediation-verified-20260630` | Draft, mergeable, GitHub-verified commit | Adds the generated source bundle guard and remediation note. |
| #78 | `codex/ci-foundation-status-refresh-verified-20260630` | Draft, mergeable, GitHub-verified commit | Refreshes stale CI foundation status docs. |

Older unverified drafts #73, #74, and #75 were superseded by #78, #77, and #76
respectively. They should not be reopened unless the replacement PRs are first
reviewed and rejected.

## Blocking Signal

The shared blocker for the verified replacement PRs is the Security Guardian full-history Gitleaks scan.
It is currently triggered by legacy generated bundle history under:

```text
sources/github-unified-source/_generated/
```

Do not paste, summarize, or reprint detected values from the logs. Treat the
findings as sensitive until the owner decides whether the historical values were
real, synthetic, already rotated, or require further private review.

## Owner Decisions Needed

1. Choose the owner-approved remediation path for the legacy full-history
   Gitleaks findings.
2. Decide whether verified draft PRs #76, #77, and #78 should remain draft until
   the full-history scan is resolved.
3. Keep future Codex SSH-clone commits on GitHub-verified SSH signing with the
   account-linked email.
4. Continue closing duplicate unverified drafts only when a verified replacement
   exists and the superseded content is materially the same.

## Merge Queue Rules

- Do not push directly to `main`.
- Do not force-push rewritten signed commits without explicit owner approval.
- Do not weaken `.gitleaks.toml`, the security workflow, or secret scanning just
  to make a PR green.
- Do not merge stale or conflicting PRs wholesale.
- Prefer small replacement PRs with current checks, verified signatures, and a
  clear rollback path.

## Recommended Next Actions

1. Review #77 first because it records the legacy generated-bundle security
   blocker without weakening scanning.
2. Review #76 next because it preserves the SSH signing readiness gate for all
   future Codex work.
3. Review #78 after #76/#77 because it is a status-doc alignment slice.
4. Use the older open PR consolidation record only as historical context; verify
   each old PR against current `main` before extracting anything.

## Validation

Run:

```bash
npm run check:github-pr-queue-readiness
npm run check:open-source-governance
git diff --check
```

This check is documentation-only. It does not call GitHub, close PRs, merge
branches, rewrite history, open SSH, deploy, or print secret values.
