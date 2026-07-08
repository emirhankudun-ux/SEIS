# SEIS Second Brain

## Purpose

SEIS Second Brain is the local knowledge operating layer for SEIS. It connects
an Obsidian-style Markdown vault, installed AI profiles, bounded sub-agent
lanes, SEIS Search, Files, and GitHub readiness gates without requiring cloud
AI provider keys.

This is a browser-local Local Demo foundation. It does not import a private
Obsidian vault, install an Obsidian plugin, execute SSH, deploy, push, merge,
or call a live model provider.

Validator markers: bounded sub-agent lanes are Local Demo/status-plan-only, and
SEIS Second Brain does not import a private Obsidian vault.

## Current Scope

Current implementation lives in:

- `apps/web/desktop.js`
- `apps/web/desktop.css`
- `content/development/seis-second-brain-system.json`
- `content/development/seis-obsidian-bridge-safe-import-contract.json`
- `content/development/seis-agi-independent-evidence-ledger.json`
- `content/development/seis-second-brain-accessibility-focus-qa.json`
- `content/development/seis-public-demo-release-checklist-pr54.json`
- `scripts/check-seis-second-brain.mjs`
- `scripts/check-seis-second-brain-readiness-contracts.mjs`
- `scripts/check-seis-second-brain-browser-smoke.mjs`
- `scripts/create-seis-obsidian-safe-import-dry-run.mjs`
- `scripts/create-seis-read-only-model-router-decision.mjs`
- `scripts/create-seis-second-brain-accessibility-focus-report.mjs`
- `scripts/create-seis-second-brain-agent-registry.mjs`
- `scripts/create-seis-second-brain-public-reviewer-pack.mjs`
- `scripts/create-seis-public-demo-security-gate-report.mjs`
- `scripts/create-seis-security-owner-handoff.mjs`
- `scripts/check-seis-agi-independent-evidence-ledger.mjs`
- `docs/product/seis-obsidian-bridge-safe-import.md`
- `docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md`
- `docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md`

The desktop app opens as `second-brain` and is linked from System OS, SEIS
Search, SEIS AI, Command Center, Launchpad, Favorites, and desktop shortcuts.

## Working Local Demo Behavior

