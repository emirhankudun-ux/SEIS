# SEIS Next PR Queue

Date: 2026-06-23

## Current Recommended Product Demo Stack

| Order | Suggested PR title | Scope | Validation | Approval needed |
| --- | --- | --- | --- | --- |
| 1 | `feat: stabilize SEIS Desktop single-entry demo` | Keep SEIS Desktop as the single browser demo entry with SEIS Demo Studio guided journeys/evidence export, SEIS Search launcher routes, AI/Web/Code/Design/Cloud/Apps/Plugins/Files tabs, the Command Center 10-row Master Objective Coverage matrix, and the 20B dry-run preflight VFS export for SEIS AI App, SEIS Code Workspace, SEIS Code Web, Mythic Gacha, and Video Hero Showcase. | `npm run check:desktop-os`, `npm run check:desktop-os-browser-smoke`, `npm run check:seis-ultimate-demo`, `npm run check:product-experience-browser-smoke`, `git diff --check` | None for local static/browser work and dry-run preflight export; approval required for deployment, dependencies, live providers, SSH, host integrations, model downloads, training, fine-tuning, or real benchmarks. |
| 1A | `feat: add SEIS Second Brain foundation` | Keep installed AI profiles, managed sub-agent lanes, the 12-agent target roster, Obsidian-style Markdown vault notes, graph/backlinks, and GitHub readiness gates connected inside the Desktop OS, SEIS AI, Search, Command Center, Files, and docs. | `npm run check:seis-second-brain`, `npm run check:seis-second-brain-browser-smoke`, `npm run check:desktop-os`, `git diff --check` | None for browser-local UI, JSON contract, docs, validator, and local browser-smoke evidence; approval required for private Obsidian import, live providers, external databases, SSH, deployment, GitHub push/merge/release/Pages, or public launch. |
| 2 | `feat: deepen shared VFS contract and tests` | Keep Desktop Files search/grid/list/preview, Desktop Terminal, SEIS Code, SEIS Code terminal, and Mythic Gacha exports aligned through the browser-local `/home/seis` and `/workspace` bridge. | `npm run check:desktop-os-browser-smoke`, `npm run check:product-experience-browser-smoke`, `npm run check:seis-code`, `npm run check:mythic-gacha`, `git diff --check` | None for browser-local VFS tests/docs; approval required for production storage, cloud sync, encrypted vaults, SSH, or remote workspaces. |
| 3 | `docs: publish product demo boundary and validation evidence` | Publish current-vs-planned boundaries for the single-entry Desktop demo, Local Demo AI, Plugin Center tabs, shared VFS, Mythic exports, and smoke evidence. | `npm run check:foundation`, `git diff --check`, product docs review | None for docs; approval required for public visibility changes or release publication. |
| 4 | `feat: add SEIS full-stack contract foundation` | Keep `content/development/seis-fullstack-contract.json`, `server/node/static-server.mjs`, and `docs/architecture/seis-full-stack-transition.md` as the first server/API/data contract for sessions, projects, app install state, AI provider status, audit logs, and safe agent task records while keeping the current static demo usable without keys and without an API server. The Linux Replica now proves the frontend/local-state side through mini Code/Design/Cloud/Store/Music/AI workspaces; the next PR should deepen the durable backend boundary without placing backend-only secrets in the browser and without breaking Local Demo fallback. | `npm run check:seis-fullstack-contract`, `npm run check:seis-fullstack-server-smoke`, `npm run check:seis-fullstack-no-server-fallback-smoke`, `npm run check:seis-ultimate-demo`, `git diff --check`, redacted provider audit | Approval required for new dependencies, live provider calls, external databases, auth providers, deployment, SSH, or writing real credentials. |

## PR 0: SEIS Integration And GitHub Development Spine

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P0 |
| Goal | Keep every SEIS workstream connected to the canonical GitHub repository through evidence, validation, and PR sequencing. |
| Include | `docs/governance/seis-integration-and-github-development.md`, `content/development/seis-integration-map.json`, `docs/STATUS.md`, `docs/SEIS_MASTER_INDEX.md`, `docs/INDEX.md`, `docs/roadmap/MASTER_BACKLOG.md`, `docs/roadmap/NEXT_PR_QUEUE.md`, `docs/reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md`. |
| Exclude | Bulk copying from separate worktrees, cherry-picking unreviewed commits, live GitHub write actions, SSH, deployment, provider calls, secret rotation, file deletion, branch deletion, and history rewrite. |
| Validation | `jq empty content/development/seis-integration-map.json`, documentation review, `git diff --check`. |
| Approval needed | None for scoped docs/JSON updates; approval required for cross-worktree merge, push, or deletion. |

