# SEIS AI Command Core Release Readiness

This document defines the release-readiness surface for the local SEIS AI
Command Core demo.

## Scope

The release candidate includes:

- `SeisAICommandCore`, the SwiftUI desktop product in
  `packages/seis_platform_swift`
- `apps/macos/seis-ai-command-core/`, the desktop app runbook
- `apps/seis-ai-demo/`, the deterministic web companion demo
- `.github/workflows/seis-ai-command-core.yml`, the PR and `main` validation
  workflow

The release candidate is intentionally local and deterministic. It does not
call a live model provider, request provider credentials, execute SSH commands,
deploy infrastructure, or perform destructive repository actions.

## Required Checks

Run the full demo gate from the repository root:

```bash
npm run check:seis-ai-command-core
```

The gate covers:

- static web companion tests
- Swift package tests
- SwiftPM build for the `SeisAICommandCore` product
- local `.app` bundle verification through `./script/build_and_run.sh --ai-demo --verify`

The same gate runs in GitHub Actions on pull requests that touch the desktop
demo, web companion, Swift package, run script, or workflow.

## Publish Gate

`seis/ai-demo-app-foundation` is documented as an accepted local review branch
for this release candidate. That only allows local validation, commit creation,
and PR readiness reporting.

Actual publication remains blocked until:

- the accepted work is reviewed and merged to `main`
- `main` tracks `origin/main`
- the worktree is clean
- GitHub authentication is available
- `npm run automation:publish-readiness` reports no blockers

Deployment or external distribution still requires a confirmed target, owner,
rollback path, and human approval.

## Distribution Boundary

This is a repository release candidate, not a notarized macOS distribution.
The generated app bundle is suitable for local verification and PR review. A
future public macOS release must add signing, notarization, versioned artifact
retention, release notes, and rollback instructions before claiming production
desktop distribution readiness.
