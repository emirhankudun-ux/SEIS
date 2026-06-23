# SEIS Five-Year Development Program Review

Date: 2026-06-19
Status: Foundation review

## What This Review Covers

This review records the first five-year development program for the SEIS AI Core
and Command Center dual-build. It does not mark the five-year objective as
complete. It records the safe development path, evidence gates, non-claims, and
next PR slices.

## Added Or Improved Surfaces

- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `README.md`
- `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md`
- `roadmap/seis-long-horizon-strategy.md`

## Coverage

| Requirement | Coverage |
| --- | --- |
| Build AI Core and app together | The roadmap defines AI Core and Command Center as connected products with shared contracts. |
| Keep model-router, prompt-engine, and agent-runtime central | Each is assigned a year-one contract path and later product maturity path. |
| Support chat, repo, docs, architecture, security, PR, roadmap, code, research, and automation assistants | The roadmap assigns these to Year 2 and Year 3 productization slices with approval and evidence gates. |
| Preserve provider privacy modes and local model support | The roadmap requires local/private mode first and policy-approved provider adapters later. |
| Prepare SEIS Universe research responsibly | Year 4 requires data governance, tokenizer research, nano-model gates, checkpoint governance, evals, and model cards before scale. |
| Avoid fake model ownership claims | The non-claims section blocks training, benchmark, checkpoint, provider, and ownership claims without evidence. |
| Keep GitHub and human approval central | The program keeps branch review, PR evidence, approval gates, and no automatic merge/deploy as standing requirements. |

## Explicit Non-Claims

- No full AI App implementation was added.
- No external provider integration was added.
- No provider key was requested, stored, or exposed.
- No model training was started.
- No fine-tune, adapter, LoRA, checkpoint, benchmark, or model card was created.
- No SSH, deployment, GitHub write action, or production workflow was executed.
- No five-year outcome is claimed as complete.

## Review Decision

Safe to treat as a five-year foundation program: yes.

Safe to claim implementation completion: no.

Safe to claim SEIS-owned model training: no.

Safe to claim live provider routing: no.

## Next Safe Slices

1. Review PR #44 conflict state before any merge attempt. GitHub reports the
   AI Core app foundation continuation PR as `CONFLICTING` against `main`, so
   the next safe slice is the file-classification review at
   `docs/reviews/SEIS_AI_CORE_PR44_CONFLICT_RESOLUTION_REVIEW.md` for divergent
   AI Core, Command Center, workflow, generated report, and governance files.
2. After conflict resolution and human-approved merge place the manual AI Core
   Browser Evidence workflow on the default branch, run it with
   `workflow_dispatch`, inspect the uploaded artifact package, and record
   GitHub run evidence before considering it as a required branch-protection
   check. The default `.github/workflows/ci.yml` path must remain
   metadata-only, and the browser workflow must remain provider-free, SSH-free,
   deployment-free, payment-free, and infrastructure-mutation-free.

## Follow-Up Contract Slice

Status: Added after the initial five-year program review.

Evidence:

- `packages/shared-types/schemas/ai-core-app-contract.schema.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `scripts/check-ai-core-app-contracts.mjs`
- `npm run check:ai-core-app-contracts`

This slice completes the first immediate PR slice from the five-year program:
schema-backed shared contracts for AI Core and Command Center objects. It is
still fixture-only and does not add live provider routing, provider keys, model
training, GitHub write actions, SSH execution, or deployment behavior.

## Follow-Up Command Center Slice

Status: Added after the shared contract slice.

Evidence:

- `apps/seis-core/ai-core-contract-fixture.js`
- `apps/seis-core/index.html`
- `apps/seis-core/script.js`
- `apps/seis-core/styles.css`
- `apps/seis-core/test/seis-core-static.test.js`
- `scripts/check-seis-command-center.mjs`

This slice completes the second immediate PR slice from the five-year program:
fixture-backed Command Center AI Core views for model routes, prompt versions,
agent tasks, approvals, evaluation results, audit events, security boundaries,
roadmap evidence, and goal state. It remains local static UI and does not enable
live provider routing, provider keys, model training, SSH execution, deployment,
or GitHub write behavior.

## Follow-Up Prompt Regression Slice

Status: Added after the Command Center fixture slice.

Evidence:

- `packages/prompt-engine/schemas/prompt-regression-suite.schema.json`
- `packages/prompt-engine/fixtures/assistant-surface-regression-suite.json`
- `scripts/check-prompt-regression-fixtures.mjs`
- `npm run check:prompt-regression-fixtures`

This slice completes the prompt regression fixture slice from the five-year
program for repository, documentation, architecture, security, PR, roadmap, and
research assistant surfaces. It remains fixture-only and does not add live model
execution, provider routing, provider keys, GitHub write actions, SSH execution,
deployment, training, benchmark claims, model safety claims, checkpoints, or
model cards.

## Follow-Up Repository Assistant Slice

Status: Added after the prompt regression fixture slice.

Evidence:

- `packages/repository-assistant/schemas/local-readonly-repository-assistant.schema.json`
- `packages/repository-assistant/fixtures/local-readonly-repository-assistant.json`
- `scripts/check-repository-assistant-prototype.mjs`
- `npm run check:repository-assistant-prototype`

This slice completes the local read-only repository assistant prototype from
the five-year program. It returns source-linked repository condition, evidence,
risks, validation status, branch plan, excluded material, and next safe action
from local fixture data only. It does not add external provider routing,
provider keys, GitHub write actions, SSH execution, deployment, destructive
cleanup, training, benchmark claims, checkpoints, or model cards.

## Follow-Up Evaluation Report Slice

Status: Added after the repository assistant prototype slice.

Evidence:

- `packages/evals/schemas/fixture-evaluation-report.schema.json`
- `reports/evals/ai-core-fixture-evaluation-report.json`
- `reports/evals/ai-core-fixture-evaluation-report.md`
- `scripts/create-ai-core-fixture-evaluation-report.mjs`
- `npm run check:ai-core-fixture-evaluation-report`

This slice completes the prompt and app-state fixture evaluation report
generation slice from the five-year program. It generates local fixture-backed
evaluation records for prompt regression and app-state fixtures. It does not run
live models, enable external provider routing, compare provider quality, publish
benchmark scores, certify safety, train models, create checkpoints, or create
model cards.

## Follow-Up Model Router Contract Slice

Status: Added after the fixture evaluation report slice.

Evidence:

- `packages/model-router/schemas/model-router-route-contract.schema.json`
- `packages/model-router/fixtures/model-router-route-contracts.json`
- `scripts/check-model-router-contracts.mjs`
- `npm run check:model-router-contracts`

This slice completes model-router request and response contract fixtures for
local-only, metadata-only, and approval-needed provider routes. It remains
fixture-backed and does not add live provider routing, provider keys,
browser-side provider secrets, model calls, benchmark claims, model training,
checkpoints, or model cards.

## Follow-Up Agent Runtime Lifecycle Slice

Status: Added after the model-router contract slice.

Evidence:

- `packages/agent-runtime/schemas/agent-runtime-task-lifecycle.schema.json`
- `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json`
- `scripts/check-agent-runtime-lifecycle.mjs`
- `npm run check:agent-runtime-lifecycle`

This slice completes agent-runtime task lifecycle and approval-state fixtures
for validated documentation review, approval-needed provider routing, and
blocked SSH/deployment review. It remains fixture-backed and does not add live
autonomous orchestration, agent self-approval, provider calls, provider keys,
GitHub write actions, SSH execution, deployment, model training, checkpoints,
or model cards.

## Follow-Up AI Operating Model Slice

Status: Added after the bounded agent-runtime lifecycle foundation.

Evidence:

- `docs/ai/seis-ai-operating-model-5-year.md`
- `docs/ai/agent-runtime.md`
- `packages/agent-runtime/schemas/agent-runtime-task-lifecycle.schema.json`
- `packages/agent-runtime/fixtures/agent-runtime-task-lifecycle.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `scripts/check-agent-runtime-lifecycle.mjs`
- `npm run check:agent-runtime-lifecycle`
- `npm run check:ai-core-app-contracts`

