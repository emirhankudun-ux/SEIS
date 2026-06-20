# SEIS AI Web Core Integration Recovery Report

Date: 2026-06-20

## Repository Condition

- Working branch: `seis/ai-demo-app-foundation`.
- Integration target: the clean demo worktree, not the dirty main local checkout.
- The parent workspace contains multiple SEIS-related folders and is not itself
  the repo root.
- The main local checkout still has unrelated modified and deleted files; this
  integration avoids that worktree.
- This branch already contained the local `apps/seis-ai-demo` web app, the
  `apps/seis-demo-web` website demo, and the SwiftUI AI Command Core app.
- The branch had removed the AI Core contract spine from the earlier
  `seis/ai-core-app-foundation` worktree. This report covers the controlled
  recovery and integration of that spine.
- The user then requested one-pass integration of autonomous sub-agents,
  plugins, SSH, and all AI website features. This report records the safe local
  contract implementation of that request without live mutation.

## Source Of Truth Files Found

- `AGENTS.md`
- `README.md`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `.gitignore`
- `.github/`
- `docs/`
- `apps/`
- `packages/`
- `scripts/`

Top-level `ARCHITECTURE.md`, `ROADMAP.md`, and `CHANGELOG.md` are not present
in this worktree. Architecture, roadmap, review, AI, and deployment material
lives under `docs/` and `roadmap/`.

## Pull Request Status

Open PRs visible through GitHub CLI:

| PR | State | Classification | Recommended action |
| --- | --- | --- | --- |
| #40 `docs: define specialist AI MCP SSH integration` | Draft | Useful but SSH/MCP sensitive | Review; do not merge automatically |
| #37 `ci: stabilize main governance and secret scans` | Open | Useful CI/security work | Review before merge |
| #33 `Codex/sync icloud seis 20260619` | Open | Main checkout sync work, locally dirty | Keep isolated from this branch |
| #32 `Codex/publish local seis 20260618 163043` | Open | Publish workflow overlap | Review for duplication |
| #28 cloud SSH setup | Open | Security-sensitive infrastructure | Require explicit approval and rollback plan |
| #27 dual-focus repository development | Open | Broad platform scope | Review scope before merge |
| #24 Swift diagnostics/language governance | Open | Platform lane work | Review after CI |
| #23 portfolio PWA/macOS demo | Draft | Product/demo overlap | Compare against website linkage |
| #22 cloud readiness guards | Open | Cloud/security | Review carefully |
| #20 all-PR consolidation | Open | Broad and risky | Do not merge wholesale |
| #19 polyglot kernel | Open | Likely duplicate of merged #18 | Confirm before action |
| #16, #10, #9, #8, #7, #6, #5, #2, #1 | Open | Older evolution/publish variants | Consolidate or close only after review |
| #12 plugin registry | Open | Useful platform registry | Review for data drift |
| #11 CLAUDE/test roadmap | Open | Documentation support | Review for overlap |
| #3 portfolio website | Open | Website surface overlap | Compare with current `apps/web` and `apps/seis-demo-web` |

Recent closed PRs visible through GitHub CLI were merged: #39, #38, #36, #35,
#34, #31, #29, #25, #21, #18, #17, and #4. They should not be recovered again.

## Closed PR Rescue Plan

- Recover safe local AI Core contract material from the clean
  `seis/ai-core-app-foundation` branch.
- Do not cherry-pick broad commits wholesale.
- Do not recover merged closed PRs again.
- Do not recover SSH, cloud, credential, deployment, payment, database, or live
  provider fragments into this branch.
- Keep Qwen-derived material as reviewed idea intake only; do not copy raw
  implementation.
- Convert Qwen master prompt requirements into SEIS-owned contracts, validators,
  UI state, and docs rather than copying restricted or unsafe implementation.

## Folder Classification Table

