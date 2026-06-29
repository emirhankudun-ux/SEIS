# SEIS AI Core Foundation

## Purpose

Define SEIS AI Core as a provider-neutral application layer for routing,
prompts, agents, evaluation, and safe assistant workflows.

SEIS AI Core is not a trained SEIS foundation model. Provider routing, prompt
engineering, retrieval, and local demos must not be described as model
ownership.

## Scope

The foundation includes:

- model router concept
- prompt engine concept
- agent runtime concept
- provider privacy modes
- no-key startup rule
- local/private mode
- evaluation and evidence boundaries
- Command Center AI status surface

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Model router | Documented, not implemented | `docs/ai/model-router.md`, `content/development/seis-ai-core-provider-registry.json`, `seis_ai_core_provider_status` | No typed environment validation, health checks, or live adapter tests exist. | Keep routing disabled until server-only adapter tests exist. |
| Prompt engine | Documented, not implemented | `docs/ai/prompt-engine.md` | No versioned prompt registry or regression suite exists. | Define prompt-pack schema and fixtures. |
| Agent runtime | Documented fixture, not implemented runtime orchestration | `docs/ai/agent-runtime.md`, `scripts/ai-launcher.cjs`, `content/development/seis-ai-core-subagent-review-ledger.json`, `content/development/seis-ai-core-subagent-runtime-fixtures.json`, `content/development/seis-ai-core-agent-role-schema.json`, `content/development/seis-ai-core-agent-permission-matrix.json`, `content/development/seis-ai-core-dry-run-task-queue.json`, `content/development/seis-ai-core-cancellation-fixture.json`, `content/development/seis-ai-core-approval-fixture.json`, `content/development/seis-ai-core-redaction-fixture.json`, `content/development/seis-ai-core-execution-ledger-fixture.json` | No write-gated or background runtime exists. | Keep automation dry-run until fixture validation, approval gates, redaction, and ledger evidence are proven. |
| Version registry | Documented fixture | `content/development/seis-ai-core-version-registry.json`, `seis_ai_core_version_status` | No live release channel, live provider adapter, or model ownership evidence exists. | Keep SEIS AI Core v0.1 as a zero-key application-layer profile until provider and runtime gates exist. |
| Provider registry | Documented fixture | `content/development/seis-ai-core-provider-registry.json`, `seis_ai_core_provider_status`, `seis://ai/provider-registry.json` | This is repo-local status evidence only; it performs no provider calls or credential validation. | Use it for SEIS AI status surfaces before live provider adapters. |
| Model scaling hardware profile | Planned compatibility contract | `content/development/seis-model-scaling-hardware-profile.json`, `docs/ai/seis-model-scaling.md`, `seis_ai_core_model_scaling_status` | The 20B target for 16GB+ RAM plus future 70B, 150B, and 512B apex lanes are not trained weights, live inference, downloads, AGI proof, or benchmark evidence. | Keep the profile blocked until clean-room model cards, dataset cards, quantized/distributed runtime plans, safety evals, and memory benchmarks exist. |
| 150B frontier model program | Plan-only frontier program record | `content/development/seis-150b-frontier-model-program.json`, `seis://ai/150b-frontier-model-program.json`, `npm run check:seis-150b-frontier-model-program` | The 150B lane is a charter, stage plan, and promotion-gate record only; it is not trained weights, inference, benchmark evidence, provider access, cloud/GPU provisioning, SSH execution, or production readiness. | Keep it blocked until 20B and 70B evidence, clean-room training plan, distributed runtime budget, privacy/safety review, observability, rollback, cost-stop, and human approval exist. |
| 512B apex model program | Plan-only SEIS AGI readiness record with public research baseline | `content/development/seis-512b-apex-model-program.json`, `seis://ai/512b-apex-model-program.json`, `npm run check:seis-512b-apex-model-program` | The 512B lane is an apex charter, internet-researched frontier-model baseline, AGI-readiness definition, and GitHub-public-readiness gate only; it is not AGI, trained weights, inference, benchmark evidence, provider access, cloud/GPU provisioning, SSH execution, or production readiness. | Keep it blocked until 20B, 70B, 150B, and 300B+ evidence, clean-room training plan, independent AGI eval protocol, all installed AI/sub-agent council review, public readiness evidence, and human approval exist. |
| Model scaling sub-agent council | Active plan-only coordination contract | `content/development/seis-model-scaling-subagent-council.json`, `docs/ai/seis-model-scaling.md`, `seis_ai_core_model_scaling_status` | Twelve agents coordinate 20B evidence preparation and 70B/150B/512B review duties, with explicit 512B duties for architecture, validator sync, honest UI, research, provenance, security, DevOps, docs, QA, cloud gating, and automation boundaries; they do not run models, benchmarks, training, SSH, providers, GitHub mutation, or cloud/GPU provisioning. | Keep all council agents plan-only until human-reviewed runtime, benchmark, safety, public-readiness, and approval evidence exists. |
| Language model intake registry | Active metadata-only contract | `content/development/seis-language-model-intake-registry.json`, `docs/ai/ai-workforce-training.md`, `npm run check:seis-language-model-intake` | Candidate model families are reviewed for license, hardware, retrieval, adapter, and training gates; this is not bulk installation, checkpoint download, inference, fine-tune, foundation training, or AGI evidence. | Review one model family at a time and keep retrieval/provenance first before any approved local install. |
| Version promotion gates | Documented fixture | `content/development/seis-ai-core-version-promotion-gates.json`, `seis_ai_core_version_promotion_dry_run` | Dry-run output is internal review evidence only; it is not release approval. | Use promotion dry-runs to classify readiness without enabling write, deploy, provider, credential, or release authority. |
| MCP runtime contract | Local smoke verified | `content/development/seis-ai-core-mcp-runtime-contract.json`, `seis://ai/mcp-runtime-contract.json` | This proves only the local stdio MCP contract, not remote MCP server readiness or connector authentication. | Keep MCP runtime evidence tied to `node --test packages/seis-ai/test/mcp-smoke.test.mjs`. |
| SEIS plugin lanes | Integrated as read-only/status and plan-only tools | `content/development/seis-agent-plugin-integration.json`, `packages/seis-ai/src/lib/plugin-integration.mjs`, `packages/seis-ai/src/agent/tools.mjs`, `packages/seis-ai/src/mcp/server.mjs` | No external connector authentication is claimed. | Keep lane tools scoped to status and planning until explicit approval enables mutation. |
| AI Core constellation inspector | Browser-smoke verified Local Demo surface | `apps/seis-demo-web/index.html`, `apps/seis-demo-web/script.js`, `scripts/check-product-experience-browser-smoke.mjs` | This proves only local UI integration of installed AI routes, personal plugin lanes, and the MCP runtime contract. | Keep the inspector backed by generated plan-view data and product browser smoke before claiming broader runtime integration. |
| AI Workforce Training | Active local seed training contract | `docs/ai/ai-workforce-training.md`, `content/development/seis-ai-workforce-training-plan.json`, `scripts/check-seis-ai-workforce-training.mjs`, `scripts/run-seis-ai-workforce-training.mjs` | No live provider calls, credential reads, cloud fine-tuning, dataset downloads, SSH, deployment, or runtime authority are performed. | Use installed assistants only as supervised candidate reviewers; rebuild deterministic local seed artifacts with `npm run automation:seis-ai-workforce-training`. |
| Provider credentials | Statically audited | `docs/audits/AI_PROVIDER_AND_CREDENTIAL_AUDIT.md` | No runtime verification was performed. | Keep keys optional, server-only, and disabled until adapter tests exist. |
| Local model mode | Planned | No local model adapter found in this branch. | No runtime integration. | Define Ollama/localhost as optional zero-key future mode. |
| Evaluation | Planned | Goal validation exists; AI evals do not. | No eval suite. | Add prompt/model evaluation strategy later. |