## PR 0C: SEIS Workspace Unification Spine

| Field | Value |
| --- | --- |
| Suggested branch | `seis/workspace-unification-spine` |
| Priority | P0 |
| Goal | Make `SEIS/` the single canonical writable local root and keep every other SEIS-like folder as a review-only input until a scoped PR extracts useful work. |
| Include | `docs/reviews/SEIS_WORKSPACE_UNIFICATION_REVIEW.md`, `docs/governance/seis-integration-and-github-development.md`, `content/development/seis-integration-map.json`, `docs/STATUS.md`, `docs/SEIS_MASTER_INDEX.md`, `docs/INDEX.md`, and backlog/queue updates. |
| Exclude | Folder deletion, branch deletion, history rewrite, bulk copy, whole-branch cherry-pick, SSH, deployment, live provider calls, and secret rotation. |
| Validation | `jq empty content/development/seis-integration-map.json`, `git diff --check`, documentation review. |
| Approval needed | None for docs/JSON classification; approval required for physical consolidation, deletion, branch cleanup, push, merge, or remote changes. |

## PR 0A: Open PR Stack Triage

| Field | Value |
| --- | --- |
| Suggested branch | `seis/pr-stack-triage` |
| Priority | P0 |
| Goal | Classify the 25 open PRs visible in the read-only GitHub inventory into merge-ready, replace, close, archive, superseded, or needs-human-review buckets. |
| Include | `docs/reviews/PR_STACK_REVIEW.md`, PR number/title/head/base/state table, duplication notes, security/readiness risks, and recommended replacement order. |
| Exclude | Closing PRs, merging PRs, reopening PRs, force-push, branch deletion, cross-worktree cherry-pick, and history rewrite. |
| Validation | Read-only `gh pr list`, local docs review, `git diff --check`. |
| Approval needed | None for the review document; approval required for any GitHub write action. |

## PR 0B: CI Foundation Workflow Alignment

| Field | Value |
| --- | --- |
| Suggested branch | `ci/foundation-workflow-alignment` |
| Priority | P0 |
| Goal | Align `.github/workflows/foundation-check.yml` with package scripts that actually exist, without weakening validation. |
| Include | `.github/workflows/foundation-check.yml`, `package.json` only if narrow script aliases are chosen, status/backlog notes. |
| Exclude | Disabling CI, removing security/governance checks, dependency installation, and branch-protection changes. |
| Validation | `npm run check:foundation`, selected replacement scripts, `git diff --check`. |
| Approval needed | None for script alignment; approval required for branch protection changes or weakened checks. |

## PR 1: Goal Tracking OS Foundation

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P0 |
| Goal | Add file-backed Goal Tracking OS docs, JSON records, validator, status, backlog, and PR queue. |
| Include | `docs/goals/*`, `docs/product/*`, `docs/reviews/GOAL_TRACKING_REVIEW.md`, `docs/roadmap/*`, `docs/STATUS.md`, `docs/INDEX.md`, `content/development/seis-goal-*.json`, `scripts/check-goal-tracking.mjs`, `package.json`. |
| Exclude | Unrelated tracked deletions, live GitHub API calls, SSH, deployment, release actions, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `node --check scripts/check-goal-tracking.mjs`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/validator work. |

