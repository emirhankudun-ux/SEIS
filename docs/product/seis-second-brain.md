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
- `content/development/seis-second-brain-accessibility-focus-qa.json`
- `content/development/seis-public-demo-release-checklist-pr54.json`
- `scripts/check-seis-second-brain.mjs`
- `scripts/check-seis-second-brain-readiness-contracts.mjs`
- `scripts/check-seis-second-brain-browser-smoke.mjs`
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
| Installed AI bridge | Local Demo context only | SEIS AI exposes a Second Brain tab with all 6 current installed AI profiles: Codex, SEIS Local Demo Runtime, Claude Review Profile, Qwen Alternative Review, Gemini Secondary Validation, and Ollama Local Candidate. Missing Key and Disabled states remain explicit. |
| Sub-agent lanes | Status/plan-only | All 6 current managed SEIS sub-agent lanes are indexed: SEIS Hub, SEIS Cloud, SEIS-Code, SEIS-Design, SEIS-DATA, and SEIS-Security. They can review/propose only; they cannot expand permissions or mutate external systems. |
| Autonomous agent roster | Status/plan-only | The Second Brain maps the 12-agent target roster: Architect, Code, Design, UI/UX, Research, Search, Security, DevOps, Documentation, QA, Cloud, and Automation. |
| GitHub readiness | Human review required | `Export GitHub Readiness` writes a blocked-by-review readiness note; the dedicated browser-smoke checks the export and reload persistence. Push, merge, release, Pages, and public launch still require approval. |
| Obsidian bridge | Planned | Future bridge must use explicit user-selected import, provenance review, no-secret filtering, and approval before sync. |
| Obsidian bridge safe import contract | Planned-gated | `content/development/seis-obsidian-bridge-safe-import-contract.json` and `docs/product/seis-obsidian-bridge-safe-import.md` require explicit user-selected source path, dry-run manifest, no private note body commits, provenance, accessibility review, and human approval before GitHub publication. |
| Second Brain accessibility/focus QA | Contract-active | `content/development/seis-second-brain-accessibility-focus-qa.json` and `docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md` bind listbox/option roles, `aria-selected`, `aria-controls`, `aria-live polite`, focus-visible styling, inspector focus, and zero cramped mobile controls. |
| Public demo release checklist | Review-gated | `content/development/seis-public-demo-release-checklist-pr54.json` and `docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md` keep PR #54 review separate from merge, Pages publication, private vault import, live provider routing, SSH, deployment, or production-readiness claims. |

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
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
```

The validators check the JSON contract, readiness contracts, Desktop app
wiring, UI action hooks, CSS surface, documentation, package scripts, and
basic sensitive-pattern rules.
The browser-smoke starts the local Desktop route in Chrome, opens Second Brain,
runs all five vault/review/GitHub-readiness actions, verifies browser-VFS
artifacts after reload, opens the SEIS AI Second Brain bridge, and checks the
mobile viewport for usable controls and no horizontal overflow.

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