This slice defines the five-year SEIS AI operating model: agent organization,
bounded subagent delegation, operating cadence, Command Center integration,
operating metrics, evidence requirements, and explicit non-claims. It turns
the user's long-horizon "use subagents like a major technology company" goal
into a reviewable fixture-backed contract rather than unbounded autonomous
execution. It does not add live subagent spawning, external provider calls,
provider keys, GitHub write actions, SSH execution, deployment, scheduled jobs,
payments, dataset downloads, model training, benchmarks, checkpoints, or model
cards.

## AI Operating Model Evidence Gate Registry Slice

Status: Added after the follow-up AI operating model slice.

Evidence:

- `packages/shared-types/schemas/ai-core-app-contract.schema.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `apps/seis-core/ai-core-contract-fixture.js`
- `apps/seis-core/index.html`
- `apps/seis-core/script.js`
- `apps/seis-core/test/seis-core-static.test.js`
- `scripts/check-ai-core-app-contracts.mjs`
- `scripts/check-seis-command-center.mjs`
- `docs/architecture/ai-core-app-shared-contracts.md`
- `docs/evals/evaluation-strategy.md`
- `docs/ai/seis-ai-operating-model-5-year.md`
- `npm run check:ai-core-app-contracts`
- `npm run test:seis-command-center`

This slice adds `goalEvidenceGate` records to the shared AI Core/App contract.
Each active goal now maps to required evidence gates with gate status, evidence
path, blocker, non-claims, and next safe action. The validator fails if a goal
is marked validated or complete while a required gate is not passing, or if a
gate points to missing evidence. Command Center also renders the five-year AI
operating model and its gates as read-only fixture cards. This is not a live
agent scheduler, provider health check, production orchestration claim,
training run, benchmark, checkpoint, model-card claim, SSH execution, GitHub
mutation, deployment, payment, or infrastructure action.

## AI Operating Model Gate-Derived Scorecard Slice

Status: Added after the evidence gate registry slice.

Evidence:

- `packages/shared-types/schemas/ai-core-app-contract.schema.json`
- `packages/shared-types/fixtures/ai-core-command-center-foundation.json`
- `apps/seis-core/ai-core-contract-fixture.js`
- `apps/seis-core/script.js`
- `apps/seis-core/test/seis-core-static.test.js`
- `scripts/check-ai-core-app-contracts.mjs`
- `scripts/check-seis-command-center.mjs`
- `docs/architecture/ai-core-app-shared-contracts.md`
- `docs/evals/evaluation-strategy.md`
- `docs/ai/seis-ai-operating-model-5-year.md`
- `npm run check:ai-core-app-contracts`
- `npm run test:seis-command-center`

This slice adds `goalOperatingScorecard` records that are derived from
`goalEvidenceGate` records. The validator recomputes gate totals, required gate
totals, pass/fail/blocked/unknown counts, required-gate completion, and
percentage score from the gate registry. A current-slice score can be 100 while
the parent five-year goal remains in progress; the scorecard is not allowed to
claim full-goal completion unless the goal is complete with validated evidence.
Command Center renders the scorecard inside the AI Operating Model panel and
the Goals surface without adding fake controls or live orchestration.

## Follow-Up 10,000,000 Token Feed Budget Slice

Status: Added after the knowledge-source classification and route contract
foundation.

Evidence:

- `packages/data/schemas/token-feed-budget.schema.json`
- `packages/data/fixtures/seis-10m-token-feed-budget.json`
- `scripts/check-token-feed-budget.mjs`
- `npm run check:token-feed-budget`

This slice gives SEIS a 10,000,000 token metadata-only feed budget connected to
the model-router, knowledge-source classification, shared AI Core/App contract,
and Command Center projection. It is a capacity and routing contract only:
`tokensExecuted` remains `0`, blocked archive material remains excluded, and no
raw-content storage, embedding index, persistent memory write, external provider
call, model training, checkpoint, benchmark, or model ownership claim is added.

## Follow-Up Tool Registry Permission Slice

Status: Added after the agent-runtime lifecycle slice.

Evidence:

- `packages/tool-registry/schemas/tool-registry-permissions.schema.json`
- `packages/tool-registry/fixtures/tool-registry-permissions.json`
- `scripts/check-tool-registry-permissions.mjs`
- `npm run check:tool-registry-permissions`

This slice completes tool and plugin registry permission and risk-class
fixtures for read-only local inspection, scoped local edits, approval-needed
GitHub publishing, and blocked SSH/deployment execution. It remains
fixture-backed and does not execute tools, install plugins, mutate GitHub,
run SSH commands, deploy services, call providers, expose secrets, or grant
browser clients privileged execution authority.

## Follow-Up Knowledge Source Classification Slice

Status: Added after the tool registry permission slice.

Evidence:

- `packages/data/schemas/knowledge-source-classification.schema.json`
- `packages/data/fixtures/knowledge-source-classification.json`
- `scripts/check-knowledge-source-classification.mjs`
- `npm run check:knowledge-source-classification`

This slice completes retrieval and knowledge source classification fixtures for
official docs, generated reports, local fixture contracts, and blocked assistant
archive material. It remains fixture-backed and does not ingest raw archive
content, create embeddings, write persistent memory, route content to external
providers, copy unsafe implementation plans, execute active countermeasures,
inject poisoned data, perform memetic manipulation, make autonomous payments,
provision infrastructure, claim BCI/consciousness capabilities, or claim model
training, checkpoints, benchmarks, or SEIS-owned model weights.

## Local Read-Only Retrieval Query Adapter Slice

Status: Added after the knowledge-source classification slice.

Evidence:

- `packages/data/schemas/retrieval-query-adapter.schema.json`
- `packages/data/fixtures/local-readonly-retrieval-query-adapter.json`
- `scripts/check-retrieval-query-adapter.mjs`
- `apps/seis-core/index.html`
- `npm run check:retrieval-query-adapter`

This slice completes the local read-only retrieval query adapter fixture and
connects it to the Command Center website surface. It remains fixture-backed and
metadata-only: it does not call providers, expose provider keys, ingest raw
assistant archive content, create embeddings, write persistent memory, mutate
GitHub, execute SSH, deploy, pay, provision infrastructure, or claim model
training, checkpoints, benchmarks, BCI, consciousness, or SEIS-owned model
weights.

## Local Retrieval Result Cards And No-Content Search Transcript Slice

Status: Added after the local read-only retrieval query adapter slice.

Evidence:

- `packages/data/schemas/retrieval-search-transcript.schema.json`
- `packages/data/fixtures/local-readonly-retrieval-search-transcript.json`
- `scripts/check-retrieval-search-transcript.mjs`
- `apps/seis-core/index.html`
- `npm run check:retrieval-search-transcript`

This slice completes the first local retrieval result cards and no-content
search transcript fixtures for the Command Center website surface. It remains
fixture-backed and metadata-only: it does not create a live search engine,
retrieval index, embedding database, persistent memory, provider context,
secret lookup, raw archive content return, GitHub write path, SSH execution
path, deployment path, payment flow, infrastructure mutation, benchmark claim,
or model-training evidence.

Follow-up work added local filtering controls and empty-state test cases for
these records. The controls filter already-loaded fixture metadata by text,
source class, and transcript state only. The empty-state contract mirrors the
UI's two panels with separate result-card and no-content transcript messages,
and the Command Center test suite executes the filter/reset flow in JSDOM. The
controls do not perform live retrieval, provider calls, secret search,
embeddings, memory writes, or infrastructure actions.

The next hardening slice added explicit visible focus styles and a JSDOM
keyboard-focus-order test for the local retrieval filter controls. This remains
UI accessibility evidence over fixture-backed state only.

The mobile hardening slice added static coverage for the Local Retrieval
toolbar's single-column responsive collapse and 44px touch targets. It remains
CSS and app-test evidence only; no live retrieval or provider integration was
added.

The viewport-contract smoke slice added a Command Center JSDOM render check for
desktop and mobile dimensions. It verifies that the Local Retrieval toolbar
renders nonblank shell content, stable ARIA wiring, populated fixture-backed
retrieval panels, safety boundary chips, and responsive CSS contracts. This is
not a browser screenshot regression suite and does not add live retrieval,
provider calls, embeddings, memory writes, or raw-content behavior.

The browser-run visual QA slice added a repeatable local Chrome/Chromium path:
`npm run qa:seis-core:local-retrieval:visual`. It serves `apps/seis-core`,
seeds the AI Core Local Retrieval state, captures desktop and mobile
screenshots, dumps rendered DOM, and writes ignored artifacts under
`reports/tmp/seis-core-local-retrieval-visual/`. The committed evidence
contract is `reports/evals/local-retrieval-browser-visual-qa.md`. This remains
fixture-backed visual evidence only, not live retrieval, provider routing,
embedding search, memory write behavior, raw-content return, or pixel-baseline
regression coverage.

## Browser-Run Local Retrieval Interaction QA Slice

Status: Added after the browser-run visual QA slice.

Evidence:

- `scripts/capture-seis-core-local-retrieval-visual.mjs`
- `reports/evals/local-retrieval-browser-visual-qa.md`
- `apps/seis-core/test/seis-core-static.test.js`
- `npm run qa:seis-core:local-retrieval`
- `npm run check:seis-command-center`

This slice extends Local Retrieval evidence from seeded browser visual capture
to browser-run interaction QA. It verifies query entry, source-class selection,
transcript-state selection, reset behavior, focus preservation, status text,
credential-boundary filtering, and two-panel empty-state output across desktop
and mobile viewports. It remains fixture-backed and local-only: it does not
create live retrieval, provider routing, embeddings, persistent memory writes,
raw-content return, secret lookup, GitHub write actions, SSH execution,
deployment, payment, infrastructure mutation, benchmark claims, or
model-training evidence.

## Browser-Run AI Core Evidence Gate Availability Slice

Status: Added after the browser-run AI Core QA evidence drift-hardening slice.

Evidence:

- `docs/evals/ai-core-browser-evidence-gates.md`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `packages/evals/README.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `npm run check:ai-core-browser-qa-evidence`

