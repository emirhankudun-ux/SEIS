# SEIS Documentation Index

Date: 2026-06-23

## Master Navigation

| Document | Purpose |
| --- | --- |
| [SEIS_MASTER_INDEX.md](SEIS_MASTER_INDEX.md) | Current master navigation for SEIS lanes, evidence, blockers, and next safe actions. |
| [STATUS.md](STATUS.md) | Current branch status matrix. |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | Root architecture pointer for agents and contributors. |
| [../ROADMAP.md](../ROADMAP.md) | Root roadmap pointer for agents and contributors. |
| [governance/seis-integration-and-github-development.md](governance/seis-integration-and-github-development.md) | Integration policy for keeping every SEIS workstream tied to GitHub, evidence, and PR sequencing. |
| [reviews/SEIS_WORKSPACE_UNIFICATION_REVIEW.md](reviews/SEIS_WORKSPACE_UNIFICATION_REVIEW.md) | Canonical `SEIS/` workspace rule and classification of nearby SEIS-like folders. |
| [reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md](reviews/SEIS_ULTIMATE_FOUNDATION_REVIEW.md) | Foundation audit and review report. |
| [reviews/PLUGIN_INTERFACE_SUITE_QA.md](reviews/PLUGIN_INTERFACE_SUITE_QA.md) | Browser QA evidence for the static five-lane plugin interface suite, year controls, H1/H2 cadence, maturity signals, readiness gates, and coverage metrics. |
| [reviews/VIDEO_HERO_SHOWCASE_QA.md](reviews/VIDEO_HERO_SHOWCASE_QA.md) | QA evidence and release boundary for the four-page cinematic Video Hero showcase. |
| [reviews/VIDEO_HERO_PERFORMANCE_BUDGET.md](reviews/VIDEO_HERO_PERFORMANCE_BUDGET.md) | Loading, provenance, reduced-motion, and local-artifact budget for the Video Hero showcase. |
| [reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md) | Repeatable browser-smoke evidence for SEIS Code, Mythic Gacha, SEIS Linux Replica, Second Brain, and the browser-local export bridge. |
| [product/seis-demo-status.md](product/seis-demo-status.md) | Current-vs-planned boundary for the single-entry SEIS Desktop demo, launcher routes, AI App, SEIS Code, and shared VFS bridge. |
| [product/seis-second-brain.md](product/seis-second-brain.md) | Local Demo Second Brain contract and browser-smoke gate for installed AI profiles, sub-agent lanes, Obsidian-style Markdown vault notes, graph/backlinks, AI bridge, mobile surface, and GitHub readiness gates. |
| [product/seis-obsidian-bridge-safe-import.md](product/seis-obsidian-bridge-safe-import.md) | SEIS Obsidian Bridge Safe Import plan and no-private-note-body publication contract. |
| [reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md](reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md) | Second Brain Accessibility Focus QA for listbox/option roles, inspector focus, mobile targets, and release review. |
| [ai/read-only-model-router-contract.md](ai/read-only-model-router-contract.md) | Read-Only Model Router Contract for provider-neutral, no-secret, no-live-routing decisions. |
| [releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md](releases/PUBLIC_DEMO_RELEASE_CHECKLIST_PR54.md) | Public Demo Release Checklist PR54 after PR review and before merge or publication. |
| [../scripts/check-seis-public-demo-go-no-go.mjs](../scripts/check-seis-public-demo-go-no-go.mjs) | SEIS public demo go/no-go gate for read-only PR #54 release classification. |
| [../scripts/create-seis-obsidian-safe-import-dry-run.mjs](../scripts/create-seis-obsidian-safe-import-dry-run.mjs) | Repo-owned Obsidian safe-import dry-run artifact generator; no private vault read, plugin install, provider call, SSH, GitHub mutation, or deployment. |
| [../scripts/create-seis-read-only-model-router-decision.mjs](../scripts/create-seis-read-only-model-router-decision.mjs) | Provider-neutral read-only model-router decision artifact generator; no credential validation, provider call, prompt-body storage, private Obsidian routing, or live-routing approval. |
| [../scripts/create-seis-second-brain-accessibility-focus-report.mjs](../scripts/create-seis-second-brain-accessibility-focus-report.mjs) | Second Brain accessibility/focus QA artifact generator for ARIA/focus evidence and human-review blockers. |
| [../scripts/create-seis-second-brain-agent-registry.mjs](../scripts/create-seis-second-brain-agent-registry.mjs) | Second Brain agent registry artifact generator for installed AI, sub-agent, Obsidian, plugin, MCP, and connector review boundaries. |
| [../reports/seis-public-demo/go-no-go-latest.md](../reports/seis-public-demo/go-no-go-latest.md) | Latest SEIS public demo go/no-go report artifact for PR #54 release review. |
| [../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md](../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md) | Latest Obsidian safe-import dry-run artifact for repo-owned seed note metadata review. |
| [../reports/seis-public-demo/read-only-model-router-decision-latest.md](../reports/seis-public-demo/read-only-model-router-decision-latest.md) | Latest read-only model-router decision artifact for installed AI fixture review. |
| [../reports/seis-public-demo/second-brain-accessibility-focus-latest.md](../reports/seis-public-demo/second-brain-accessibility-focus-latest.md) | Latest Second Brain accessibility/focus QA artifact for public demo review. |
| [../reports/seis-public-demo/second-brain-agent-registry-latest.md](../reports/seis-public-demo/second-brain-agent-registry-latest.md) | Latest Second Brain agent registry artifact for installed AI, sub-agent, plugin, MCP, and connector review. |
| [../reports/seis-public-demo/pr54-review-packet-latest.md](../reports/seis-public-demo/pr54-review-packet-latest.md) | PR #54 public demo review packet with required reviewer decisions and current blockers. |
| [../reports/seis-public-demo/worktree-review-latest.md](../reports/seis-public-demo/worktree-review-latest.md) | Dirty worktree classification for PR #54 release-candidate review. |
| [../reports/seis-public-demo/pr54-stage-plan-latest.md](../reports/seis-public-demo/pr54-stage-plan-latest.md) | PR #54 Second Brain readiness stage plan for human-reviewed commit preparation. |
| [roadmap/MASTER_BACKLOG.md](roadmap/MASTER_BACKLOG.md) | Master backlog for reviewable SEIS work. |
| [roadmap/NEXT_PR_QUEUE.md](roadmap/NEXT_PR_QUEUE.md) | Recommended next PR queue and approval gates. |

