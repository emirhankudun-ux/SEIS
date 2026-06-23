# SEIS AI Core and Command Center Five-Year Development Program

Status: Foundation program
Owner: Human maintainer with AI-assisted implementation
Scope: AI Core, Command Center, SEIS App, evaluation, security, local model
strategy, provider routing, and SEIS Universe research governance

## Purpose

This program turns the SEIS AI mission into a five-year development track that
keeps the AI system and the application interface moving together.

SEIS is building two connected products:

- SEIS AI Core, the application-layer intelligence system.
- SEIS Command Center / SEIS App, the operating interface that exposes AI Core
  safely to the ecosystem.

The objective is not to claim a trained SEIS foundation model, a live provider
integration, or a completed autonomous system. The objective is to define a
long-running, reviewable, evidence-gated path from foundation contracts to a
usable AI-native operating platform.

## Current Evidence State

| Area | Current status | Evidence |
| --- | --- | --- |
| AI Core architecture | Foundation documented | `docs/ai/seis-ai-core.md` |
| Model router | Foundation documented | `docs/ai/model-router.md`, `packages/model-router/README.md` |
| Prompt engine | Foundation documented | `docs/ai/prompt-engine.md`, `packages/prompt-engine/README.md` |
| Agent runtime | Fixture-backed contract | `docs/ai/agent-runtime.md`, `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json` |
| AI operating model | Fixture-backed contract | `docs/ai/seis-ai-operating-model-5-year.md`, `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json` |
| Tool registry | Fixture-backed contract | `docs/ai/tool-use-policy.md`, `packages/tool-registry/fixtures/tool-registry-permissions.json` |
| 10,000,000 token feed budget | Fixture-backed metadata-only plan | `packages/data/fixtures/seis-10m-token-feed-budget.json`, `npm run check:token-feed-budget` |
| AI App / Command Center | Foundation documented | `docs/product/seis-ai-app.md`, `docs/product/command-center.md` |
| Shared contracts | Foundation documented | `docs/architecture/ai-core-app-shared-contracts.md`, `packages/shared-types/README.md` |
| Evaluation strategy | Foundation documented | `docs/evals/evaluation-strategy.md`, `docs/testing/prompt-regression-suite.md` |
| Provider data policy | Foundation documented | `docs/security/model-provider-data-policy.md` |
| SEIS Universe research | Future research documented | `docs/ai/seis-universe-research.md`, `docs/ai/model-development-roadmap.md` |
| Live provider routing | Not implemented in this program | Requires future adapter evidence |
| Trained SEIS model | Not present | Requires training logs, data provenance, checkpoints, evals, and model card |

## Five-Year Outcome

By the end of five years, SEIS should be able to show:

- A real Command Center interface with evidence-backed AI Core controls.
- A provider-neutral model-router with local, private, and approved external
  routing modes.
- A prompt-engine with versioned prompts, prompt regression tests, and release
  discipline.
- A supervised agent-runtime with clear roles, tool boundaries, approvals, and
  audit events.
- A knowledge/retrieval layer that distinguishes official, generated, archived,
  live, private, and unknown sources.
- An evaluation lab that tests prompts, routes, app states, agent behavior, and
  future model experiments.
- A responsible SEIS Universe research lane that can run small, documented
  experiments without inflating claims.

## Non-Claims

This program does not claim:

- SEIS owns a trained foundation model.
- SEIS has performed model training.
- SEIS has benchmark performance.
- SEIS has live external provider routing.
- SEIS has a production deployment.
- SEIS has autonomous approval authority.
- SEIS has access to private, leaked, or proprietary datasets.

Each of those claims requires direct evidence before it can appear in official
docs, UI, reports, releases, or PR descriptions.

## Operating Tracks

