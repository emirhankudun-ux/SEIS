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

## Go / No-Go Gate

Use the read-only public demo gate before any release decision:

```bash
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
```

Current expected decision is `NO-GO` until the worktree is reviewed, current
browser-smoke evidence exists, and the human owner explicitly approves release.
The strict form is intended for final release review and exits non-zero until
every release blocker is resolved:

```bash
npm run check:seis-public-demo-go-no-go:strict -- --run-fast-checks --approved --browser-smoke-current-run
```

The gate is read-only. It does not push, merge, tag, deploy, publish GitHub
Pages, import an Obsidian vault, execute SSH, or call model providers.

To write a review artifact for PR notes or release review:

```bash
npm run report:seis-obsidian-safe-import-dry-run
npm run report:seis-read-only-model-router-decision
npm run report:seis-second-brain-accessibility-focus-report
npm run report:seis-second-brain-agent-registry
npm run report:seis-second-brain-public-reviewer-pack
npm run report:seis-public-demo-security-gate
npm run report:seis-security-owner-handoff
npm run report:seis-public-demo-go-no-go
```

The Obsidian dry-run command writes
`reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json` and
`reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md` from
repo-owned seed note metadata only. It records that no private Obsidian vault
was read, `selectedByUser` is false, `humanApprovalState` is `not-requested`,
and body import remains `metadata-only-by-default`.

The read-only router decision command writes
`reports/seis-public-demo/read-only-model-router-decision-latest.json` and
`reports/seis-public-demo/read-only-model-router-decision-latest.md` from
installed AI profile fixtures only. It records provider states, blocked reasons,
explicit fallback policy, and `executionPerformed: false` without validating
credentials, calling providers, storing prompt bodies, routing private Obsidian
content, using silent fallback, or approving live routing.

The accessibility/focus QA command writes
`reports/seis-public-demo/second-brain-accessibility-focus-latest.json` and
`reports/seis-public-demo/second-brain-accessibility-focus-latest.md`. It
validates repo-static ARIA/focus markers and browser-smoke mobile target audit
coverage while keeping manual keyboard transcript, screen-reader transcript,
reduced-motion review note, and human accessibility approval blocked until
reviewed.

The Second Brain agent registry command writes
`reports/seis-public-demo/second-brain-agent-registry-latest.json` and
`reports/seis-public-demo/second-brain-agent-registry-latest.md`. It joins
installed AI profiles, AI workforce assignments, managed sub-agent lanes, the
12-agent roster, Obsidian bridge boundaries, plugin inventory, MCP surfaces, and
connector activation policy while keeping live provider routing, private vault
reads, autonomous writes, credential validation, SSH, deployment, GitHub
mutation, and release approval disabled.

The Second Brain public reviewer pack command writes
`reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json` and
`reports/seis-public-demo/second-brain-public-reviewer-pack-latest.md`. It gives
GitHub reviewers a no-key local review path for the Second Brain slice, with
review surfaces, required confirmations, and blocked actions while keeping
private Obsidian import, live provider routing, autonomous writes, SSH,
deployment, GitHub Pages publication, merge, and release approval disabled.

The public demo security gate command writes
`reports/seis-public-demo/security-gate-redacted-latest.json` and
`reports/seis-public-demo/security-gate-redacted-latest.md`. It records the
PR #104 security blocker using only redacted categories, paths, commit IDs, and
counts. It also keeps PR #127 listed as an active security gate impact while
`Secret & Vulnerability Scan` and `Security Summary` fail on the same
full-history blocker. It keeps the current-tree scan clean, the full-history
blocker visible, and approval requirements explicit without storing raw secret
values, weakening `.gitleaks.toml`, downloading full job logs, rewriting
history, force-pushing, or approving release.

The security owner handoff command writes
`reports/seis-public-demo/security-owner-handoff-latest.json` and
`reports/seis-public-demo/security-owner-handoff-latest.md`. It turns the
PR #104 and PR #127 full-history blocker impact into explicit owner decisions
and agent assignments without storing raw finding values, downloading full CI
logs, changing scanner policy, rewriting history, force-pushing, importing
private Obsidian content, calling providers, or approving release.

This writes `reports/seis-public-demo/go-no-go-latest.json`,
`reports/seis-public-demo/go-no-go-latest.md`, and
`reports/seis-public-demo/evidence-manifest-latest.json` with the current
read-only decision, blockers, fast validation results, evidence status, and
next actions. It also writes the PR #54 review packet at
`reports/seis-public-demo/pr54-review-packet-latest.md` and the worktree review
at `reports/seis-public-demo/worktree-review-latest.md`, plus the read-only
stage plan at `reports/seis-public-demo/pr54-stage-plan-latest.md`.

## PR #54 Review Packet

The PR #54 review packet is required before release. It must answer whether the
candidate has current browser-smoke evidence, whether the dirty worktree is a
coherent release-candidate slice, whether the human owner explicitly approved
public release, and whether Obsidian import, live provider routing, SSH,
deployment, and GitHub publication remain disabled unless separately approved.

The allowed outcomes are `NO-GO review-gated-not-released` or `GO after strict
gate, current browser evidence, clean review, and explicit approval`.

## Worktree Review

The worktree review is required because a dirty tree stays release-blocking
until reviewed. It classifies dirty paths into the Second Brain readiness slice
and separate workstreams such as NVIDIA catalog intake, Google Workspace
integration, and reference-bank/Linux Replica work. It does not stage, commit,
delete, reset, push, merge, or approve release.

## Stage Plan

The stage plan is required before any commit. It lists candidate paths for the
Second Brain readiness / PR #54 gate slice, explicitly excludes separate
workstreams, and prints human-run `git add -- ...` commands for review. The plan
does not execute Git, stage files, commit, push, merge, delete, reset, deploy,
import Obsidian, execute SSH, or call model providers.

## Required Validation

```bash
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
npm run report:seis-obsidian-safe-import-dry-run
npm run check:seis-obsidian-safe-import-dry-run
npm run report:seis-read-only-model-router-decision
npm run check:seis-read-only-model-router-decision
npm run report:seis-second-brain-accessibility-focus-report
npm run check:seis-second-brain-accessibility-focus-report
npm run report:seis-second-brain-agent-registry
npm run check:seis-second-brain-agent-registry
npm run report:seis-second-brain-public-reviewer-pack
npm run check:seis-second-brain-public-reviewer-pack
npm run report:seis-public-demo-security-gate
npm run check:seis-public-demo-security-gate
npm run report:seis-security-owner-handoff
npm run check:seis-security-owner-handoff
npm run report:seis-public-demo-go-no-go
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
- Redacted PR #104 security gate review.
- PR #127 active security gate impact review.
- Security owner handoff review.
- Second Brain public reviewer pack review.
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
- Secret & Vulnerability Scan historical findings have approved remediation or
  reviewed security baseline,
- security owner handoff decisions are reviewed before any history rewrite,
  force push, scanner policy change, or release override,
- Second Brain import and accessibility gates are documented,
- GitHub reviewers can inspect the Second Brain slice without provider keys or
  private Obsidian data,
- router remains read-only and provider-neutral,
- mock, local demo, planned, disabled, and real states are labelled,
- human owner approves release.