## Rules / Policy

- Core SEIS must boot with zero cloud model-provider keys.
- One compatible cloud provider should be enough for general live AI later.
- Additional providers are optional and capability-specific.
- Missing provider keys disable only the provider, not the whole product.
- Browser code must not receive provider secrets.
- Local-only mode must never fall back to cloud silently.
- Fallback identity must be visible to the user.
- Claude-style interfaces must not label non-Anthropic output as Claude.
- SEIS plugin lane tools may inspect repo-local manifests, skills, and lane
  profiles, but must not claim connector authentication or perform external
  mutation.

## Provider Status Model

Public provider states must remain:

- Available
- Missing Key
- Disabled
- Rate Limited
- Error

## Evidence Requirements

AI features need evidence before being marked implemented:

- server-only environment validation
- provider registry tests
- no-key startup test
- fallback test
- redaction test
- client-bundle secret exposure check
- documented provider matrix

## Five-Year Sub-Agent Operating Model

The personal SEIS plugin family is now connected to SEIS AI Core as bounded
sub-agent lanes. The current implementation is status and planning only; it is
not a claim that autonomous development has run for five years.

Machine-readable source:
`content/development/seis-ai-core-subagent-operating-model.json`.

Version registry:
`content/development/seis-ai-core-version-registry.json`.