| Track | Responsibility | First evidence |
| --- | --- | --- |
| AI Core | Router, prompts, agents, tools, memory, evals, provider modes | Contract docs and package README files |
| Command Center / App | Human interface for AI Core, approvals, evidence, roadmap, security | Product and architecture docs |
| Shared Contracts | Stable objects between AI Core and app | `modelRoute`, `promptVersion`, `agentTask`, `toolRegistryEntry`, `knowledgeSource`, `retrievalQueryAdapter`, `retrievalResultCard`, `noContentSearchTranscript`, `approvalRequest`, `evaluationResult`, `auditEvent` |
| Evaluation | Prompt, route, agent, app-state, retrieval, and model research checks | `docs/evals/evaluation-strategy.md` |
| Security and Privacy | Provider data handling, secret isolation, approval gates, SSH safety | `docs/security/model-provider-data-policy.md`, `SECURITY.md` |
| Knowledge System | Retrieval and memory boundaries, source class, freshness, privacy mode | `docs/ai/context-memory-boundary.md` |
| SEIS Universe Research | Data, tokenizer, nano model, fine-tuning, checkpoints, model cards | `docs/ai/seis-universe-research.md` |
| GitHub Governance | Main-centered review flow, PR evidence, branch isolation, CI gates | `AGENTS.md`, `docs/governance/branch-policy.md` |

## Year 1 - Foundation to Reviewable Prototype

Goal: convert foundation documents into minimal, typed, locally inspectable
contracts and UI fixtures without introducing unreviewed provider access.

Primary work:

- Define stable TypeScript or JSON schemas for shared AI Core and Command Center
  objects.
- Build fixture-backed Command Center views for AI Core status, model routes,
  prompt versions, agent tasks, evaluations, approvals, and evidence.
- Add prompt pack metadata and prompt regression fixture format.
- Add model-router route request/response contract.
- Add agent-runtime task lifecycle states and approval state contract.
- Add bounded subagent operating-model fields for delegation depth, child
  limits, handoff, execution budget, and escalation.
- Add eval result schema for prompt, route, agent, app-state, and retrieval
  checks.
- Add a 10,000,000 token metadata-only feed budget fixture that can feed
  Command Center evidence without claiming executed ingestion.
- Keep all provider keys server-side or absent.
- Keep local/private mode as the first safe user-facing mode.

Promotion gates:

- `git diff --check`
- repo governance checks
- `npm run check:agent-runtime-lifecycle`
- AI Core and app docs match contracts
- no provider key exposure
- no trained-model ownership claims
- no fake UI status
- rollback path documented for each feature PR

Exit evidence:

- At least one fixture-backed Command Center AI Core surface.
- Shared contract fixtures reviewed in a PR.
- Prompt regression suite runs on fixture data.
- Evaluation report format can represent pass, fail, blocked, and unknown.
- Token feed budget fixture validates planned 10,000,000 token capacity with
  executed ingestion remaining at 0 tokens.

## Year 2 - Product Alpha and Controlled Provider Routing

Goal: make SEIS AI App usable for real local repository assistance while keeping
external routing behind explicit policy and approval.

Primary work:

- Implement local repository assistant workflows for read-only inspection,
  documentation help, roadmap planning, and review summaries.
- Add server-side provider adapter boundary without browser-exposed secrets.
- Add provider privacy modes to settings and route decisions.
- Add local model adapter strategy for Ollama-style or equivalent local
  runtimes when explicitly installed by the user.
- Add evaluation dashboards for prompt regressions and route behavior.
- Add approval center MVP for risky tools and external-provider routing.
- Add evidence locker records for AI actions, validation claims, and blocked
  work.

Promotion gates:

- provider routing policy review
- prompt regression pass for supported surfaces
- secret scan before PR
- app accessibility review for new views
- safe degraded mode when provider or local runtime is unavailable
- explicit human approval for privileged actions

Exit evidence:

- AI chat can answer from approved repo context with source/evidence links.
- Model router can choose between disabled, local-only, metadata-only, and
  approved external-provider modes.
- Command Center shows route, prompt, agent, eval, approval, and audit state.
- Provider adapter tests prove credentials do not leave the server boundary.

## Year 3 - Platform Beta and Operational AI Workflows

Goal: turn the AI App into an operating surface for repository, documentation,
architecture, security, PR, release, and roadmap workflows.

Primary work:

- Expand assistants for repository review, documentation review, architecture
  review, security review, PR review, release readiness, and roadmap planning.
- Add task orchestration for multi-step agent runs with cancellation, timeout,
  approval, and audit events.
- Add knowledge indexing with provenance, source class, freshness, and privacy
  mode.
- Add GitHub workflow integration only after auth and permission boundaries are
  documented and tested.