| Folder | Classification | Reason | Action |
| --- | --- | --- | --- |
| `apps/seis-ai-demo/` | Core AI app surface | Local deterministic AI Command Core web app | Keep and link to AI Core contracts |
| `apps/seis-demo-web/` | Website/demo surface | Contract-first browser demo | Add AI Command Core CTA and scenario |
| `apps/seis-core/` | Command Center | Central ecosystem UI with AI Core fixture view | Restore AI Core tab and fixture |
| `apps/macos/seis-ai-command-core/` | Native Apple lane | SwiftUI AI Command Core demo | Validate with Swift test/build |
| `data/seis-ai-unified-integration-fabric.json` | Unified SEIS AI fabric | Connects controlled agents, plugin feeds, SSH boundaries, and AI website surfaces | Add and validate |
| `data/seis-specialist-plugins-2026-06-12.json` | Plugin source of truth | Defines embedded SEIS plugin lanes feeding `seis-ai-agent` | Reference only |
| `data/ssh-hardening-operation-contract.json` | SSH source of truth | Defines dry-run, verify, audit, and live-apply boundaries | Reference only |
| `packages/model-router/` | AI Core contract | Provider-neutral route fixtures | Restore and validate |
| `packages/prompt-engine/` | AI Core contract | Prompt regression fixtures | Restore and validate |
| `packages/agent-runtime/` | AI Core contract | Supervised task lifecycle fixtures | Restore and validate |
| `packages/tool-registry/` | AI Core contract | Permission boundary fixtures | Restore and validate |
| `packages/repository-assistant/` | AI Core contract | Local read-only repository assistant fixture | Restore and validate |
| `packages/shared-types/` | Shared contract | App/Command Center contract schema and fixture | Restore and validate |
| `packages/data/` | Knowledge governance | Source classification fixture and schema | Restore docs and validate |
| `docs/ai/`, `docs/product/`, `docs/evals/` | Official documentation | AI Core, product, eval, prompt, and model-router docs | Restore expected source docs |
| `reports/evals/` | Generated evidence | AI Core fixture evaluation report | Regenerate from source |
| `node_modules/`, `dist/`, `.build/` | Generated output | Dependencies/build artifacts | Do not commit |

## Security Findings

- No provider API keys were requested or used.
- No live model provider call was added.
- No SSH, deployment, database, payment, or production operation was added.
- SSH integration is represented only through `audit`, `dashboard`, `verify`,
  and `dry-run` modes until explicit host, fingerprint, public key, rollback
  plan, maintenance window, and human approval exist.
- Plugins feed SEIS AI through lane metadata, MCP tool names, source mirrors,
  and reviewable plans only; plugin install, publish, permission expansion, and
  live execution remain blocked without approval.
- No private key or token pattern was found in the selected touched/recovered
  SEIS AI and website areas.
- GitHub CLI authentication was read-only checked; credential value remained
  redacted by tooling and was not copied into repository files.

## Duplicates And Outdated Material

- `seis/ai-demo-app-foundation` and `seis/ai-core-app-foundation` were divergent:
  the demo branch had website/macOS work, while the AI Core branch retained
  model-router, prompt-engine, agent-runtime, tool-registry, shared-types,
  repository-assistant, data classification, eval docs, and validators.
- The integration keeps both useful surfaces and avoids the earlier deletion of
  the AI Core contract spine.
- Older open PR variants remain separate review items and were not merged here.

## Files To Keep / Archive / Exclude / Merge Into Official Docs

- Keep: `apps/seis-ai-demo/contracts/seis-ai-command-core-integration.json`.
- Keep: `data/seis-ai-unified-integration-fabric.json` and
  `scripts/check-seis-ai-unified-integration-fabric.mjs`.
- Keep: restored AI Core packages, validators, docs, and generated eval report.
- Keep: `apps/seis-demo-web` CTA and contract scenario linking to the local AI
  Command Core surface.
- Keep: `apps/seis-demo-web` unified fabric scenario linking AI websites,
  controlled agents, embedded plugin lanes, and SSH approval gates.
- Keep: Command Center AI Core fixture view.
- Exclude: generated dependency/build output such as `node_modules/`, `dist/`,
  and SwiftPM `.build/`.
- Merge later: broader public website route strategy, GitHub Pages pathing, and
  production provider adapters after review.

## Recommended Branch

`seis/ai-demo-app-foundation`

## Recommended Commit Plan

1. `feat: integrate SEIS AI core with local web demos`
2. `test: validate SEIS AI website contract linkage`
3. `feat: add unified SEIS AI agent plugin SSH fabric`
4. `docs: add SEIS AI web core recovery report`

## Validation

Passed:

- `npm run check:seis-ai-local-integration`
- `npm run check:seis-ai-unified-integration-fabric`
- `npm run check:seis-specialist-plugins`
- `npm run check:seis-ai-agent`
- `npm run check:ssh-hardening-contract`
- `npm run test:seis-command-center`
- `npm run test:web`
- `npm run test:seis-ai-desktop`
- `npm run build:seis-ai-desktop`
- `git diff --check`
- Selected local path, token, and private-key pattern scan for touched/recovered
  SEIS AI and website areas

Not run:

- `npm run check:seis-ai-command-core`, because the final verify step creates a
  local macOS `.app` bundle and opens the app. The lower-side-effect Swift test
  and Swift build steps passed separately.
- No push, merge, deployment, SSH, live provider, database, payment, or model
  training action was performed.

## Final Decision

- Safe to commit: yes, within `seis/ai-demo-app-foundation`.
- Safe to open PR: yes, after maintainer review of the diff and PR description.
- Safe to merge: no, human review and open PR consolidation review are still
  required.