Version promotion gates:
`content/development/seis-ai-core-version-promotion-gates.json`.

MCP runtime contract:
`content/development/seis-ai-core-mcp-runtime-contract.json`.

Browser Local Demo surface:
`apps/seis-demo-web/index.html` and `apps/seis-demo-web/script.js`.

Long-horizon development plan:
`content/development/seis-sub-agent-5-year-plan.json`.

The standalone SEIS demo now includes an AI Core constellation inspector that
joins the installed AI route mesh, personal plugin lane mesh, MCP runtime
contract, selected five-year quarter, and 3D hero diagnostics into one local
read-only surface. Product browser smoke verifies the inspector exposes six AI
routes, five personal plugin lanes, 34 MCP tools, 28 MCP resources, three MCP
prompts, and a 32-node / 53-edge AI Core 3D graph without requiring provider
keys, SSH, deployment, GitHub mutation, or external connector authentication.

Runtime inspection tools:
`seis_ai_core_provider_status`,
`seis_ai_core_model_scaling_status`,
`seis_ai_core_version_status`,
`seis_ai_core_version_promotion_dry_run`,
`seis_ai_core_subagent_model`, and
`seis_ai_core_subagent_review_ledger`.

Model scaling resources:
`content/development/seis-model-scaling-hardware-profile.json`,
`content/development/seis-language-model-intake-registry.json`,
`content/development/seis-model-parameter-ladder.json`,
`content/development/seis-150b-frontier-model-program.json`,
`content/development/seis-512b-apex-model-program.json`,
`content/development/seis-agi-evaluation-protocol.json`,
`content/development/seis-model-scaling-subagent-council.json`,
`seis://ai/model-scaling-hardware-profile.json`, and
`seis://ai/model-parameter-ladder.json`, and
`seis://ai/150b-frontier-model-program.json`, and
`seis://ai/512b-apex-model-program.json`, and
`seis://ai/agi-evaluation-protocol.json`. The parameter ladder keeps 20B, 70B,
150B, 300B+, 512B, and highest-future classes route-blocked until measured evidence,
model/dataset cards, safety review, and human approval exist.

## Model Scaling Hardware Profile

SEIS now tracks a planned 20B local-compatibility target for 16GB+ RAM systems,
a future 70B research ladder, a 150B frontier research target, and a 512B apex
SEIS AGI readiness target through
`content/development/seis-model-scaling-hardware-profile.json`.

This profile is an AI Core planning contract, not model runtime evidence. It
does not create or download 20B, 70B, 150B, or 512B weights, prove AGI, run
inference, run benchmarks, perform training, call providers, or grant runtime authority. SEIS remains in
Local Demo mode until the model-router, provider registry, clean-room dataset
policy, model cards, quantized runtime adapter, redacted logs, and memory
benchmarks pass validation. The profile also records a memory budget contract,
Q4/Q5-Q6 planning lanes, candidate-only no-key local runtimes, and a 150B
frontier lane plus 512B apex lane that remain blocked until distributed-runtime,
safety, cost, privacy, observability, rollback, AGI eval protocol, and
human-approval evidence exists.

Validation:

```bash
npm run check:seis-model-scaling-hardware-profile
npm run check:seis-150b-frontier-model-program
npm run check:seis-512b-apex-model-program
node scripts/check-seis-agi-evaluation-protocol.mjs
npm run check:seis-model-scaling-subagent-council
```

## AI Workforce Training

SEIS can use installed assistants as a supervised training workforce only inside
the local seed-model contract. In this context, training means sanitized review,
SEIS-owned synthetic case creation, deterministic local artifact rebuilds, and
promotion-gate evidence. It does not mean cloud provider fine-tuning, live
provider calls, credential validation, dataset downloads, SSH, deployment,
background autonomy, runtime authority, or foundation-model ownership.

Machine-readable source:
`content/development/seis-ai-workforce-training-plan.json`.

Human-readable contract:
`docs/ai/ai-workforce-training.md`.

Validation and execution:

```bash
npm run check:seis-ai-workforce-training
npm run automation:seis-ai-workforce-training
```