## Platform Lanes

| Document | Purpose |
| --- | --- |
| [architecture/seis-platform-lanes.md](architecture/seis-platform-lanes.md) | Foundation boundaries for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`. |
| [architecture/seis-full-stack-transition.md](architecture/seis-full-stack-transition.md) | No-key full-stack transition contract for read-only `/_server/*` endpoints, backend-only provider secrets, and Local Demo fallback. |
| [operations/seis-cloud-foundation.md](operations/seis-cloud-foundation.md) | Cloud, deployment, and SSH safety foundation. |
| [deployment/seis-ssh-public-github-access.md](deployment/seis-ssh-public-github-access.md) | SEIS SSH Public GitHub Access runbook: `SEIS-SSH`, same server/port preservation, and public onboarding gates. |
| [deployment/seis-ssh-live-readiness-evidence.md](deployment/seis-ssh-live-readiness-evidence.md) | Latest approval-gated `SEIS-SSH` live probe evidence, currently blocked by GitHub Codespaces billing while preserving the same server and port. |
| [platform/big-tech-mcp-skill-inventory.md](platform/big-tech-mcp-skill-inventory.md) | Google, Kimi, Claude, Apple, Windows/Microsoft, and major technology MCP/skill/plugin inventory. |
| [product/seis-code-foundation.md](product/seis-code-foundation.md) | SEIS Code workspace foundation. |
| [reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md) | Browser-smoke evidence for SEIS Code, Mythic Gacha, SEIS Linux Replica, and shared workspace export behavior. |
| [design-system/seis-design-foundation.md](design-system/seis-design-foundation.md) | Design-system foundation and evidence rules. |
| [design-system/component-inventory.md](design-system/component-inventory.md) | Validator-backed component inventory for current web surfaces. |
| [data/seis-data-foundation.md](data/seis-data-foundation.md) | Data foundation, records, and validation expectations. |
| [data/schema-registry.md](data/schema-registry.md) | Validator-backed registry for current structured records. |

## Command Center And AI

| Document | Purpose |
| --- | --- |
| [product/command-center-foundation.md](product/command-center-foundation.md) | Command Center module contract and evidence rules. |
| [product/plugin-interface-suite.md](product/plugin-interface-suite.md) | Read-only interface foundation for `@seis`, `@seis-cloud`, `@seis-code`, `@seis-design`, and `@seis-data`. |
| [product/seis-demo-status.md](product/seis-demo-status.md) | Working demo boundary for SEIS Desktop as the single entry point, SEIS Search routes, AI Plugin Center tabs, and shared browser-local VFS. |
| [product/seis-second-brain.md](product/seis-second-brain.md) | Browser-local knowledge OS foundation for all current installed AI profiles, managed sub-agent lanes, the 12-agent target roster, Obsidian-style Markdown vault notes, and GitHub readiness review. |
| [product/seis-obsidian-bridge-safe-import.md](product/seis-obsidian-bridge-safe-import.md) | Obsidian bridge safe import gates for explicit user-selected source path, dry-run manifest, no secrets, provenance, accessibility, and approval before GitHub publication. |
| [reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md](reviews/SECOND_BRAIN_ACCESSIBILITY_FOCUS_QA.md) | Second Brain Accessibility Focus QA for keyboard focus, ARIA roles, inspector focus, and mobile target safety. |
| [reviews/NVIDIA_INSTALLED_INTEGRATIONS_REVIEW.md](reviews/NVIDIA_INSTALLED_INTEGRATIONS_REVIEW.md) | Review packet for NVIDIA installed skill integrations, Store/Search/AI surfaces, runtime boundary, and validation commands. |
| [product/shared-vfs-contract.md](product/shared-vfs-contract.md) | Browser-local shared VFS contract for Desktop, SEIS Code, Terminal, and Mythic Gacha exports. |
| [product/video-hero-showcase.md](product/video-hero-showcase.md) | Four-page cinematic Video Hero showcase contract and validation notes. |
| [product/mythic-gacha.md](product/mythic-gacha.md) | Playable no-key Shan Hai Jing inspired gacha and bestiary foundation. |
| [ai/seis-ai-core.md](ai/seis-ai-core.md) | Provider-neutral SEIS AI Core foundation. |
| [ai/ai-workforce-training.md](ai/ai-workforce-training.md) | Installed AI workforce training contract for supervised seed-model improvement without cloud fine-tuning claims. |
| [ai/nvidia-accelerator-catalog.md](ai/nvidia-accelerator-catalog.md) | NVIDIA GitHub, Build skills, and run-anywhere model catalog intake with dry-run install queue and no-clone/no-download/no-NIM boundary. |
| [ai/nvidia-installed-integrations.md](ai/nvidia-installed-integrations.md) | 11 local NVIDIA skill manifests installed into SEIS as runtime-gated capability records. |
| [ai/seis-model-scaling.md](ai/seis-model-scaling.md) | Planned 20B / 16GB+ RAM compatibility target plus future 70B and 150B frontier scale ladder without trained-weight claims. |
| [ai/model-router.md](ai/model-router.md) | Provider-neutral model routing contract and evidence requirements. |
| [ai/read-only-model-router-contract.md](ai/read-only-model-router-contract.md) | Read-only provider-neutral router contract: Missing Key is not Error, local-only never routes to cloud, and live execution waits for backend-only mediation. |
| [ai/prompt-engine.md](ai/prompt-engine.md) | Versioned prompt-pack contract and prompt safety rules. |
| [ai/agent-runtime.md](ai/agent-runtime.md) | Human-supervised agent runtime contract and permission boundaries. |
| [security/security-baseline.md](security/security-baseline.md) | Current security baseline and blockers. |
| [audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md](audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md) | Redacted static provider and credential audit. |

## Goal Tracking OS

| Document | Purpose |
| --- | --- |
| [goals/seis-vision.md](goals/seis-vision.md) | Long-term SEIS vision and guardrails. |
| [goals/long-term-goals.md](goals/long-term-goals.md) | Strategic category goal matrix. |
| [goals/goal-tracking-system.md](goals/goal-tracking-system.md) | Goal Tracking OS rules and storage model. |
| [goals/seis-universe-omega-goal-system.md](goals/seis-universe-omega-goal-system.md) | SEIS Universe Omega 24-phase goal coverage record and validator. |
| [goals/seis-universe-omega-phase-evidence.md](goals/seis-universe-omega-phase-evidence.md) | Phase 01, 02, 03, and 10 dependency, KPI, and success-metric evidence slice. |
| [goals/goal-schema.md](goals/goal-schema.md) | Lightweight schema. |
| [goals/milestone-map.md](goals/milestone-map.md) | Milestone map. |
| [goals/horizon-map.md](goals/horizon-map.md) | Yearly, quarterly, monthly, and weekly planning horizons. |
| [goals/project-epic-task-map.md](goals/project-epic-task-map.md) | Project, epic, task, and subtask hierarchy map. |
| [goals/archive-ledger.md](goals/archive-ledger.md) | Historical, deferred, and review-candidate archive boundary. |
| [goals/progress-review.md](goals/progress-review.md) | Current progress review. |
| [goals/review-cadence.md](goals/review-cadence.md) | Planned daily, weekly, and monthly review cadence contract. |
| [goals/progress-ledger.md](goals/progress-ledger.md) | Completed, deferred, and follow-up progress ledger. |
| [goals/evidence-ledger.md](goals/evidence-ledger.md) | Evidence rules and current evidence records. |
| [goals/execution-board.md](goals/execution-board.md) | Tasks, blockers, and decisions. |
| [goals/command-center-view-model.md](goals/command-center-view-model.md) | Generated Command Center Goal Tracking view model. |
| [goals/daily-review-template.md](goals/daily-review-template.md) | Daily review template. |
| [product/goal-tracking-center.md](product/goal-tracking-center.md) | Command Center module contract. |
| [product/command-center-goals-view.md](product/command-center-goals-view.md) | UI view contract. |
| [reviews/GOAL_TRACKING_REVIEW.md](reviews/GOAL_TRACKING_REVIEW.md) | Foundation review. |
| [roadmap/MASTER_BACKLOG.md](roadmap/MASTER_BACKLOG.md) | Backlog. |
| [roadmap/NEXT_PR_QUEUE.md](roadmap/NEXT_PR_QUEUE.md) | Next PR queue. |
| [STATUS.md](STATUS.md) | Current branch status. |

## Structured Records

| Record | Purpose |
| --- | --- |
| [../content/development/seis-goal-tracking.json](../content/development/seis-goal-tracking.json) | Goal registry. |
| [../content/development/seis-goal-evidence.json](../content/development/seis-goal-evidence.json) | Evidence records. |
| [../content/development/seis-goal-execution.json](../content/development/seis-goal-execution.json) | Tasks, blockers, and decisions. |
| [../content/development/seis-goal-review-cadence.json](../content/development/seis-goal-review-cadence.json) | Planned review cadence records. |
| [../content/development/seis-goal-progress-ledger.json](../content/development/seis-goal-progress-ledger.json) | Completed, deferred, and follow-up ledger records. |
| [../content/development/seis-goal-hierarchy.json](../content/development/seis-goal-hierarchy.json) | Planning horizon, project, epic, and subtask records. |
| [../content/development/seis-goal-archive-ledger.json](../content/development/seis-goal-archive-ledger.json) | Archive boundary records. |
| [../content/development/seis-universe-omega-goal-system.json](../content/development/seis-universe-omega-goal-system.json) | SEIS Universe Omega 24-phase goal coverage record. |
| [../content/development/seis-universe-omega-phase-evidence.json](../content/development/seis-universe-omega-phase-evidence.json) | Phase 01, 02, 03, and 10 dependency, KPI, and success-metric evidence record. |
| [../content/development/seis-goal-command-center-view.json](../content/development/seis-goal-command-center-view.json) | Generated Command Center view data. |
| [../content/development/seis-integration-map.json](../content/development/seis-integration-map.json) | Canonical workstream-to-GitHub integration map. |
| [../content/development/seis-plugin-interface-roadmap.json](../content/development/seis-plugin-interface-roadmap.json) | Static plugin interface lane records, five-year roadmap, development-program commitments, H1/H2 cadence, maturity signals, and readiness gates. |
| [../content/development/plugin-skill-capability-map.json](../content/development/plugin-skill-capability-map.json) | Static capability records for the plugin interface suite. |
| [../content/lab/cinematic-engine.json](../content/lab/cinematic-engine.json) | Static command deck for the web interface. |
| [../content/lab/quality-console.json](../content/lab/quality-console.json) | Static quality signals for the plugin interface suite. |
| [../content/development/seis-data-schema-registry.json](../content/development/seis-data-schema-registry.json) | Schema registry for current structured records. |
| [../content/development/seis-fullstack-contract.json](../content/development/seis-fullstack-contract.json) | `validated-contract` full-stack session/API/data boundary for `/_server/*` Local Demo endpoints with backend-only provider secret rules. |
| [../content/development/seis-design-component-inventory.json](../content/development/seis-design-component-inventory.json) | Component inventory for current web and showcase surfaces. |
| [../content/development/seis-ai-workforce-training-plan.json](../content/development/seis-ai-workforce-training-plan.json) | Installed AI workforce training plan for supervised local seed-model rebuilds and no-runtime-authority promotion gates. |
| [../content/development/seis-nvidia-accelerator-catalog.json](../content/development/seis-nvidia-accelerator-catalog.json) | NVIDIA accelerator catalog contract for GitHub org, Build skills, and Build models as dry-run-only source awareness. |
| [../content/development/seis-nvidia-installed-integrations.json](../content/development/seis-nvidia-installed-integrations.json) | Installed local NVIDIA skill integration registry with 11 runtime-gated capability records. |
| [../content/development/seis-big-tech-mcp-skill-inventory.json](../content/development/seis-big-tech-mcp-skill-inventory.json) | Google, Kimi, Claude, Apple, Windows/Microsoft, and major technology MCP/skill/plugin inventory for the 2026-06-29 install pass. |
| [../content/development/seis-second-brain-system.json](../content/development/seis-second-brain-system.json) | Second Brain contract for installed AI profiles, managed sub-agent lanes, Obsidian-style Markdown vault records, graph/backlinks, AI bridge, browser-smoke validation, and GitHub readiness gates. |
| [../content/development/seis-obsidian-bridge-safe-import-contract.json](../content/development/seis-obsidian-bridge-safe-import-contract.json) | Obsidian bridge safe import contract for explicit user selection, dry-run manifest, no private note body, provenance, accessibility, and publication approval gates. |
| [../content/development/seis-second-brain-accessibility-focus-qa.json](../content/development/seis-second-brain-accessibility-focus-qa.json) | Second Brain Accessibility Focus QA contract for listbox/option roles, inspector focus, focus-visible markers, and mobile control safety. |
| [../content/development/seis-read-only-model-router-contract.json](../content/development/seis-read-only-model-router-contract.json) | Read-only model-router contract with no runtime authority, no provider calls, no browser secrets, and no silent fallback. |
| [../content/development/seis-public-demo-release-checklist-pr54.json](../content/development/seis-public-demo-release-checklist-pr54.json) | Public Demo Release Checklist PR54 review gate before merge, Pages publication, deployment, or public release. |
| [../deploy/seis-ssh-public-access-contract.json](../deploy/seis-ssh-public-access-contract.json) | SEIS SSH Public GitHub Access contract for `SEIS-SSH`, Keep the same server and port, and approval-gated live SSH claims. |
| [../scripts/check-seis-ssh-public-access.mjs](../scripts/check-seis-ssh-public-access.mjs) | Validator for the public SEIS-SSH contract, docs, Desktop Cloud Center surface, and no-secret boundary. |
| [../scripts/create-seis-ssh-public-access-report.mjs](../scripts/create-seis-ssh-public-access-report.mjs) | Sanitized report generator for `SEIS-SSH` local config, same server/port policy, and no-live-SSH review packets. |
| [../scripts/create-seis-ssh-public-onboarding-pack.mjs](../scripts/create-seis-ssh-public-onboarding-pack.mjs) | Read-only GitHub onboarding pack generator for reviewer, maintainer, and new-contributor SEIS-SSH paths without config writes or live SSH. |
| [../scripts/check-seis-ssh-public-contributor-doctor.mjs](../scripts/check-seis-ssh-public-contributor-doctor.mjs) | Read-only contributor doctor for local tool readiness, GitHub remote shape, sanitized `SEIS-SSH` snapshot, and no-config-write public SSH review. |
| [../content/development/seis-ssh-live-readiness-evidence.json](../content/development/seis-ssh-live-readiness-evidence.json) | Machine-readable live readiness evidence for the latest approval-gated `SEIS-SSH` probe and billing blocker. |
| [../scripts/check-seis-ssh-live-readiness-evidence.mjs](../scripts/check-seis-ssh-live-readiness-evidence.mjs) | Validator that keeps the live readiness blocker explicit and prevents live-ready overclaims while the provider billing issue remains. |
| [../scripts/check-seis-public-demo-go-no-go.mjs](../scripts/check-seis-public-demo-go-no-go.mjs) | Read-only public demo NO-GO/GO classifier for PR #54 release review. |
| [../scripts/create-seis-obsidian-safe-import-dry-run.mjs](../scripts/create-seis-obsidian-safe-import-dry-run.mjs) | Obsidian safe import dry-run artifact generator for PR #54 review evidence. |
| [../scripts/create-seis-read-only-model-router-decision.mjs](../scripts/create-seis-read-only-model-router-decision.mjs) | Read-only model-router decision artifact generator for PR #54 review evidence. |
| [../scripts/create-seis-second-brain-accessibility-focus-report.mjs](../scripts/create-seis-second-brain-accessibility-focus-report.mjs) | Second Brain accessibility/focus artifact generator for PR #54 review evidence. |
| [../scripts/create-seis-second-brain-agent-registry.mjs](../scripts/create-seis-second-brain-agent-registry.mjs) | Second Brain agent registry artifact generator for PR #54 installed AI and sub-agent review evidence. |
| [../reports/seis-public-demo/go-no-go-latest.json](../reports/seis-public-demo/go-no-go-latest.json) | Machine-readable public demo NO-GO/GO artifact generated by `npm run report:seis-public-demo-go-no-go`. |
| [../reports/seis-public-demo/evidence-manifest-latest.json](../reports/seis-public-demo/evidence-manifest-latest.json) | Evidence manifest for PR #54 public demo release requirements, blockers, and current proof status. |
| [../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json](../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json) | Machine-readable Obsidian safe-import dry-run artifact generated by `npm run report:seis-obsidian-safe-import-dry-run`. |
| [../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md](../reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md) | Reader-facing Obsidian safe-import dry-run artifact generated by `npm run report:seis-obsidian-safe-import-dry-run`. |
| [../reports/seis-public-demo/read-only-model-router-decision-latest.json](../reports/seis-public-demo/read-only-model-router-decision-latest.json) | Machine-readable read-only model-router decision artifact generated by `npm run report:seis-read-only-model-router-decision`. |
| [../reports/seis-public-demo/read-only-model-router-decision-latest.md](../reports/seis-public-demo/read-only-model-router-decision-latest.md) | Reader-facing read-only model-router decision artifact generated by `npm run report:seis-read-only-model-router-decision`. |
| [../reports/seis-public-demo/second-brain-accessibility-focus-latest.json](../reports/seis-public-demo/second-brain-accessibility-focus-latest.json) | Machine-readable Second Brain accessibility/focus QA artifact generated by `npm run report:seis-second-brain-accessibility-focus-report`. |
| [../reports/seis-public-demo/second-brain-accessibility-focus-latest.md](../reports/seis-public-demo/second-brain-accessibility-focus-latest.md) | Reader-facing Second Brain accessibility/focus QA artifact generated by `npm run report:seis-second-brain-accessibility-focus-report`. |
| [../reports/seis-public-demo/second-brain-agent-registry-latest.json](../reports/seis-public-demo/second-brain-agent-registry-latest.json) | Machine-readable Second Brain agent registry artifact generated by `npm run report:seis-second-brain-agent-registry`. |
| [../reports/seis-public-demo/second-brain-agent-registry-latest.md](../reports/seis-public-demo/second-brain-agent-registry-latest.md) | Reader-facing Second Brain agent registry artifact generated by `npm run report:seis-second-brain-agent-registry`. |
| [../reports/seis-public-demo/pr54-review-packet-latest.md](../reports/seis-public-demo/pr54-review-packet-latest.md) | Reader-facing PR #54 release-review packet generated by `npm run report:seis-public-demo-go-no-go`. |
| [../reports/seis-public-demo/worktree-review-latest.md](../reports/seis-public-demo/worktree-review-latest.md) | Reader-facing dirty worktree review generated by `npm run report:seis-public-demo-go-no-go`. |
| [../reports/seis-public-demo/pr54-stage-plan-latest.md](../reports/seis-public-demo/pr54-stage-plan-latest.md) | Reader-facing PR #54 stage plan generated by `npm run report:seis-public-demo-go-no-go`. |
| [../content/development/seis-model-scaling-hardware-profile.json](../content/development/seis-model-scaling-hardware-profile.json) | Planned 20B local-compatibility profile, 16GB+ RAM target class, and future 70B / 150B frontier scale ladder with no live runtime authority. |
| [../content/development/seis-model-parameter-ladder.json](../content/development/seis-model-parameter-ladder.json) | `planning-contract-not-runtime` parameter ladder from 20B / 16GB+ through 70B, 150B, 300B+, and highest-future classes with every model route blocked. |
| [../content/development/seis-model-frontier-escalation-policy.json](../content/development/seis-model-frontier-escalation-policy.json) | No-skip-20B frontier escalation policy for 70B, 150B, and highest-future model classes without routeable-weight or trained-model claims. |
| [../content/development/seis-150b-frontier-model-program.json](../content/development/seis-150b-frontier-model-program.json) | `frontier-program-plan-only` 150B Frontier Model Program with stage, promotion, agent, and non-claim gates; exposed as `seis://ai/150b-frontier-model-program.json`. |
| [../content/development/seis-model-scaling-subagent-council.json](../content/development/seis-model-scaling-subagent-council.json) | `active-plan-only` 12-agent model-scaling council for 20B evidence preparation and 70B/150B non-claim gates. |
| [../content/development/seis-20b-model-card-template.json](../content/development/seis-20b-model-card-template.json) | `template-not-filled` clean-room model card required before any 20B model artifact, benchmark, route eligibility, or runtime claim. |
| [../content/development/seis-20b-dataset-card-template.json](../content/development/seis-20b-dataset-card-template.json) | `template-not-filled` clean-room dataset card required before any dataset download, ingestion, training, fine-tuning, benchmark, provider upload, or publication. |
| [../reports/seis-model-scaling/20b-16gb-memory-benchmark.json](../reports/seis-model-scaling/20b-16gb-memory-benchmark.json) | `template-not-measured` benchmark manifest for the future 20B / 16GB+ memory test; not benchmark evidence. |
| [../apps/web/goal-tracking.html](../apps/web/goal-tracking.html) | Generated static Goal Tracking Center page. |