This slice documents the CI/local split for browser-run AI Core evidence gates.
The default CI path remains metadata-only through
`npm run check:ai-core-browser-qa-evidence` and
`npm run check:ai-core-eval-evidence`. The artifact-required browser path stays
local or browser-enabled-runner only through
`npm run qa:seis-core:ai-core-evidence` until a separate CI browser setup
proposal is reviewed. It does not add live providers, embeddings, memory
writes, raw-content return, GitHub writes, SSH, deployment, payment,
infrastructure mutation, benchmark claims, or model-training evidence.

## Browser-Run AI Core Panel Navigation QA Slice

Status: Added after the browser-run Local Retrieval interaction QA slice.

Evidence:

- `scripts/capture-seis-core-ai-core-panel-navigation.mjs`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `npm run qa:seis-core:ai-core-panels`
- `npm run check:seis-command-center`

This slice extends browser-run evidence from the Local Retrieval toolbar to the
broader AI Core panel. It starts from Dashboard, opens AI Core through sidebar
navigation, the command palette, and global search, then verifies fixture-backed
route, prompt, agent, approval, evaluation, evidence, and Local Retrieval
sections across desktop and mobile browser viewports. It remains fixture-backed
and local-only: it does not create live provider routing, live retrieval,
embeddings, persistent memory writes, raw-content return, secret lookup, GitHub
write actions, SSH execution, deployment, payment, infrastructure mutation,
benchmark claims, or model-training evidence.