- Add local-first degraded operation for offline or provider-blocked states.
- Add Command Center views for mission board, AI Core health, route quality,
  prompt quality, and evaluation trends.

Promotion gates:

- permission and audit checks for every write-capable workflow
- route and prompt regression tests before app release
- source provenance review for knowledge ingestion
- manual security review for GitHub or SSH integration changes
- no automatic merge, deploy, key change, or branch deletion

Exit evidence:

- Human-supervised agent tasks can move from request to evidence without hidden
  side effects.
- Command Center can show unknown, planned, blocked, degraded, running, failed,
  validated, and approval-needed states accurately.
- PR/release readiness assistant can produce evidence-backed review output.

## Year 4 - SEIS Universe Research Gate and Local Model Maturity

Goal: begin responsible model research only after the application layer has
stable evaluation, data governance, and security boundaries.

Primary work:

- Complete baseline AI module, compute, data, security, and model-claim audit.
- Define dataset intake, licensing, consent, filtering, deduplication, split,
  contamination, and secret-detection manifests.
- Research tokenizer requirements for Turkish, English, programming languages,
  math notation, design terminology, Unicode, and byte fallback.
- Run nano-model experiments only with approved data, reproducible scripts,
  logs, checkpoints, and evaluation reports.
- Add model card drafts only for real experiments with evidence.
- Add fine-tuning or LoRA plans only when dataset provenance and evaluation
  criteria are complete.

Promotion gates:

- no private, leaked, or proprietary data
- no training without approved compute and data plan
- no benchmark claim without benchmark run
- no checkpoint publication without model card and governance approval
- nano model must pass tiny overfit, checkpoint restore, eval, generation, and
  reproducibility checks before scale

Exit evidence:

- SEIS Universe research can distinguish provider use, prompt behavior,
  retrieval, fine-tune, adapter, quantization, and SEIS-owned weights.
- At least one tiny research experiment has complete logs, data provenance,
  checkpoint governance, eval report, and model card if training is approved.

## Year 5 - Platform-Grade Governance and Release Discipline

Goal: mature SEIS into a sustainable AI-native operating platform with clear
public, private, local, provider, and research boundaries.

Primary work:

- Stabilize Command Center AI controls for production-quality human review.
- Mature model-router and prompt-engine release versioning.
- Add long-term eval trend reporting and regression baselines.
- Define model/provider cost, quality, latency, privacy, and safety scorecards.
- Mature plugin/tool registry permissions and risk classes.
- Mature incident response for AI, provider, SSH, GitHub, plugin, data, and
  model research issues.
- Publish only evidence-backed capabilities and research artifacts.

Promotion gates:

- quality, security, documentation, rollback, and AI gates pass together
- release notes distinguish implemented, planned, blocked, fixture-backed, and
  research-only features
- public claims match validated evidence
- provider, local model, and SEIS-owned model boundaries are visible in docs and
  UI
- human approval remains mandatory for high-impact actions

Exit evidence:

- SEIS can ship app releases with reproducible validation evidence.
- AI Core behavior versions can be promoted or rolled back.
- Research artifacts can be audited from data intake to evaluation.
- Command Center can explain its own status without fabricating readiness.

## Five-Year Promotion Model

| Maturity | Allowed claim | Required proof |
| --- | --- | --- |
| Planned | Work is intended | Roadmap entry and owner |
| Draft | Contract exists | Docs or schemas reviewed |
| Fixture-backed | UI or logic uses local sample data | Fixture files and tests |
| Local alpha | Works locally with safe boundaries | Local validation output |
| Provider alpha | Uses external provider with policy | Adapter tests, secret scan, approval logs |
| Beta | Multiple workflows are usable by reviewers | E2E or integration evidence |
| Stable | Repeated releases pass gates | Release notes, checks, regression history |
| Research-only | Experiment exists but is not product capability | Dataset, logs, checkpoint, eval, model card if applicable |

## Cadence

| Cadence | Review |
| --- | --- |
| Every PR | Scope, security, docs, rollback, validation, non-claims |
| Monthly | Mission board, AI Core/app maturity, blocked work, validation drift |
| Quarterly | Provider routing, prompt regression, eval coverage, security posture |
| Yearly | Program review, roadmap reset, public claims audit, research readiness |

