# Public Demo Release Checklist After PR 54 Review

Date: 2026-06-24

## Purpose

Define the release gate for a public SEIS demo after PR #54 review.

PR: https://github.com/emirhankudun-ux/SEIS/pull/54

Source contract:
`content/development/seis-public-demo-release-checklist-pr54.json`

## Current Decision

Status: review-gated-not-released.

Release decision: not ready until checklist gates pass.

PR #54 can be reviewed as a product implementation milestone. It must not be
treated as approval to merge, deploy, publish GitHub Pages, import a private
Obsidian vault, enable live provider routing, or claim production readiness.

Do not merge PR #54 or publish the public demo until this checklist is reviewed
and explicitly approved.

## Required Validation

```bash
npm run check:seis-second-brain
npm run check:seis-second-brain-browser-smoke
npm run check:seis-second-brain-readiness-contracts
npm run check:desktop-os
npm run check:desktop-os-browser-smoke
npm run check:seis-ultimate-demo
npm run check:product-experience-browser-smoke
npm run check:seis-fullstack-contract
npm run check:seis-fullstack-server-smoke
npm run check:seis-fullstack-no-server-fallback-smoke
npm run check:seis-model-scaling-hardware-profile
npm test
git diff --check
```

## Required Reviews

- PR #54 code review.
- Second Brain accessibility/focus QA.
- Obsidian safe import contract review.
- Provider-neutral read-only model-router boundary review.
- Security/no-secret review.
- Mock versus real status review.
- Public docs clarity review.
- Release rollback review.

## Blocked Without Approval

- Merge to `main`.
- GitHub Pages publication.
- Public release tag.
- Obsidian private vault import.
- Live provider routing.
- SSH execution.
- Deployment.
- Production-readiness claims.

## Go / No-Go Criteria

Release can move forward only when:

- all required validation passes on the release candidate,
- the worktree has no unrelated release-blocking dirty files,
- no secret-like values or private vault content are committed,
- Second Brain import and accessibility gates are documented,
- router remains read-only and provider-neutral,
- mock, local demo, planned, disabled, and real states are labelled,
- human owner approves release.