## Browser-Run Goals Evidence Scorecard QA Slice

Status: Added after the Goals evidence scorecard projection slice.

Evidence:

- `scripts/capture-seis-core-ai-core-panel-navigation.mjs`
- `scripts/check-ai-core-browser-qa-evidence.mjs`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `docs/ai/seis-ai-operating-model-5-year.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `npm run qa:seis-core:ai-core-panels`
- `npm run check:ai-core-browser-qa-evidence`

This slice extends the browser-run AI Core panel navigation QA path to the
Command Center Goals surface. The browser runner now starts from Dashboard,
opens Goals through sidebar navigation, verifies `Goal Evidence Scorecards`
from `goalOperatingScorecards` and `goalEvidenceGates`, checks fixture-derived
scorecard and gate-chip counts, verifies `current fixture slice only` language,
and blocks unsafe completion or capability claims. It does not claim full
program completion, live orchestration, live provider health, SSH execution,
deployment evidence, model training evidence, benchmark evidence, checkpoint
evidence, or model-card evidence.

## Browser-Run AI Core QA Evidence Drift-Hardening Slice

Status: Added after the browser-run AI Core panel navigation QA slice.

Evidence:

- `scripts/check-ai-core-browser-qa-evidence.mjs`
- `reports/evals/ai-core-panel-navigation-browser-qa.md`
- `scripts/create-ai-core-fixture-evaluation-report.mjs`
- `scripts/check-seis-command-center.mjs`
- `apps/seis-core/README.md`
- `docs/evals/evaluation-strategy.md`
- `roadmap/seis-ai-core-command-center-5-year-development-program.md`
- `npm run check:ai-core-browser-qa-evidence`
- `npm run qa:seis-core:ai-core-evidence`
- `npm run check:ai-core-eval-evidence`

This slice adds a metadata-only drift check for browser-run AI Core QA evidence.
It verifies that the panel navigation report, browser runner, generated fixture
evaluation report, schema, Command Center validator, README, evaluation
strategy, five-year roadmap, and this review agree on the same browser-run AI
Core QA evidence contract. The artifact-required mode reads the ignored
manifest and desktop/mobile JSON reports produced by the browser QA run to
verify scenario IDs, viewports, step order, panel counts, safety flags, artifact
paths, and non-claims. It does not call providers, run live retrieval, create
embeddings, write memory, return raw content, execute GitHub writes, SSH,
deployment, payment, infrastructure mutation, benchmark claims, or
model-training evidence.

## Browser-Run AI Core CI Proposal Slice

Status: Added after the browser-run AI Core evidence gate availability slice.

Evidence:

- `docs/evals/ai-core-browser-ci-proposal.md`
- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `docs/evals/evaluation-strategy.md`
- `packages/evals/README.md`
- `scripts/check-ai-core-browser-qa-evidence.mjs`
- `scripts/create-ai-core-fixture-evaluation-report.mjs`
- `npm run check:ai-core-browser-qa-evidence`

This slice documents the review-ready CI proposal for running browser-run AI
Core QA evidence in GitHub Actions without enabling the browser-required gate in
the active CI workflow. It covers Chrome/Chromium setup, `SEIS_BROWSER_BIN`,
bounded timeout behavior, temporary `reports/tmp/` artifact handling, failure
semantics, and the approval boundary. It also adds a non-active workflow draft
that uses `workflow_dispatch`, read-only permissions, pinned existing
checkout/setup-node actions, a bounded timeout, short artifact retention, and an
explicit upload-artifact pinning placeholder for later review. The proposal and
draft remain metadata-validated planning evidence: they are not browser QA pass
evidence, do not change
`.github/workflows/ci.yml`, and do not add live providers, embeddings,
persistent memory writes, raw-content return, GitHub write actions, SSH,
deployment, payment, infrastructure mutation, benchmark claims, or
model-training evidence.

## Browser-Run AI Core CI Activation Approval Slice

Status: Added after the browser-run AI Core CI workflow draft slice.

Evidence:

- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/ai-core-browser-ci-proposal.md`
- `scripts/check-ai-core-browser-qa-evidence.mjs`
- `scripts/create-ai-core-fixture-evaluation-report.mjs`
- `npm run check:ai-core-browser-qa-evidence`

