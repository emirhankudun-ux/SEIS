# PR Draft: SEIS AI Command Core Desktop Demo

Title:

```text
feat: add SEIS AI Command Core desktop demo
```

Base branch: `main`

Head branch: `seis/ai-demo-app-foundation`

## Summary

This PR adds a local, deterministic SEIS AI Command Core demo across the Apple
desktop and web companion surfaces. It gives SEIS a reviewable AI operating
interface for request composition, model routing, supervised agents, prompt
versions, evidence, evaluation scores, approvals, settings, and local audit
history without requiring provider credentials or live model calls.

## Scope

- [x] AI / agents / MCP / skills / plugins / LLM workflows
- [x] Engineering / platform / full stack / mobile / desktop
- [ ] Data / ML / governance / observability
- [x] Design systems / UX / accessibility / calm technology
- [x] Documentation / open source governance
- [x] Security / dependency / infrastructure

## Architecture Fit

The change keeps the demo bounded inside existing SEIS surfaces:

- `packages/seis_platform_swift` owns the SwiftPM desktop product and shared
  deterministic contract.
- `apps/macos/seis-ai-command-core` documents the Apple-native run path.
- `apps/seis-ai-demo` provides a static web companion for the same operating
  model.
- `.github/workflows/seis-ai-command-core.yml` runs the focused PR gate on
  demo-related changes.

No provider SDK, secret store, deployment target, signing identity, or new
runtime dependency is introduced.

## Master Prompt Alignment

- [x] Protects existing user work and avoids destructive actions without
  explicit maintainer approval.
- [x] Prioritizes security, privacy, architecture, documentation, and validation
  before feature scope.
- [x] Uses the SEIS Master Prompt change checklist path through focused
  documentation, release-readiness notes, and publish gate validation.

## Validation

Checks run locally:

```bash
npm run check:seis-ai-command-core
npm run check:publish-gate-contract
npm run check:foundation
npx eslint scripts/automation-publish-readiness.cjs apps/seis-ai-demo/script.js apps/seis-ai-demo/test/seis-ai-demo-static.test.js
node --check scripts/automation-publish-readiness.cjs
node --check apps/seis-ai-demo/script.js
node --check apps/seis-ai-demo/test/seis-ai-demo-static.test.js
git diff --check
npm run automation:publish-readiness
```

Expected publish-readiness result on this branch:

- `npm run automation:publish-readiness` remains blocked because the active
  branch is not `main`.
- This is expected; it prevents a false direct-publish claim before review and
  merge.

## Seçtiğiniz Kapılar

- [x] Doğrulama Metrikleri Kapısı
  - `npm run check:seis-ai-command-core`, `npm run check:foundation`, and
    `npm run check:publish-gate-contract` passed locally.
- [x] Güvenlik Kapısı
  - The demo stays local and deterministic, requests no provider credentials,
    and performs no SSH/deploy/destructive actions.
- [x] Docs Kapısı
  - Release boundary, publish gate behavior, and recovery/foundation status are
    documented.
- [x] Rollback Kapısı
  - Revert the two feature/release-gate commits or remove the demo paths,
    workflow, and publish-gate branch entry before merge.

PR type: Feature / AI / Desktop / Documentation / CI

Module impact: Apps / macOS / AI Command Core / Publish gate

Risk level: P2

AI impact: Local deterministic demo only; human approval remains required for
publish, deployment, credentials, provider calls, and merge.

Rollback scenario: Revert `9c9e7b0` and `e2d1167`, then rerun
`npm run check:foundation` and `npm run check:publish-gate-contract`.

## Risk

- Security or privacy impact: low; no secrets, provider API keys, live model
  calls, SSH commands, or deployment actions are introduced.
- Dependency or runtime impact: low; the change uses existing Node, SwiftPM,
  SwiftUI, shell, and GitHub Actions surfaces.
- Rollback plan: revert the two commits and remove the review branch from the
  publish gate contract if the PR is abandoned.

## Checklist

- [x] Targets `main` through a short-lived branch or fork PR.
- [x] Keeps the change small, reversible, and reviewable.
- [x] Updates docs when behavior, policy, or user workflow changes.
- [x] Does not commit secrets, private data, `.env` files, or credentials.
- [x] Does not install unused SDKs, runtimes, or dependencies.
- [x] Does not claim validation that was not actually run.
- [x] Discloses material AI assistance when relevant.

## AI Assistance Disclosure

Primary implementation and verification were performed through Codex. A
multi-agent reviewer was attempted for the diff review, but the reviewer did
not return findings before timeout/shutdown, so local validation and direct
diff review are the evidence used for this PR draft.

## Push and PR Handoff

The branch is local and ahead of `origin/main`. Do not run these commands until
the maintainer explicitly approves push/PR creation:

```bash
git push -u origin seis/ai-demo-app-foundation
gh pr create \
  --base main \
  --head seis/ai-demo-app-foundation \
  --title "feat: add SEIS AI Command Core desktop demo" \
  --body-file docs/reviews/seis-ai-command-core-pr-draft.md
```