| Capability | Current status | Evidence |
| --- | --- | --- |
| Markdown vault | Browser-local Local Demo | Seed notes render under `/home/seis/SecondBrain`; `Save Vault Snapshot` writes note files and `seis-second-brain-vault-snapshot.md` into the browser VFS. |
| Knowledge graph | Browser-local Local Demo | Graph nodes and backlinks are generated from repo-owned seed records; `Link Graph` writes `graph-links.json`. |
| Agent training pack | Local Demo read-only | `Build Training Pack` writes `/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md` with Obsidian, accessibility, router, PR #54 checklist, and language model training curriculum summaries. |
| Public contributor onboarding pack | Local Demo no-key | `Build Contributor Pack` writes `/home/seis/SecondBrain/08-public/seis-public-contributor-onboarding.md` so GitHub reviewers can inspect the browser-local Second Brain, installed AI registry evidence, sub-agent roster, Obsidian boundary, and blocked release gates without API keys, provider login, private Obsidian vault access, SSH, deployment, or GitHub write access. |
| Obsidian starter vault | Local Demo no-key | `Export Obsidian Starter Vault` writes `/home/seis/SecondBrain/09-obsidian/seis-obsidian-starter-vault-manifest.json` and `/home/seis/SecondBrain/09-obsidian/seis-obsidian-starter-vault.md` from repo-owned seed note metadata and generated browser-local Markdown only; it does not read a private Obsidian vault, install plugins, copy `.obsidian` state, copy private note bodies, call providers, mutate GitHub, execute SSH, or deploy. |
| Language model training curriculum | Planned-training contract | `content/development/seis-language-model-training-curriculum.json` and `reports/seis-model-scaling/seis-language-model-training-curriculum.md` map candidate model families, local seed-model lanes, retrieval lanes, and approval gates without installing models, downloading checkpoints, training, benchmarking, calling providers, or claiming SEIS owns a foundation model. |
| Independent AGI evidence ledger | Review-gated | `npm run check:seis-agi-independent-evidence-ledger` and `content/development/seis-agi-independent-evidence-ledger.json` keep AGI/512B public claims blocked until independent external evidence and explicit human approval are recorded. |
| Installed AI bridge | Local Demo context only | SEIS AI exposes a Second Brain tab with 6 browser runtime AI fixture profiles and the review-only agent registry evidence for 24 Second Brain profiles, 18 launcher routes, and 12 installed launcher routes. Missing Key, Disabled, missing-command, and runtime-not-ready states remain explicit. |
| read-only model-router decision artifact | Provider-neutral review-only | `npm run report:seis-read-only-model-router-decision` writes `reports/seis-public-demo/read-only-model-router-decision-latest.json` and `.md` with installed AI profile fixtures, blocked reasons, explicit fallback policy, `executionPerformed: false`, and no provider calls. |
| Second Brain agent registry artifact | Review-only | `npm run report:seis-second-brain-agent-registry` writes `reports/seis-public-demo/second-brain-agent-registry-latest.json` and `.md` by joining 24 installed AI profiles, 25 AI workforce assignments, 18 launcher routes, 12 installed launcher routes, managed sub-agent lanes, the 12-agent roster, Obsidian bridge boundaries, plugin inventory, MCP surfaces, and connector activation policy without provider calls, credential validation, private vault reads, autonomous writes, SSH, deployment, GitHub mutation, or release approval. |
| Second Brain public reviewer pack | No-key GitHub review | `npm run report:seis-second-brain-public-reviewer-pack` writes `reports/seis-public-demo/second-brain-public-reviewer-pack-latest.json` and `.md` with a GitHub reviewer quick start, review surfaces, no-key Local Demo boundary, blocked actions, and required confirmations without private Obsidian data, provider login, SSH, deployment, merge, or release approval. |
| public demo security gate redacted evidence | Review-blocking | `npm run report:seis-public-demo-security-gate` writes `reports/seis-public-demo/security-gate-redacted-latest.json` and `.md` with redacted PR #104 security gate categories, paths, counts, and approval requirements. It records current-tree clean status while keeping full-history remediation blocked without storing raw secret values, changing `.gitleaks.toml`, rewriting history, force-pushing, or approving release. |
| security owner handoff | Owner-action required | `npm run report:seis-security-owner-handoff` writes `reports/seis-public-demo/security-owner-handoff-latest.json` and `.md` with explicit human-owner security decisions, agent assignments, allowed local actions, and forbidden history/scanner/release actions. It keeps raw finding values, full CI logs, scanner policy changes, history rewrite, force push, private Obsidian import, provider calls, SSH, deployment, merge, and release approval disabled. |
| PR #127 security remediation plan | Owner-approval required | `content/development/seis-public-demo-security-remediation-plan-pr127.json` and `docs/security/PR127_SECURITY_REMEDIATION_PLAN.md` keep the active PR #127 security blocker plan-only and redacted. The plan defines approval gates, owner decisions, rollback notes, and post-remediation validation while authorizing no raw finding disclosure, full log download, scanner weakening, history rewrite, force push, merge, or release. |
| Sub-agent lanes | Status/plan-only | All 6 current managed SEIS sub-agent lanes are indexed: SEIS Hub, SEIS Cloud, SEIS-Code, SEIS-Design, SEIS-DATA, and SEIS-Security. They can review/propose only; they cannot expand permissions or mutate external systems. |
| Autonomous agent roster | Status/plan-only | The Second Brain maps the 12-agent target roster: Architect, Code, Design, UI/UX, Research, Search, Security, DevOps, Documentation, QA, Cloud, and Automation. |
| GitHub readiness | Human review required | `Export GitHub Readiness` writes a blocked-by-review readiness note; the dedicated browser-smoke checks the export and reload persistence. Push, merge, release, Pages, and public launch still require approval. |
| Obsidian bridge | Planned | Future bridge must use explicit user-selected import, provenance review, no-secret filtering, and approval before sync. |
| Obsidian bridge safe import contract | Planned-gated | `content/development/seis-obsidian-bridge-safe-import-contract.json` and `docs/product/seis-obsidian-bridge-safe-import.md` require explicit user-selected source path, dry-run manifest, no private note body commits, provenance, accessibility review, and human approval before GitHub publication. |
| Obsidian safe-import dry-run artifact | Repo-owned dry-run | `npm run report:seis-obsidian-safe-import-dry-run` writes `reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json` and `.md` from repo-owned seed note metadata only. It records `selectedByUser: false`, `humanApprovalState: not-requested`, and no private vault read. |
| Second Brain accessibility/focus QA | Contract-active | `content/development/seis-second-brain-accessibility-focus-qa.json` and `docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md` bind listbox/option roles, `aria-selected`, `aria-controls`, `aria-live polite`, focus-visible styling, inspector focus, and zero cramped mobile controls. |
| accessibility/focus QA artifact | Review-gated | `npm run report:seis-second-brain-accessibility-focus-report` writes `reports/seis-public-demo/second-brain-accessibility-focus-latest.json` and `.md` with repo-static ARIA/focus evidence, browser-smoke mobile target audit coverage, and explicit blockers for manual keyboard transcript, screen-reader transcript, reduced-motion review, and human accessibility approval. |
| Public demo release checklist | Review-gated | `content/development/seis-public-demo-release-checklist-pr54.json` and `docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md` keep PR #54 review separate from merge, Pages publication, private vault import, live provider routing, SSH, deployment, or production-readiness claims. |
| SEIS public demo go/no-go gate | Read-only NO-GO classifier | `scripts/check-seis-public-demo-go-no-go.mjs` and `npm run check:seis-public-demo-go-no-go -- --run-fast-checks` validate that public demo release remains blocked until current browser-smoke evidence, clean release-candidate review, and explicit human approval exist. |
| PR #54 review packet | Required before release | `reports/seis-public-demo/pr54-review-packet-latest.md` summarizes the go/no-go decision, evidence manifest, blockers, and required reviewer decisions without approving merge, Pages publication, release tagging, deployment, private Obsidian import, live provider routing, or SSH. |
| Worktree review packet | Required while dirty | `reports/seis-public-demo/worktree-review-latest.md` classifies the dirty worktree for PR #54 release-candidate review without staging, committing, deleting, resetting, pushing, merging, or approving release. |
| stage plan | Required before commit | `reports/seis-public-demo/pr54-stage-plan-latest.md` separates the Second Brain readiness slice from unrelated workstreams and prints human-review-only `git add -- ...` commands without executing them. |