This slice documents the human approval packet required before the review-only
workflow draft can become an active GitHub Actions workflow. It records approval
requirements, future active workflow PR contents, validation plan, rollback
plan, security boundaries, and non-claims. It remains planning evidence only,
not browser QA pass evidence. It does not change `.github/workflows/ci.yml`,
does not make browser evidence required, and does not add providers, SSH,
deployment, payment, infrastructure mutation, benchmark claims, or
model-training evidence.

## Browser-Run AI Core Manual Workflow Slice

Status: Added after user approval of the activation packet.

Evidence:

- `.github/workflows/ai-core-browser-evidence.yml`
- `docs/evals/ai-core-browser-ci-activation-approval.md`
- `docs/evals/ai-core-browser-ci-workflow-draft.md`
- `docs/evals/ai-core-browser-evidence-gates.md`
- `scripts/check-ai-core-browser-qa-evidence.mjs`

This slice adds a separate manual GitHub Actions workflow for browser-run AI
Core QA evidence. It uses `workflow_dispatch`, read-only `contents`
permission, pinned checkout/setup-node/upload-artifact actions, mock/local-only
environment variables, Chrome/Chromium binary verification, bounded timeout,
and 7-day artifact retention for
`reports/tmp/seis-core-ai-core-panel-navigation/`. It does not change
`.github/workflows/ci.yml`, does not add push or pull-request triggers, does
not make browser evidence a required check, and does not add providers, SSH,
deployment, payment, infrastructure mutation, benchmark claims, or
model-training evidence.