## Approval Boundaries

Human approval is required before:

- external provider routing is enabled for sensitive repo content
- provider keys or secret references are configured
- GitHub write actions are enabled
- SSH commands, deployments, or infrastructure changes are executed
- model training, fine-tuning, LoRA, checkpoint publication, or model release
  happens
- benchmark or model ownership claims are published

## Immediate Next PR Slices

1. Add retrieval result card rendering and no-content search transcript fixtures.

Completed foundation slice:

- Schema-backed shared contracts for AI Core and Command Center objects now live
  under `packages/shared-types/` and are checked by
  `npm run check:ai-core-app-contracts`.
- Fixture-backed Command Center AI Core views now render route, prompt, agent,
  approval, evaluation, audit, security, roadmap, and goal-state records from
  `apps/seis-core/ai-core-contract-fixture.js`.
- Prompt regression fixtures for repository, documentation, architecture,
  security, PR, roadmap, and research assistant surfaces now live under
  `packages/prompt-engine/` and are checked by
  `npm run check:prompt-regression-fixtures`.
- A local read-only repository assistant prototype with source-linked output now
  lives under `packages/repository-assistant/` and is checked by
  `npm run check:repository-assistant-prototype`.
- Prompt and app-state fixture evaluation report generation now lives under
  `packages/evals/` and `reports/evals/`, and is checked by
  `npm run check:ai-core-fixture-evaluation-report`.
- Model-router request and response contract fixtures for local-only,
  metadata-only, and approval-needed provider routes now live under
  `packages/model-router/` and are checked by
  `npm run check:model-router-contracts`.
- Agent-runtime task lifecycle and approval-state fixtures now live under
  `packages/agent-runtime/` and are checked by
  `npm run check:agent-runtime-lifecycle`.
- Tool and plugin registry permission and risk-class fixtures now live under
  `packages/tool-registry/` and are checked by
  `npm run check:tool-registry-permissions`.
- Retrieval and knowledge source classification fixtures now live under
  `packages/data/` and are checked by
  `npm run check:knowledge-source-classification`.
- Local read-only retrieval query adapter fixtures now live under
  `packages/data/`, are rendered in the `apps/seis-core` Command Center Local
  Retrieval panel, and are checked by `npm run check:retrieval-query-adapter`.
- Local retrieval result card and no-content search transcript fixtures now
  live under `packages/data/`, are rendered in the `apps/seis-core` Command
  Center Local Retrieval panel, and are checked by
  `npm run check:retrieval-search-transcript`.
- Local query filtering controls and evidence-card empty-state tests are now
  represented by fixture records and rendered by the Command Center Local
  Retrieval panel without network, provider, embedding, memory-write, or
  raw-content behavior. The Command Center static suite also runs a JSDOM
  interaction check for query, source-class, transcript-state, reset, and
  two-panel empty-state output.
- Keyboard-focused retrieval filter QA is now covered by explicit
  `:focus-visible` styles for retrieval text/select controls and a JSDOM test
  that walks query, source-class, transcript-state, and reset focus order.
- Mobile viewport QA is now covered by a static Command Center test that
  verifies the Local Retrieval toolbar collapses to one column and preserves
  44px touch targets under the 900px breakpoint.
- Desktop and mobile viewport-contract smoke QA is now covered by a Command
  Center JSDOM test that renders the Local Retrieval toolbar and verifies
  nonblank shell content, ARIA wiring, populated local retrieval panels, safety
  boundary chips, and responsive CSS contracts without live retrieval or
  provider behavior.
- Browser-run visual QA is now repeatable through
  `npm run qa:seis-core:local-retrieval:visual`, with screenshots, DOM dumps,
  and a manifest written to ignored `reports/tmp/` artifacts. The committed
  evidence contract lives at
  `reports/evals/local-retrieval-browser-visual-qa.md`.
- Browser-run interaction QA now extends the Local Retrieval evidence path
  through `npm run qa:seis-core:local-retrieval`, verifying query entry,
  source-class selection, transcript-state selection, reset behavior, focus
  preservation, status text, credential-boundary filtering, and empty-state
  behavior across desktop and mobile browser scenarios.