## Safety Boundary

- Core demo requires zero provider keys.
- No API keys, tokens, cookies, private keys, service accounts, `.env` values,
  or private vault content are stored in the Second Brain records.
- The browser app does not read host Obsidian folders.
- The browser app does not execute SSH, deployment, Git push, Git merge, or
  live provider calls.
- Public GitHub use is blocked until human review verifies provenance,
  no-secret status, mock/real/planned labels, docs alignment, and validator
  evidence.

## Agent Operating Model

| Agent lane | Permission | Duty |
| --- | --- | --- |
| Architect Agent | Read and propose only | Keep vault notes aligned with SEIS OS modules and long-term architecture. |
| Code Agent | Browser-local artifacts only | Connect notes to runnable demo surfaces and validators without external mutation. |
| Design Agent | Review and annotate only | Map product experience, accessibility, and design evidence to the vault. |
| Search Agent | Local index only | Make apps, routes, files, plugin records, and vault notes discoverable through SEIS Search. |
| Security Agent | Blocking review gate | Block secrets, private vault imports, SSH execution, provider key storage, and unsafe GitHub publication. |
| Documentation Agent | Docs proposal only | Keep README, status, index, backlog, and PR queue synchronized. |

## Public Readiness Rule

The goal is to make SEIS useful enough that people on GitHub can run and review
it safely. This page does not claim that status yet. The dedicated browser-smoke
now covers open, save, link, review, export, AI bridge, reload persistence, and
mobile usability. Public readiness remains blocked until the Second Brain has
accessibility QA, private vault handling rules, no-secret review, provenance
review, and explicit approval for any GitHub publication step.

## Validation

```bash
npm run check:seis-second-brain
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
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
```

The validators check the JSON contract, readiness contracts, Desktop app
wiring, UI action hooks, CSS surface, documentation, package scripts, and
basic sensitive-pattern rules.
The browser-smoke starts the local Desktop route in Chrome, opens Second Brain,
runs all eight vault/training-pack/contributor-pack/Obsidian-starter/review/GitHub-readiness
actions, verifies browser-VFS artifacts after reload, opens the SEIS AI Second
Brain bridge, and checks the mobile viewport for usable controls and no
horizontal overflow. The public demo go/no-go gate is read-only and should
return `NO-GO` until the current release candidate has fresh browser evidence
and explicit human approval.

## Next Safe Work

1. Keep `npm run check:seis-second-brain-readiness-contracts` and the
   dedicated browser-smoke path passing while expanding screen-reader QA for
   vault notes, graph nodes, and inspector focus order.
2. Keep the Obsidian bridge safe import contract review-only until a user
   explicitly selects a vault path and approves a dry-run manifest.
3. Add search scoring and filters for notes, backlinks, tags, apps, routes,
   files, and sub-agent responsibilities.
4. Use the PR #54 public demo checklist before merge, Pages publication, live
   providers, SSH, deployment, or public demo release.
5. Keep `npm run check:seis-public-demo-go-no-go -- --run-fast-checks` wired
   into the release review so GitHub publication stays blocked until evidence
   and approval exist.
6. Second Brain readiness and agent-registry slice was re-staged/revalidated for
   the PR sync flow on 2026-06-29.
