# PR 127 Security Remediation Plan

Status: owner-approval-required.

Mode: plan-only-redacted-no-raw-values.

Decision: NO-GO until owner-approved remediation is completed and GitHub
security checks pass.

PR: https://github.com/emirhankudun-ux/SEIS/pull/127

Source contract:
`content/development/seis-public-demo-security-remediation-plan-pr127.json`

## Scope

This plan covers only the Second Brain readiness / agent registry release-gate
slice. It does not approve private Obsidian imports, live AI provider routing,
autonomous agent writes, SSH, deployment, Pages publication, merge, or public
release.

The current tree is recorded as `clean-redacted-no-git` in the security gate
artifact. The blocking state is the full-history GitHub security gate, reported
through `Secret & Vulnerability Scan` and `Security Summary`.

## Allowed Before Approval

- Keep redacted security gate and security owner handoff artifacts current.
- Update docs with the blocked PR #127 security status.
- Run local readiness validators.
- Prepare owner decision checklists.
- Review GitHub check names and conclusions without storing raw finding values.

## Requires Owner Approval

- History rewrite or affected path purge.
- Credential rotation or non-secret attestation.
- `.gitleaks.toml` policy change.
- Force push after an approved history rewrite.
- Merge or release after Security Summary passes.

## Forbidden Without Owner Approval

- Printing raw finding values.
- Downloading or committing full CI job logs.
- Blanket-allowlisting historical generated bundles.
- Weakening Secret & Vulnerability Scan.
- Rewriting history.
- Force-pushing rewritten history.
- Merging PR #127.
- Publishing a public demo release.

## Owner Decision Sequence

1. Confirm that published remediation evidence may use only redacted
   categories, paths, counts, and commit refs.
2. Decide whether affected historical credential-like material must be rotated
   or can be attested as non-sensitive fixture data.
3. Choose history rewrite, affected path purge, or reviewed security baseline.
4. Review any scanner policy change separately and reject broad allowlists.
5. Allow merge or release only after GitHub security checks, reviews, and the
   release checklist all pass.

## Post-Approval Runbook

This document does not authorize command execution by itself. After explicit
owner approval, the remediation operator should:

1. Freeze release gates and keep PR #127 unmerged.
2. Produce a redacted remediation record with no raw finding values.
3. Execute only the approved history or baseline route in a separate security
   remediation branch or controlled maintenance window.
4. Rerun GitHub security checks and local Second Brain readiness gates.
5. Request release-owner review before any merge or publication.

## Validation Required After Remediation

```bash
npm run check:seis-public-demo-security-gate
npm run check:seis-security-owner-handoff
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain
git diff --check
```

GitHub must also show `Secret & Vulnerability Scan`, `Security Summary`,
required CodeQL checks, and review gates as passing or non-blocking before any
merge or public release.

## Safety Boundary

The plan stores no raw finding values, no full security logs, no private key
bodies, and no private Obsidian content. It performs no scanner policy change,
allowlist commit, history rewrite, force push, secret rotation, GitHub mutation,
provider call, SSH, deployment, release approval, or merge.