## PR 1A: Goal Tracking Review Cadence Ledger

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add planned review cadence records plus completed/deferred/follow-up ledger records to the generated Goal Tracking Center. |
| Include | `content/development/seis-goal-review-cadence.json`, `content/development/seis-goal-progress-ledger.json`, `docs/goals/review-cadence.md`, `docs/goals/progress-ledger.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, `content/development/seis-goal-command-center-view.json`, `apps/web/goal-tracking.html`. |
| Exclude | Fake performed recurring reviews, live GitHub API calls, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1B: Goal Tracking Hierarchy Map

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add yearly, quarterly, monthly, weekly, active project, epic, and subtask hierarchy records to the generated Goal Tracking Center. |
| Include | `content/development/seis-goal-hierarchy.json`, `docs/goals/horizon-map.md`, `docs/goals/project-epic-task-map.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, `content/development/seis-goal-command-center-view.json`, `apps/web/goal-tracking.html`. |
| Exclude | Live GitHub issue/project sync, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1C: Goal Metadata Contract

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Make goal object metadata fields real registry fields: creation date, milestone, epic, last reviewed, review cadence, and notes. |
| Include | `content/development/seis-goal-tracking.json`, `content/development/seis-goal-evidence.json`, `docs/goals/goal-schema.md`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake performed reviews, live GitHub issue/project sync, unrelated tracked deletions, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1D: Goal Archive Ledger

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Keep historical reference, repository hygiene review candidates, and deferred readiness claims separate from active official goals. |
| Include | `content/development/seis-goal-archive-ledger.json`, `docs/goals/archive-ledger.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Archive promotion, file deletion, history rewrite, live GitHub PR inspection, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work; approval required for deletion, promotion, history rewrite, merge, release, or public visibility changes. |

## PR 1E: Goal Cycle Plan

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add yearly goals, quarterly goals, monthly goals, and weekly priorities as file-backed Goal Tracking OS cycle records. |
| Include | `content/development/seis-goal-cycle-plan.json`, `docs/goals/cycle-plan.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake performed weekly/monthly reviews, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1F: Goal Risk And Validation Ledgers

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add first-class risk and validation-step ledgers to the non-LLM Goal Tracking OS. |
| Include | `content/development/seis-goal-risk-register.json`, `content/development/seis-goal-validation-steps.json`, `docs/goals/risk-register.md`, `docs/goals/validation-steps.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake risk mitigation, fake performed validation, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, scoped sensitive-pattern scan, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1G: Goal Roadmap Links

| Field | Value |
| --- | --- |
| Suggested branch | `seis/product-experience-suite` |
| Priority | P1 |
| Goal | Add explicit roadmap, PR queue, and status link records for every tracked Goal Tracking OS goal. |
| Include | `content/development/seis-goal-roadmap-links.json`, `docs/goals/roadmap-links.md`, `content/development/seis-goal-evidence.json`, `scripts/check-goal-tracking.mjs`, `scripts/create-goal-command-center-view.mjs`, generated Goal Tracking Center outputs. |
| Exclude | Fake opened/merged PR state, live GitHub issue/project sync, unrelated tracked deletions, web/release sync drift, deployment, release actions, SSH, model-provider calls, benchmarks, dataset downloads. |
| Validation | `npm run check:goal-tracking`, `npm run check:goal-command-center-view`, `jq empty content/development/seis-goal-*.json`, scoped sensitive-pattern scan, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/generated-static work. |

## PR 1H: SEIS Universe Omega Goal Coverage

| Field | Value |
| --- | --- |
| Suggested branch | `seis/omega-goal-system` |
| Priority | P0 |
| Goal | Map the active SEIS Universe Omega objective into a 24-phase, file-backed Goal Tracking OS coverage record and add Phase 01/02/03/10 dependency, KPI, and success-metric evidence slices without claiming implementation or validation. |
| Include | `content/development/seis-universe-omega-goal-system.json`, `content/development/seis-universe-omega-phase-evidence.json`, `docs/goals/seis-universe-omega-goal-system.md`, `docs/goals/seis-universe-omega-phase-evidence.md`, `scripts/check-seis-universe-omega-goal-system.mjs`, `scripts/check-goal-tracking.mjs`, `package.json`, `docs/INDEX.md`, `docs/STATUS.md`, `docs/roadmap/MASTER_BACKLOG.md`, `docs/roadmap/NEXT_PR_QUEUE.md`. |
| Exclude | Runtime autonomy, live provider calls, SSH, deployment, release actions, model training, benchmarks, dataset downloads, repository settings changes, and public completion claims. |
| Validation | `npm run check:seis-universe-omega-goal-system`, `node --check scripts/check-seis-universe-omega-goal-system.mjs`, `jq empty content/development/seis-universe-omega-goal-system.json content/development/seis-universe-omega-phase-evidence.json`, scoped sensitive-pattern scan, `git diff --check`. |
| Approval needed | None for scoped docs/JSON/validator work; approval required for runtime autonomy, deployment, SSH, provider calls, model training, benchmarks, public visibility changes, or release publication. |

## PR 2: Repository Hygiene Recovery

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Decide restore, replace, archive, or approved removal for pre-existing tracked deletions. |
| Approval needed | File deletion if any deleted files are intentionally removed. |

## PR 3: Static Goal Tracking Center Maintenance

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep the generated static Command Center Goal Tracking view fresh from JSON records. |
| Validation | `npm run check:goal-command-center-view`, `npm run check:goal-tracking`. |
| Approval needed | None unless adding dependencies or live integrations. |

## PR 4: Provider Environment Validation

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Add typed server-only provider environment validation on top of the existing root `SECURITY.md` and redacted provider audit. |
| Include | Provider config schema, Missing Key vs Disabled vs Error rules, sanitized diagnostics, no-key startup tests or documented fixtures. |
| Exclude | Real credential values, provider calls, secret rotation, history rewrite. |
| Validation | `npm run audit:ai-providers`, `.env` ignore checks, no-key startup fixture, bundle exposure scan when build exists. |
| Approval needed | Yes for secret rotation or history rewrite only. |

## PR 4A: AI Core Contract Completion

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep model-router, prompt-engine, and agent-runtime contracts explicit before live provider work. |
| Include | `docs/ai/model-router.md`, `docs/ai/prompt-engine.md`, `docs/ai/agent-runtime.md`, `docs/ai/seis-ai-core.md`, docs indexes, status, and provider audit notes. |
| Exclude | Live provider calls, SDK installation, API key collection, model training, or runtime gateway claims. |
| Validation | Documentation review, `npm run audit:ai-providers`, `git diff --check`. |
| Approval needed | None for documentation-only work. |

## PR 4C: Installed AI Workforce Training Control Plane

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Let installed AI assistants improve SEIS AI through supervised candidate cases, deterministic local seed-model rebuilds, benchmark gates, and promotion-policy evidence without live provider calls or unsupported model claims. |
| Include | `content/development/seis-ai-workforce-training-plan.json`, `docs/ai/ai-workforce-training.md`, `docs/ai/seis-ai-core.md`, `packages/seis-ai/data/*`, `packages/seis-ai/models/*`, `scripts/check-seis-ai-workforce-training.mjs`, `scripts/run-seis-ai-workforce-training.mjs`, `package.json`, `reports/seis-ai-workforce-training/*`. |
| Exclude | Cloud fine-tuning, live provider prompts, credential validation, dataset downloads, paid benchmarks, SSH, deployment, push, merge, runtime authority, and foundation-model ownership claims. |
| Validation | `npm run check:seis-ai-workforce-training`, `npm run automation:seis-ai-workforce-training`, `npm run check:seis-universe-readiness`, `node --test packages/seis-ai/test/*.test.mjs`, `git diff --check`. |
| Approval needed | None for local deterministic seed-model rebuilds; explicit approval required for secondary live-provider prompts, external datasets, paid benchmarks, model publication, SSH, deployment, push, or merge. |

## PR 4D: SEIS Model Scaling Hardware Profile

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Track the requested 20B / 16GB+ RAM target plus future 70B, 150B, and 512B apex scale ladder as a validator-backed SEIS AI Core compatibility contract without claiming trained weights, live inference, AGI, downloads, or benchmark results. |
| Include | `content/development/seis-model-scaling-hardware-profile.json`, `content/development/seis-model-parameter-ladder.json`, `content/development/seis-model-frontier-escalation-policy.json`, `content/development/seis-150b-frontier-model-program.json`, `content/development/seis-512b-apex-model-program.json`, `content/development/seis-model-scaling-subagent-council.json`, `content/development/seis-20b-model-card-template.json`, `content/development/seis-20b-dataset-card-template.json`, `reports/seis-model-scaling/20b-16gb-memory-benchmark.json`, `reports/seis-model-scaling/20b-benchmark-dry-run.json`, `docs/ai/seis-model-scaling.md`, `docs/ai/seis-ai-core.md`, `docs/ai/model-router.md`, `packages/seis-ai/src/lib/plugin-integration.mjs`, `packages/seis-ai/src/agent/tools.mjs`, `scripts/check-seis-model-frontier-escalation-policy.mjs`, `scripts/check-seis-150b-frontier-model-program.mjs`, `scripts/check-seis-512b-apex-model-program.mjs`, `scripts/check-seis-model-parameter-ladder.mjs`, `scripts/check-seis-model-scaling-subagent-council.mjs`, `scripts/check-seis-model-scaling-hardware-profile.mjs`, `scripts/inspect-seis-model-local-hardware.mjs`, `scripts/create-seis-20b-benchmark-dry-run.mjs`, `package.json`, Command Center model-scaling UI, `/home/seis/Documents/seis-20b-local-preflight.md` dry-run VFS export, `dist/qa/model-scaling/local-hardware-preflight.json` ignored optional output, `seis://ai/150b-frontier-model-program.json`, `seis://ai/512b-apex-model-program.json`, `frontier-program-plan-only` 150B program gate, `apex-program-plan-only` 512B program gate, 12 plan-only model-scaling sub-agent council, RAM compatibility profiles, benchmark manifest contract/template, benchmark dry-run report, no-skip-20B frontier escalation policy, parameter ladder resource, model/dataset card templates, memory-budget contract, quantization lanes, creation stages, candidate-only local runtimes, status/backlog/index updates. |
| Exclude | Model downloads, dataset downloads, training, fine-tuning, paid benchmarks, GPU/cloud provisioning, SSH, deployment, provider credential setup, checkpoint publication, or claims that SEIS owns a 20B/70B/150B/512B foundation model or AGI. |
| Validation | `npm run check:seis-20b-benchmark-dry-run`, `npm run check:seis-model-local-hardware-preflight`, `npm run check:seis-150b-frontier-model-program`, `npm run check:seis-512b-apex-model-program`, `npm run check:seis-model-frontier-escalation-policy`, `npm run check:seis-model-parameter-ladder`, `npm run check:seis-model-scaling-subagent-council`, `npm run check:seis-model-scaling-hardware-profile`, `npm run check:seis-ai-core-provider-registry`, `npm test --prefix packages/seis-ai`, `git diff --check`. |
| Approval needed | None for docs/JSON/validator/status-tool/UI evidence work; explicit approval required for model downloads, training, benchmarks, cloud/GPU spend, provider credentials, SSH, deployment, push, merge, or publication. |

## PR 4E: SEIS Second Brain Foundation

| Field | Value |
| --- | --- |
| Priority | P0 |
| Goal | Turn installed AI profiles, managed sub-agent lanes, the 12-agent target roster, Obsidian-style Markdown vault notes, graph/backlinks, and GitHub readiness gates into a validator-backed SEIS Second Brain foundation. |
| Include | `apps/web/desktop.js`, `apps/web/desktop.css`, `content/development/seis-second-brain-system.json`, `docs/product/seis-second-brain.md`, `docs/product/seis-demo-status.md`, `docs/STATUS.md`, `docs/INDEX.md`, `docs/SEIS_MASTER_INDEX.md`, `docs/roadmap/MASTER_BACKLOG.md`, `docs/roadmap/NEXT_PR_QUEUE.md`, `scripts/check-seis-second-brain.mjs`, `scripts/check-seis-second-brain-browser-smoke.mjs`, and `package.json`. |
| Exclude | Private Obsidian vault import, Obsidian plugin install, live provider calls, external database setup, SSH, deployment, GitHub push, merge, release, Pages publication, public launch, or secret handling. |
| Validation | `npm run check:seis-second-brain`, `npm run check:seis-second-brain-browser-smoke`, `npm run check:desktop-os`, `node --check apps/web/desktop.js`, `node --check scripts/check-seis-second-brain.mjs`, `node --check scripts/check-seis-second-brain-browser-smoke.mjs`, `git diff --check`. |
| Approval needed | None for local browser/demo/docs/validator work; explicit approval required for private vault sync, live AI providers, GitHub write actions, deployment, or public release. |

## PR 4B: MCP SDK Compatibility Hardening

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Harden the SEIS MCP stdio surface after the no-dependency fallback restored local smoke coverage, then decide whether the official `@modelcontextprotocol/sdk` should also be installed for production MCP compatibility. |
| Include | `package.json`, lockfile if dependency installation is approved, `packages/seis-ai/src/mcp/server.mjs`, `packages/seis-ai/test/mcp-smoke.test.mjs`, and validation notes. |
| Exclude | Live MCP remote servers, external connector mutation, credential access, unrestricted shell tools, deployment, SSH, or GitHub writes. |
| Validation | `node --test packages/seis-ai/test/mcp-smoke.test.mjs`, `npm run check:seis-agent-plugin-integration`, `node --test packages/seis-ai/test/agent.test.mjs`, `git diff --check`. |
| Approval needed | Yes for dependency installation or lockfile mutation; none for no-dependency fallback hardening and local smoke coverage. |

## PR 5: Command Center Lane Status View

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Add and maintain a read-only Command Center lane interface for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`, including a selectable five-year development program, H1/H2 cadence, and coverage metrics. |
| Include | `apps/web/seis-cockpit.html`, `apps/web/app.js`, `apps/web/styles.css`, `release/web/*`, `content/development/seis-plugin-interface-roadmap.json`, `content/development/plugin-skill-capability-map.json`, `content/lab/cinematic-engine.json`, `content/lab/quality-console.json`, `docs/product/plugin-interface-suite.md`, status/backlog/index updates. |
| Exclude | Live cloud, GitHub write, SSH, or AI provider actions. |
| Validation | `npm run check:plugin-interface-roadmap`, `node --check apps/web/app.js`, `jq empty content/development/seis-plugin-interface-roadmap.json`, `git diff --check`, keyboard/manual QA when browser verification is available. |
| Approval needed | None unless adding dependencies. |

## PR 5A: Plugin Interface Validation And QA

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep dedicated validation and manual QA evidence for the static plugin interface suite, including lane tabs, year controls, H1/H2 cadence, coverage metrics, and program rows. |
| Include | `scripts/check-plugin-interface-roadmap.mjs`, `npm run check:plugin-interface-roadmap`, `docs/reviews/PLUGIN_INTERFACE_SUITE_QA.md`, support data files, browser QA notes for lane tabs, maturity signals, readiness gates, evidence links, mobile layout, HTTP status, and reduced-motion behavior. |
| Exclude | Dependency installation, live provider calls, SSH, deployment, or destructive actions. |
| Validation | `npm run check:plugin-interface-roadmap`, browser screenshot/manual QA, keyboard navigation review. |
| Approval needed | None unless adding dependencies or external tooling. |

## PR 6: SEIS Code, Data, And Design Contracts

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Harden SEIS Code browser foundation, keep the Desktop Code IDE cockpit aligned with V17 IDE requirements, expand the data schema registry, and add visual QA on top of the validator-backed design component inventory. |
| Include | SEIS Code interaction tests, Desktop Code IDE Explorer/Search/Source Control Safe Mock/Preview/AI Assistant Local Demo/Extensions/status-bar checks, virtual file system persistence checks, Monaco/fallback editor QA, terminal and no-key AI REPL checks, JSON schema expectations, component inventory visual QA, Video Hero QA evidence, reduced-motion QA. |
| Exclude | Full product implementation or dependency installation unless separately approved. |
| Validation | `npm run check:desktop-os`, `npm run check:seis-code`, `npm run check:video-hero-showcase`, `npm run check:design-component-inventory`, `npm run check:data-schema-registry`, documentation review, JSON checks, manual accessibility checklist. |
| Approval needed | Yes for dependency installation. |

## PR 6A: Video Hero Visual QA

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Convert the four Video Hero showcase pages from validated static contract to visual QA evidence for desktop, mobile, reduced-motion, and media fallback behavior. |
| Include | `docs/product/video-hero-showcase.md`, `docs/reviews/VIDEO_HERO_SHOWCASE_QA.md`, browser smoke notes, screenshots, reduced-motion evidence, media provenance review, and static package verification. |
| Exclude | Deployment, live media CDN migration, dependency installation, paid media purchases, model-provider image generation, and release publication. |
| Validation | `npm run check:video-hero-showcase`, `npm run check:video-hero-performance-budget`, `npm run check:video-hero-browser-smoke`, `npm run build:static`, browser screenshot review, reduced-motion review, `git diff --check`. |
| Approval needed | None for local QA/docs; approval required for dependency installation, hosted media migration, deployment, or release. |

## PR 6B: SEIS Desktop OS Browser Foundation

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep the browser-based SEIS Desktop OS foundation functional, mobile-safe, single-entry, and honest about browser-local limits while the product suite grows. |
| Include | `apps/web/desktop.html`, `apps/web/desktop.css`, `apps/web/desktop.js`, `apps/web/seis-linux-replica.html`, SEIS Search launcher routes, AI Plugin Center tabs, desktop-to-SEIS-Code workspace handoff for `/home/seis` file/folder create, move, and delete operations, reverse import for current SEIS Code/Mythic exports, `scripts/check-desktop-os.mjs`, `scripts/check-desktop-os-browser-smoke.mjs`, `scripts/check-seis-linux-replica-browser-smoke.mjs`, `scripts/check-product-experience-browser-smoke.mjs`, `docs/product/seis-desktop-os.md`, `docs/product/seis-demo-status.md`, `docs/product/shared-vfs-contract.md`, status/backlog/review updates, and ignored screenshot evidence under `dist/qa/desktop-os-smoke/` plus `dist/qa/seis-linux-replica-smoke/`. |
| Exclude | Host OS command execution, SSH, dependency installation, live AI provider calls, production credential storage, deployment, release publication, and claims that every app is production complete. |
| Validation | `npm run check:desktop-os`, `npm run check:desktop-os-browser-smoke`, `npm run check:seis-linux-replica-browser-smoke`, `npm run check:product-experience-browser-smoke`, `node --check apps/web/desktop.js`, `node --check scripts/check-desktop-os-browser-smoke.mjs`, `node --check scripts/check-seis-linux-replica-browser-smoke.mjs`, `node --check scripts/check-product-experience-browser-smoke.mjs`, browser/mobile/bridge screenshot review, `git diff --check`. |
| Approval needed | None for the static browser foundation; approval required for dependencies, live providers, host integrations, SSH, or deployment. |

## PR 6C: Shared VFS Contract And Tests

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Deepen the browser-local VFS contract between Desktop Files, Desktop Terminal, SEIS Code, SEIS Code terminal, and Mythic Gacha exports without claiming production storage. |
| Include | `docs/product/shared-vfs-contract.md`, `apps/web/desktop.js`, `apps/web/seis-code.js`, `apps/web/mythic-gacha.js`, `scripts/check-desktop-os-browser-smoke.mjs`, `scripts/check-product-experience-browser-smoke.mjs`, product/status/review updates. |
| Exclude | Production database, cloud sync, encrypted vaults, host filesystem access, SSH, remote workspaces, dependency installation, and deployment. |
| Validation | `npm run check:desktop-os-browser-smoke`, `npm run check:product-experience-browser-smoke`, `npm run check:seis-code`, `npm run check:mythic-gacha`, `git diff --check`. |
| Approval needed | None for browser-local VFS tests/docs; approval required for production storage, cloud sync, encrypted vaults, SSH, or remote workspace integration. |

## PR 6D: Product Demo Boundary Evidence

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Publish the current-vs-planned boundary for the single-entry browser demo and keep validation evidence tied to source-of-truth docs. |
| Include | `docs/product/seis-demo-status.md`, `docs/product/seis-desktop-os.md`, `docs/product/seis-code-foundation.md`, `docs/product/mythic-gacha.md`, `docs/reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md`, `docs/STATUS.md`, `docs/INDEX.md`, `docs/SEIS_MASTER_INDEX.md`. |
| Exclude | Public visibility changes, release publication, fake deployment claims, live provider readiness claims, SSH readiness claims, and production storage claims. |
| Validation | `npm run check:foundation`, product smoke evidence review, `git diff --check`. |
| Approval needed | None for docs; approval required for public visibility changes, deployment, release, live provider, SSH, or production storage claims. |

## PR 7: Mythic Gacha Playable Foundation

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Keep the Shan Hai Jing inspired gacha route playable without a runtime image-generation provider key. |
| Include | `apps/web/mythic-gacha.html`, `apps/web/mythic-gacha.css`, `apps/web/mythic-gacha.js`, `apps/web/seis-code.js` export listener, `apps/web/public/media/mythic/shan-hai-creature-atlas.png`, `docs/product/mythic-gacha.md`, route/cache/sitemap bindings, and `scripts/check-mythic-gacha.mjs`. |
| Exclude | Live image generation, real-money purchase flows, provider keys, dependency installation, deployment, SSH, or asset claims without provenance review. |
| Validation | `npm run check:mythic-gacha`, `npm run check:product-experience-browser-smoke`, `node --check apps/web/mythic-gacha.js`, `node --check apps/web/seis-code.js`, browser/mobile screenshot review when needed. |
| Approval needed | None for the static foundation; approval required for live image generation, dependency installation, public release, or external asset pipeline changes. |

## PR 8: Public Readiness And Accessibility Hardening

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Resolve preview/public indexing intent, GitHub review templates, keyboard navigation QA, and asset provenance before public or release readiness claims. |
| Include | PR template, issue templates, CODEOWNERS proposal, public exposure checklist, SEO intent decision, keyboard-navigation QA notes, Video Hero and Mythic Gacha asset provenance notes. |
| Exclude | Public visibility changes, deployment, release/tag creation, external asset purchases, model-provider calls, and branch protection changes. |
| Validation | `npm run check:workspace`, product validators, manual accessibility checklist, `git diff --check`. |
| Approval needed | None for docs/templates; approval required for repository settings or public visibility changes. |

## PR 8B: AI Core Sub-Agent Role Schema And Permission Fixtures

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Convert the validated status/plan-only five-year sub-agent operating model into concrete role schema, permission matrix, dry-run queue, cancellation, and approval fixtures without enabling background autonomous writes. |
| Include | `content/development/seis-ai-core-subagent-operating-model.json`, `content/development/seis-ai-core-agent-role-schema.json`, `content/development/seis-ai-core-agent-permission-matrix.json`, `content/development/seis-ai-core-dry-run-task-queue.json`, `content/development/seis-ai-core-cancellation-fixture.json`, `content/development/seis-ai-core-approval-fixture.json`, docs/status/backlog updates, and package validation scripts. |
| Exclude | Live provider calls, external connector mutation, background automation, write-gated execution, GitHub writes, SSH, deployment, dependency installation, model training, dataset download, and secret access. |
| Validation | `npm run check:seis-ai-core-subagent-operating-model`, `npm run check:seis-ai-core-subagent-runtime-fixtures`, `npm run check:ai-workforce-assignments`, `npm run check:seis-agent-lane-status`, `git diff --check`. |
| Approval needed | None for docs/contracts/fixtures; approval required before autonomous writes, external mutations, provider calls, deployment, SSH, or GitHub write operations. |

## PR 9: Repository Policy Reconciliation

| Field | Value |
| --- | --- |
| Priority | P1 |
| Goal | Reconcile legacy UIXAppTTR-era branch wording, release artifact retention, archive-ledger coverage, and backlog ID validation. |
| Include | Branch-policy wording review, release zip artifact policy, archive-ledger records for assistant materials, backlog ID uniqueness check. |
| Exclude | File deletion, branch deletion, repository setting changes, history rewrite, moving tracked release zips, or changing default branch. |
| Validation | Docs review, backlog ID validator when added, `git diff --check`. |
| Approval needed | None for docs/validator; approval required for deleting or migrating tracked artifacts and repository setting changes. |

## Human Approval Needed

- Push to `main`, merge, force-push, branch deletion, or history rewrite.
- File deletion.
- Cross-worktree cherry-pick, bulk copy, or branch reconciliation.
- GitHub PR classification, merge, close, reopen, or other write action.
- Dependency installation.
- SSH, deployment, release/tag creation, repository settings changes, secret rotation, public visibility changes, model training, benchmarks, or dataset downloads.
