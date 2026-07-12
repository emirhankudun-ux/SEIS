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
- `scripts/create-seis-second-brain-browser-smoke-evidence.mjs`
- `scripts/create-seis-obsidian-safe-import-dry-run.mjs`
- `scripts/create-seis-read-only-model-router-decision.mjs`
- `scripts/create-seis-second-brain-accessibility-focus-report.mjs`
- `scripts/create-seis-second-brain-agent-registry.mjs`
- `scripts/check-seis-agi-independent-evidence-ledger.mjs`
- `docs/product/seis-obsidian-bridge-safe-import.md`
- `docs/ai/seis-second-brain-mcp-quickstart.md`
- `docs/reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md`
- `docs/releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md`

The desktop app opens as `second-brain` and is linked from System OS, SEIS
Search, SEIS AI, Command Center, Launchpad, Favorites, and desktop shortcuts.

## Working Local Demo Behavior

| Capability | Current status | Evidence |
| --- | --- | --- |
| Markdown vault | Browser-local Local Demo | Seed notes render under `/home/seis/SecondBrain`; `Save Vault Snapshot` writes note files and `seis-second-brain-vault-snapshot.md` into the browser VFS. |
| Knowledge graph | Browser-local Local Demo | Graph nodes and backlinks are generated from repo-owned seed records; `Link Graph` writes `graph-links.json`. |
| Plugin + skill graph nodes | Browser-local Local Demo | The Second Brain graph renders 5 plugin/skill readiness nodes for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`, plus local graph-edge markers that connect the readiness matrix back to SEIS AI. Selecting a node persists the local readiness lane and focuses its status/plan tools, skill path, related agents, and allowed review output in the SEIS AI bridge. No plugin, MCP, provider, SSH, deployment, or GitHub action is executed. |
| Second Brain browser-smoke evidence artifact | Repo-local Chrome evidence | `npm run report:seis-second-brain-browser-smoke-evidence` reruns the real Chrome smoke and writes paired JSON/Markdown evidence with a SHA-256 digest of the Desktop, Second Brain contract, and smoke sources. The go/no-go gate accepts current evidence only when that digest, the `@seis-code` handoff, reload persistence, mobile ergonomics, and no-mutation safety boundary all match. |
| Second Brain local search index | Browser-local Local Demo | The runtime Second Brain screen now scores and filters notes, backlinks, tags, apps, routes, files, plugins, and agent duties from repo-owned seed records and browser VFS state only. It uses compound tag matching, backlink/graph proximity boosts, source-type weighting, visible score explanations, and roving-focus `listbox`/`option` semantics with ArrowUp/ArrowDown/Home/End keyboard navigation. It can record `/home/seis/SecondBrain/search-index-snapshot.md` and does not read a private Obsidian vault or call external search. |
| Agent training pack | Local Demo read-only | `Build Training Pack` writes `/home/seis/SecondBrain/07-learning/seis-agent-training-pack.md` with the repo-owned Obsidian context pack, all 9 managed lanes, accessibility, router, PR #54 checklist, and language model training curriculum summaries. It also records the browser-local plan-only assignment ledger count and redacted role/context summaries as review curriculum, never as model-weight training, provider access, or autonomous agent execution. |
| Repo-owned Obsidian context pack | Read-only local/MCP context | `seis-brain/vault/12_Context_Packs/SEIS Obsidian Context.md` is surfaced by `seis://brain/second-brain-system.json` as public-safe contract metadata; it is not a private vault import or model-weight training input. |
| Plugin + skill readiness matrix | Local Demo review-only | The Second Brain contract and runtime expose all installed SEIS personal plugin lanes as a Skill/MCP readiness matrix. `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` are mapped to status/plan tools, embedded skill paths, training use, `providerExecution: false`, and `externalMutation: false`. Skill/MCP readiness stays local-demo-readiness-matrix and does not install plugins, call providers, validate credentials, run SSH, deploy, mutate GitHub, or approve autonomous execution. |
| Language model training curriculum | Planned-training contract | `content/development/seis-language-model-training-curriculum.json` and `reports/seis-model-scaling/seis-language-model-training-curriculum.md` map candidate model families, local seed-model lanes, retrieval lanes, and approval gates without installing models, downloading checkpoints, training, benchmarking, calling providers, or claiming SEIS owns a foundation model. |
| Independent AGI evidence ledger | Review-gated | `npm run check:seis-agi-independent-evidence-ledger` and `content/development/seis-agi-independent-evidence-ledger.json` keep AGI/512B public claims blocked until independent external evidence and explicit human approval are recorded. |
| Installed AI bridge | Local Demo context only | SEIS AI exposes a Second Brain tab with all 6 current installed AI profiles: Codex, SEIS Local Demo Runtime, Claude Review Profile, Qwen Alternative Review, Gemini Secondary Validation, and Ollama Local Candidate. Missing Key and Disabled states remain explicit. |
| SEIS AI plugin/skill bridge | Local Demo review-only | The SEIS AI Second Brain tab renders the Plugin + Skill Readiness matrix with all 5 personal plugin lanes, status/plan tools, embedded `SKILL.md` paths, training-use text, `providerExecution false`, and `externalMutation false`. Its focused readiness-lane card carries a user-selected Second Brain graph or local-search handoff into the matching related-agent and allowed-output context without granting execution. `Save Local Handoff Brief` writes the selected lane, skill, related agents, allowed output, and safety boundary to browser VFS under `/home/seis/SecondBrain/07-learning/`. `Save All-Lane Review Bundle` writes equivalent review-only context for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` as one browser-local Markdown package. Neither control invokes a plugin, MCP, provider, SSH, deployment, GitHub, or autonomous action. |
| All-lane AI and agent review bundle | Browser-local Local Demo | The all-lane bundle also records all 6 installed AI profile identifiers and the 13-agent roster with status and duty text. It is local review context, not proof of live provider access or autonomous agent authority. |
| Agent review queue | Browser-local review-only | `Build Agent Review Queue` writes paired `/home/seis/SecondBrain/09-review/agent-review-queue.md` and `agent-review-queue.json` artifacts. The structured record has a versioned schema, deterministic 13-agent queue, 6 installed AI profile states, review-reference paths, and explicit false execution flags. It does not inspect those artifacts, scan a host folder, access a private vault, invoke a provider/MCP/SSH connection, or authorize autonomous execution. |
| Second Brain review plugin skill | Repo-contained workflow | `plugins/seis-ai-agent/skills/seis-second-brain-review/SKILL.md` gives all SEIS Agent lanes a reusable bounded workflow for review queues, human-selected assignments, ledgers, five plugin contexts, and approval-gated Obsidian intake. Plugin discovery is automatic through the SEIS-AI Agent `skills/` root; the skill does not grant provider, MCP, SSH, deployment, GitHub, or autonomous-write authority. |
| Human-selected agent review assignment | Browser-local review-only | The Second Brain review panel allows the user to select one of 13 roles and explicitly confirm a plan-only assignment. `Record Plan-Only Assignment` writes paired `/home/seis/SecondBrain/09-review/agent-review-assignment.md` and `.json` receipts containing the selected role, mapped local Context Profiles, all 6 installed AI profile states, queue references, and explicit false execution flags. Each record is appended to bounded browser-local `agent-review-ledger.md` and `.json` artifacts, preserving up to 24 human-selected assignments without proving or starting agent execution. The SEIS AI Second Brain bridge mirrors the current selected role, ledger count, mapped context lanes, and `agentExecuted/providerCalls/mcpInvocations` false boundary as visible local review context. The same receipt becomes an `Agents` result in the browser-local Second Brain search and opens only the local Markdown artifact. It does not run an agent, inspect queue/vault contents, call a provider/MCP/SSH connection, or authorize any write outside the browser VFS. |
| read-only model-router decision artifact | Provider-neutral review-only | `npm run report:seis-read-only-model-router-decision` writes `reports/seis-public-demo/read-only-model-router-decision-latest.json` and `.md` with installed AI profile fixtures, blocked reasons, explicit fallback policy, `executionPerformed: false`, and no provider calls. |
| Second Brain agent registry artifact | Review-only | `npm run report:seis-second-brain-agent-registry` writes `reports/seis-public-demo/second-brain-agent-registry-latest.json` and `.md` by joining installed AI profiles, AI workforce assignments, managed sub-agent lanes, the 13-agent roster, a read-only context access matrix for `seis://brain/second-brain-system.json`, Obsidian bridge boundaries, plugin inventory, MCP surfaces, and connector activation policy without provider calls, credential validation, private vault reads, autonomous writes, SSH, deployment, GitHub mutation, or release approval. |
| Agent Registry Evidence panel | Runtime review-only | SEIS Second Brain and the SEIS AI Second Brain bridge render the latest agent-registry artifact path, `NO-GO-autonomous-execution-not-approved` decision, context profile count, 13-agent roster count, and no-provider/no-private-vault/no-GitHub-mutation safety boundary as runnable UI evidence. |
| Sub-agent lanes | Status/plan-only | All 9 current managed SEIS sub-agent lanes are indexed: SEIS Hub, SEIS Cloud, SEIS-Code, SEIS-Design, SEIS-DATA, SEIS-Security, SEIS-Research, SEIS-Automation, and SEIS-Product. They can review/propose only; they cannot expand permissions or mutate external systems. |
| Local Context Profiles | Read-only Local Demo | The same canonical MCP resource maps all 9 lanes to their status/plan tools, related autonomous agents, repo-owned Obsidian context, and allowed review/plan output. `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data` remain explicit; embedded lanes stay within SEIS-Agent. |
| Autonomous agent roster | Status/plan-only | The Second Brain maps the 13-agent target roster: Architect, Code, Design, UI/UX, Research, Search, Security, DevOps, Documentation, QA, Cloud, Automation, and Product. |
| GitHub readiness | Human review required | `Export GitHub Readiness` writes a blocked-by-review readiness note; the dedicated browser-smoke checks the export and reload persistence. Push, merge, release, Pages, and public launch still require approval. |
| Obsidian bridge | Planned | Future bridge must use explicit user-selected import, provenance review, no-secret filtering, and approval before sync. |
| Obsidian bridge safe import contract | Planned-gated | `content/development/seis-obsidian-bridge-safe-import-contract.json` and `docs/product/seis-obsidian-bridge-safe-import.md` require explicit user-selected source path, dry-run manifest, no private note body commits, provenance, accessibility review, and human approval before GitHub publication. |
| Obsidian Safe Import Selector | Runtime review-only | SEIS Second Brain renders a planned-gated source-mode selector and metadata-only dry-run manifest preview. In `User-selected private vault` mode, an explicit acknowledgement can write `/home/seis/SecondBrain/obsidian-explicit-selection-receipt.md` with no host path, private note body, or attachment content. `Prepare Safe Import Dry-Run` writes `/home/seis/SecondBrain/obsidian-safe-import-ui-dry-run.md`, records `selectedByUser: true`, and remains `NO-GO-human-approval-required-before-preflight-scan`; it still blocks host filesystem scans and does not import private note bodies. |
| Obsidian preflight approval request | Browser-local review-only | After an explicit selection receipt, `Prepare Preflight Approval Request` writes `/home/seis/SecondBrain/obsidian-preflight-approval-request.md`. It records Security, Research, Documentation, QA, and Cloud review owners plus false scan/import/provider/SSH/GitHub flags. It is a human-approval request, not a scan or import. |
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
- `seis://brain/second-brain-system.json` exposes only repo-owned, read-only
  Second Brain contract metadata; it does not read a private vault or train model weights.