## Browser-Run AI Core Dispatch Availability Slice

Status: Added after manual workflow push.

Evidence:

- `docs/evals/ai-core-browser-workflow-dispatch-review.md`
- `.github/workflows/ai-core-browser-evidence.yml`
- `scripts/check-ai-core-browser-qa-evidence.mjs`

This slice records the first GitHub Actions dispatch availability check. The
attempted `gh workflow run ai-core-browser-evidence.yml --ref
seis/ai-core-app-foundation-continuation` command returned `HTTP 404` because
the workflow file is not yet on the repository default branch. No GitHub Actions
run was created and no browser artifacts were uploaded. This is a workflow
visibility blocker, not a browser QA failure. The next safe step is PR review
and human-approved merge before a real `workflow_dispatch` run can produce
GitHub artifact evidence.

## AI Core App Foundation Continuation PR Review Slice

Status: Added after PR #44 state inspection.

Evidence:

- `docs/reviews/SEIS_AI_CORE_APP_FOUNDATION_CONTINUATION_PR_REVIEW.md`
- `docs/reviews/SEIS_AI_CORE_PR44_CONFLICT_RESOLUTION_REVIEW.md`
- `docs/evals/ai-core-browser-workflow-dispatch-review.md`

This slice records that PR #44 exists for
`seis/ai-core-app-foundation-continuation`, but GitHub reports the pull request
as `CONFLICTING` against `main`. It also records observed non-blocking status
checks and local validation evidence from the latest branch-local browser
scorecard slice. The review does not merge, deploy, force-push, rewrite
history, run SSH, call providers, train models, or create branch-protection
claims. The next safe step is conflict-resolution classification before any
merge attempt or default-branch `workflow_dispatch` run.

## AI Core PR44 Conflict Resolution Review Slice

Status: Added after the PR #44 state review slice.

Evidence:

- `docs/reviews/SEIS_AI_CORE_PR44_CONFLICT_RESOLUTION_REVIEW.md`
- `docs/reviews/SEIS_AI_CORE_APP_FOUNDATION_CONTINUATION_PR_REVIEW.md`

This slice classifies the broad divergence between PR #44 and current `main`.
It records merge-base evidence, changed-path counts, shared conflict hotspots,
branch assets to keep or re-port, current-main assets to preserve, generated
report handling, excluded automatic-merge material, and a recommended
resolution order. It does not resolve conflicts, merge, rebase, force-push,
change branch protection, run workflow dispatch, call providers, run SSH,
deploy, train models, publish checkpoints, or create production claims.