The current installed route inventory is treated as route readiness only. Qwen,
Ollama, OpenCode, Hermes, Goose, OpenDesign, and similar tools may propose
candidate cases from sanitized context, but Codex remains the integration owner
and every accepted case must remain SEIS-owned synthetic data with no
user-private content. The promotion policy must keep runtime authority at zero
until independent benchmark, observability, rollback, human approval, and
security gates pass.

Runtime fixture sources:

- `content/development/seis-ai-core-subagent-review-ledger.json`
- `content/development/seis-ai-core-provider-registry.json`
- `content/development/seis-ai-core-version-registry.json`
- `content/development/seis-ai-core-version-promotion-gates.json`
- `content/development/seis-ai-core-mcp-runtime-contract.json`
- `content/development/seis-ai-core-subagent-runtime-fixtures.json`
- `content/development/seis-ai-core-agent-role-schema.json`
- `content/development/seis-ai-core-agent-permission-matrix.json`
- `content/development/seis-ai-core-dry-run-task-queue.json`
- `content/development/seis-ai-core-cancellation-fixture.json`
- `content/development/seis-ai-core-approval-fixture.json`
- `content/development/seis-ai-core-redaction-fixture.json`
- `content/development/seis-ai-core-execution-ledger-fixture.json`

| Lane | SEIS AI tools | Responsibility |
| --- | --- | --- |
| SEIS Hub | `seis_hub_status`, `seis_hub_plan` | Governance, repository source of truth, plugin coordination, migration safety. |
| SEIS Cloud | `seis_cloud_status`, `seis_cloud_plan` | Cloud readiness, provider-neutral deployment planning, SSH/VPN boundary review. |
| SEIS-Code | `seis_code_status`, `seis_code_plan` | Implementation planning, tests, CI, MCP/plugin code, repo automation. |
| SEIS-Design | `seis_design_status`, `seis_design_plan` | Product design, UI/UX, accessibility, design systems, motion quality. |
| SEIS-DATA | `seis_data_status`, `seis_data_plan` | Structured records, analytics, generated reports, memory/context, provenance. |

Five-year shape:

The five-year path keeps write-gated implementation lanes as a future promotion
stage, not a current autonomous execution claim.

`SEIS AI Core v0.1` is an application-layer intelligence profile. It binds
`SEIS Language v0.1`, `SEIS Agent Runtime v0.1`, `SEIS Model Router v0.1`, and
`SEIS Prompt Engine v0.1` as versioned contracts, not trained weights or a
frontier model. The core remains zero-key by default.

| Year | Focus | Promotion Gate |
| --- | --- | --- |
| Year 1 | Foundation integrity and visible AI Core routing. | Status/plan tools, lane governance checks, no-key startup policy, documentation parity. |
| Year 2 | Read-only intelligence and evidence dashboards. | Repository scans, evidence locker, Command Center lane views, accessibility and stale-data states. |
| Year 3 | Write-gated implementation lanes. | Human-approved write scopes, tool permission matrix, rollback notes, package-local tests. |
| Year 4 | Multi-workspace and cloud readiness. | Provider-neutral preflight, SSH/VPN approval workflow, audit ledger, deployment dry-run evidence. |
| Year 5 | Public/enterprise readiness and SEIS Universe governance. | Release evidence pack, security baseline, model-claims audit, public readiness review. |

Before any lane moves beyond status and planning, the version registry,
version promotion gates, quarterly review ledger, runtime fixture pack, role
schema, permission matrix, dry-run task queue, cancellation fixture, approval
fixture, redaction fixture, and execution-ledger fixture must keep passing
`npm run check:seis-ai-core-version-registry`,
`npm run check:seis-ai-core-version-promotion-gates`,
`npm run check:seis-ai-core-subagent-review-ledger`, and
`npm run check:seis-ai-core-subagent-runtime-fixtures`. SEIS still needs
executable redacted-output tests, runtime permission enforcement, provider
registry fixtures, and persistent ledger storage before write-gated or
background automation can be enabled.

## Related Documents

- [../security/security-baseline.md](../security/security-baseline.md)
- [model-router.md](model-router.md)
- [prompt-engine.md](prompt-engine.md)
- [agent-runtime.md](agent-runtime.md)
- [../product/command-center-foundation.md](../product/command-center-foundation.md)
- [../roadmap/MASTER_BACKLOG.md](../roadmap/MASTER_BACKLOG.md)

## Next Safe Action

Add typed server-only environment validation, provider registry fixtures, prompt
pack fixtures, and an agent permission matrix before adding live provider
adapters or requesting API keys.