- Browser-run AI Core panel navigation QA now extends the Command Center
  evidence path through `npm run qa:seis-core:ai-core-panels`, verifying
  Goals surface evidence scorecards, sidebar navigation, command palette
  navigation, global search navigation, route, prompt, agent, approval,
  evaluation, evidence, and Local Retrieval sections across desktop and mobile
  browser scenarios.
- Browser-run AI Core QA evidence drift hardening now guards the panel QA
  report, browser runner, fixture evaluation report, schema, Command Center
  validator, README, evaluation strategy, five-year roadmap, and five-year
  review through `npm run check:ai-core-browser-qa-evidence`.
- Browser-run AI Core QA evidence aggregation now provides
  `npm run qa:seis-core:ai-core-evidence` for browser run plus artifact
  verification and `npm run check:ai-core-eval-evidence` for metadata-only
  fixture/report/Command Center consistency.
- Browser-run AI Core evidence gate availability is documented in
  `docs/evals/ai-core-browser-evidence-gates.md`, separating CI-safe
  metadata-only gates from local or browser-enabled artifact gates.
- Browser-run AI Core CI proposal is documented in
  `docs/evals/ai-core-browser-ci-proposal.md`, covering Chrome/Chromium setup,
  `SEIS_BROWSER_BIN`, bounded timeout behavior, temporary artifact retention,
  failure semantics, and the approval boundary without enabling the browser
  gate in the active GitHub Actions workflow.
- Browser-run AI Core CI workflow draft is documented in
  `docs/evals/ai-core-browser-ci-workflow-draft.md` as a non-active,
  review-only GitHub Actions shape with `workflow_dispatch`, read-only
  permissions, pinned existing checkout/setup-node actions, bounded timeout,
  short artifact retention, and explicit provider/SSH/deployment/payment/infra
  non-claims.
- Browser-run AI Core activation approval is documented in
  `docs/evals/ai-core-browser-ci-activation-approval.md`, recording the human
  approval requirements, active workflow PR contents, local validation plan,
  rollback plan, security boundaries, and non-claims before an active workflow
  is created.
- Browser-run AI Core manual workflow is added at
  `.github/workflows/ai-core-browser-evidence.yml`, using `workflow_dispatch`,
  read-only permissions, pinned actions, mock/local-only environment variables,
  Chrome/Chromium verification, bounded timeout, and short artifact retention.
- Browser workflow dispatch availability is reviewed in
  `docs/evals/ai-core-browser-workflow-dispatch-review.md`; the first dispatch
  attempt returned the expected default-branch visibility blocker and created no
  GitHub run.
- Goal evidence gates and gate-derived operating scorecards are now projected
  into the Command Center Goals surface as read-only current-fixture-slice gate
  coverage, without claiming full program completion, live provider health, SSH
  execution, deployment, training, benchmark, checkpoint, or model-card
  evidence. Browser-run AI Core panel navigation QA now verifies that Goals
  surface projection by checking `goalOperatingScorecards`,
  `goalEvidenceGates`, scorecard counts, gate-chip counts, current fixture
  slice language, and explicit non-claims.

## Next Safe Slice

PR #44 now exists for this feature branch, but GitHub reports it as
`CONFLICTING` against `main`. The next safe slice is a conflict-resolution
review at `docs/reviews/SEIS_AI_CORE_PR44_CONFLICT_RESOLUTION_REVIEW.md` that
classifies divergent AI Core, Command Center, workflow, generated report, and
governance files before any merge attempt.

After conflict resolution and human-approved merge place
`.github/workflows/ai-core-browser-evidence.yml` on the default branch, run it
manually with `workflow_dispatch`, inspect the uploaded
`reports/tmp/seis-core-ai-core-panel-navigation/` artifact package, and record
GitHub run evidence before deciding whether browser evidence should become a
required branch-protection check. The default `.github/workflows/ci.yml` path
must remain metadata-only, and the browser workflow must remain provider-free,
SSH-free, deployment-free, payment-free, and infrastructure-mutation-free.

## Relationship to Existing Roadmaps

- `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md` governs ecosystem
  operations, gates, and long-horizon quality trends.
- `roadmap/seis-5-year-native-demo-roadmap.md` governs native demo UX maturity.
- This program governs the AI Core and Command Center dual-build over five
  years.