- Plugin + skill readiness records are repo-owned review metadata only:
  no plugin install, provider execution, credential validation, SSH, deployment,
  GitHub mutation, or autonomous execution is approved from the Second Brain.
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
npm run report:seis-second-brain-browser-smoke-evidence
npm run check:seis-second-brain-browser-smoke-evidence
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-second-brain-browser-smoke
npm run check:seis-public-demo-go-no-go -- --run-fast-checks
```

The validators check the JSON contract, readiness contracts, Desktop app
wiring, UI action hooks, CSS surface, documentation, package scripts, and
basic sensitive-pattern rules.
The browser-smoke starts the local Desktop route in Chrome, opens Second Brain,
runs all six vault/training-pack/review/GitHub-readiness actions, selects the
`@seis-code` plugin/skill graph lane, verifies its SEIS AI agent handoff and
browser-local reload persistence, then checks the mobile viewport for usable
controls and no horizontal overflow. The
public demo go/no-go gate is read-only and should return `NO-GO` until the
current release candidate has a fresh source-digest-matched browser evidence
artifact and explicit human
approval.

## Next Safe Work

1. Keep `npm run check:seis-second-brain-readiness-contracts` and the
   dedicated browser-smoke path passing while expanding screen-reader QA for
   vault notes, graph nodes, and inspector focus order.
2. Keep the Obsidian bridge safe import contract review-only until a user
   explicitly selects a vault path and approves a dry-run manifest.
3. Add screen-reader transcript evidence and screenshot-backed accessibility
   notes for the Second Brain search/import panels.
4. Use the PR #54 public demo checklist before merge, Pages publication, live
   providers, SSH, deployment, or public demo release.
5. Keep `npm run check:seis-public-demo-go-no-go -- --run-fast-checks` wired
   into the release review so GitHub publication stays blocked until evidence
   and approval exist.
6. Second Brain readiness and agent-registry slice was re-staged/revalidated for
   the PR sync flow on 2026-06-29.
