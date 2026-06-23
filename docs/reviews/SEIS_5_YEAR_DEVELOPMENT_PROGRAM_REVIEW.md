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

1. Add CI/browser availability documentation for browser-run AI Core evidence
   gates so local Chrome/Chromium requirements, metadata-only CI checks,
   artifact-required local checks, and skipped-browser fallback expectations are
   explicit without enabling live providers or privileged actions.

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
