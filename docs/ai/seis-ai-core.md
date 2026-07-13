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
| Model router | Implemented as Local Demo contract in Swift | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIModelRouter.swift`, `docs/ai/model-router.md`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAIRuntimeTests.swift` | No backend provider test harness, server-only adapter validation, or credential-bound routing to external services exists. | Keep live provider adapters disabled until typed server validation, gateway hardening, and explicit approval evidence exist. |
| Prompt engine | Implemented as a versioned, local Swift contract | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIPromptEngine.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAIPromptEngineTests.swift`, `docs/ai/prompt-engine.md` | No live provider adapter, tokenizer-backed budget, or prompt-injection corpus exists. | Keep rendering ephemeral and add reviewed injection fixtures before any live adapter. |
| Agent runtime | Implemented as status-and-plan only | `docs/ai/agent-runtime.md`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIAgentPlanRuntime.swift`, `content/development/seis-ai-core-subagent-runtime-fixtures.json`, `content/development/seis-ai-core-subagent-review-ledger.json` | No write authority, background automation, or live mutation exists in Swift. | Keep runtime authority gated and dry-run before provider, deployment, SSH, GitHub, or storage write approvals exist. |
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
| Evaluation | Implemented as local readiness evaluator | `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAICoreReadinessEvaluator.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAICoreReadinessEvaluatorTests.swift`, canonical workforce assignment, training, model-planning, promotion, version-registry, operating-model, fixture-pack, review-ledger, scaling-council, MCP, plugin-integration, provider, router, intake, training-curriculum, public-readiness, operations-readiness, independent-evidence, GitHub-readiness, AGI-public-evidence, knowledge-system, data-schema-registry, design-component-inventory, universal-capability-kernel, action-governance, agent-governance, active-mission-board, and long-horizon-mission-kernel snapshots | No live-model benchmark or provider evaluation exists. | Keep the report scoped to Local Demo readiness and add live-adapter evals only after backend approval. |
| AGI evaluation protocol | Bound as metadata-only Apple readiness evidence | `content/development/seis-agi-evaluation-protocol.json`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGIEvaluationProtocolSnapshot.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAGIEvaluationProtocolSnapshotTests.swift` | Protocol is draft/not-run; no AGI, benchmark, weights, inference, provider, or route-eligibility evidence exists. | Keep the promotion default blocked and require independent evidence, external review, and human approval before any future claim or route. |
| Full-stack contract | Bound as metadata-only Apple application boundary | `content/development/seis-fullstack-contract.json`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisFullStackContractSnapshot.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisFullStackContractSnapshotTests.swift` | First server/API/data slice remains read-only Local Demo; auth, database, live AI, SSH, deployment, and GitHub writes are not enabled. | Keep no-key startup and static fallback while adding future server adapters only behind backend and human approval. |
| Agent lane status | Bound as observable metadata-only sub-agent governance | `content/development/seis-agent-lane-status.json`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAgentLaneStatusSnapshot.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisAgentLaneStatusSnapshotTests.swift` | Fourteen lanes are active records only; no background autonomy, connector mutation, secret access, or destructive authority is enabled. | Keep the five personal lanes supervised and require declared skill, tool, safety, autonomy, and validation evidence for new lanes. |
| SEIS Second Brain | Bound as metadata-only local knowledge contract | `content/development/seis-second-brain-system.json`, `packages/seis_platform_swift/Sources/SeisPlatformKit/SeisSecondBrainContractSnapshot.swift`, `packages/seis_platform_swift/Tests/SeisPlatformKitTests/SeisSecondBrainContractSnapshotTests.swift` | Local Demo vault notes, memory, and retrieval planning are bounded; private Obsidian import, secrets, provider calls, SSH, deployment, and GitHub mutation remain disabled. | Keep knowledge graph and capture flows browser/local-first until explicit import, provenance, privacy, and human-review gates pass. |

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
routes, five personal plugin lanes, 35 MCP tools, 30 MCP resources, three MCP
prompts, and a 32-node / 53-edge AI Core 3D graph without requiring provider
keys, SSH, deployment, GitHub mutation, or external connector authentication.

Runtime inspection tools:
`seis_ai_core_provider_status`,
`seis_ai_core_model_scaling_status`,
`seis_ai_core_version_status`,
`seis_ai_core_version_promotion_dry_run`,
`seis_ai_core_subagent_model`, and
`seis_ai_core_subagent_review_ledger`.

### Apple-native personal lane runtime

`packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAIPersonalLaneRuntime.swift`
turns the same five snapshot-backed personal lanes into typed, fail-closed
Swift plans for `seis`, `seis-cloud`, `seis-code`, `seis-design`, and
`seis-data`. The runtime accepts only capability inspection, read-only plan,
and quality-gate review actions. Plan inputs are allow-listed to the tracked
runtime snapshot and returned as auditable provenance. It returns the lane's declared MCP tool IDs
and quality gate as evidence, but does not invoke an MCP server.

`SeisAIRuntime.localDemo(snapshotData:)` now injects this lane runtime beside
the 13-agent status-and-plan runtime. A plan is blocked when its lane is
unknown, a tool is not declared by that lane, the request includes an MCP
invocation, or it crosses the network, workspace, private-content, secret,
SSH, deployment, or GitHub mutation boundary. This is a working local plan
runtime, not evidence of authenticated plugin activation or autonomous agent
execution.

On macOS, `SeisAICoreLocalDemoView` loads the tracked snapshot from the
resolved repository root and calls that typed runtime for each lane. The shell
prefers `SEIS_REPO_ROOT` while retaining `SEIS_REPOSITORY_ROOT` and `SEIS_ROOT`
as compatibility overrides. Its UI
shows the plan's Local Demo result, declared MCP tools, quality gate, approval
boundary, the 13 managed agent status-and-plan controls, and the latest bounded
execution-evidence records. It also exposes a local task planner whose purpose
input is sent only to the validated plan runtime and is not persisted in the
evidence ledger. The
`SeisAIExecutionEvidenceLedger` stores only redacted metadata: sequence,
registry subject ID, action IDs, state, provider/model identity, approval counts,
input-reference counts, and execution truth flags. It never stores a purpose,
prompt, provider output, blocked-reason text, secret, or private file content.
The panel does not open a remote MCP session, call a model provider, or execute
a tool merely because it is listed.

Native task, lane, and managed-agent planning requests pass through the
versioned `task-plan` prompt template first. Empty, undeclared, or
secret-shaped input is rejected before the status-and-plan runtime receives it;
the rendered prompt remains ephemeral and is not included in evidence.

The ledger is capped at 256 records by default. The native shell persists only
the redacted evidence envelope in the app's local Application Support directory;
if that location is unavailable, the UI reports `memory-only` or
`local-file-unavailable` instead of implying persistence. This is not a durable
audit database, authenticated provider access, or autonomous agent execution.

`SeisAICapabilityMesh` is the native read-only projection of the same plugin
and MCP evidence. It surfaces the installed/enabled and helper-plugin counts,
the five personal lane IDs, the 35-tool/30-resource/3-prompt MCP inventory,
and the four MCP transport surfaces without exposing a tool handle or opening
a session. Its validation requires an active source-backed plugin mesh, a
non-negative MCP inventory, a safe runtime boundary, and human approval for
live actions. This keeps "listed", "source-backed", "locally smoke-verified",
and "activated" as separate states.

The same native panel now exposes the existing
`SeisAGIAgentHandoffSnapshot` as a governed sub-agent orchestration surface:
one candidate writer, separated reviewer/researcher/designer roles, selected
plugin lanes, output artifacts, handoff status, and human-approval requirements.
This is decomposition and handoff evidence only. It does not activate agents,
grant runtime authority, or turn the planned writer permission into an
unapproved write.

The native panel also exposes a model-router inspector. It evaluates a typed
task type, capability, privacy mode, content classification, local-only flag,
tool requirement, maximum cost, preferred latency, and explicit fallback
policy against the registered Local Demo provider, then shows the selected
provider/model, eligibility, fallback, approval, rejection, and fail-closed
state. Inspection performs no provider call, network request, credential read,
MCP invocation, SSH action, deployment, or GitHub mutation.
An explicit inspection is recorded as a `route-inspection` evidence envelope
with only route outcome, provider/model identity, approval count, and safety
truth flags; request IDs, task types, prompt bodies, and blocked-reason text are
not persisted.

Managed-agent planning also supports a bounded batch action for all 13
validated managed agents. The batch renders each purpose through the versioned
prompt boundary, asks only the status-and-plan runtime for plans, reports the
planned count, and refreshes redacted evidence. It does not activate agents,
delegate recursively, write files, call providers or MCP, run SSH or
deployment, or mutate GitHub.

Each native managed-agent plan now carries an explicit local governance budget:
maximum 8 steps, delegation depth 1, 30-minute timeout, zero-cost tier, no
background execution, and human approval for external actions. These are
fail-closed planning bounds, not runtime authority or evidence of autonomous
execution.

The same native panel supports a bounded batch across all five personal lanes.
Each lane is checked against its declared MCP tool and quality gate, then sent
to the read-only lane planner without opening an MCP session. The result shows
the planned count and refreshes redacted evidence; it does not invoke MCP,
activate plugins, call providers, access private content, run SSH or
deployment, or mutate GitHub.

AI Core now also shows safe local workspace awareness from the shared
`SeisAppleLocalWorkspaceIndex`. It reports only the allow-listed root, bounded
entry/file/folder counts, scan state, and excluded categories. The index does
not read file contents and the AI Core surface exposes no file open, write,
rename, delete, execution, or private-content inference authority.

The native panel also reads the canonical
`content/development/ai-workforce-assignments.json` registry as a typed
metadata-only workforce snapshot. It shows the ten declared AI/tool roles,
launcher state, route, category, and Codex primary-writer policy. It does not
call Claude, Gemini, Qwen, Ollama, Kimi, OpenCode, CodeRabbit, GitHub Actions,
or any other provider merely because the role is listed; unavailable or
approval-gated states remain visible.

The same panel reads the canonical
`content/development/seis-ai-workforce-training-plan.json` registry as a typed
local training control-plane snapshot. It exposes the ten trainer roles, seven
training loops, four deterministic seed-model targets, local quality and
automation commands, launcher evidence, safety rules, and acceptance gates.
Every trainer role remains credential-free, live-provider-disabled, and
external-training-disabled; every seed target keeps `runtimeAuthority: false`.
The panel only inspects this contract. It does not run training, download
datasets, call providers, publish models, or claim SEIS owns a trained
foundation model.

It also reads six canonical model-planning and public-readiness records:
`seis-model-scaling-hardware-profile`,
`seis-model-parameter-ladder`,
`seis-model-frontier-escalation-policy`,
`seis-150b-frontier-model-program`,
`seis-512b-apex-model-program`, and
`seis-agi-public-readiness-evidence`. The typed native snapshot keeps route
eligibility, runtime authority, production readiness, training/benchmark
status, AGI claim status, forbidden-claim counts, approval counts, and next
safe actions visible. These records are plan/evidence contracts only:
frontier and AGI claims remain blocked, while Local Demo is the only mode that
may be marked publicly safe.

Finally, the panel reads
`content/development/seis-ai-core-version-promotion-gates.json` as an
evidence-only promotion snapshot. It exposes the current internal-review
decision, status-and-plan-only runtime boundary, five lane responsibilities,
five yearly gates, required evidence, blockers, and next safe actions.
`releasePromotionAllowed`, external mutation, credential access, live
provider calls, and background automation remain disabled. A promotion
dry-run is not release approval, internal review is not public release, and
provider routing is not model ownership.

The panel also reads
`content/development/seis-ai-core-version-registry.json` as the canonical
SEIS AI Core v0.1 identity. It exposes the seven version components, five
plan-only lane bindings, five-year version roadmap, promotion evidence
requirements, and zero-key Local Demo runtime boundary. The registry is an
application-layer intelligence profile; it is not a foundation model, trained
model, autonomous write runtime, provider-ownership claim, or release approval.

The panel also reads
`content/development/seis-ai-core-subagent-operating-model.json`. It exposes
the five permission levels, five sub-agent lanes, fourteen evidence
requirements, five-year roadmap, and review cadence. Read-only and plan-only
levels are enabled; write-gated and external-gated levels remain planned; the
forbidden level remains active. This is a bounded sub-agent contract, not
autonomous authority.

The native surface also reads
`content/development/seis-ai-core-subagent-runtime-fixtures.json`. The
fixture pack covers role schema, permission matrix, dry-run queue,
cancellation, scoped approval, redaction, and append-only planned ledger
evidence. It verifies cancellation tokens, single-writer queue policy,
no-blanket approval, disabled prompt/response logging, and no secret or raw
provider-error persistence. Fixtures are inspected only; they do not execute
agents or authorize writes.

The native surface also reads
`content/development/seis-ai-core-subagent-review-ledger.json`. It shows the
quarterly five-year horizon, current and next review quarter, two
documented-validated quarters, eighteen planned quarters, and the absence of
write-gated, credential, merge, deploy, or external-mutation evidence. Future
quarters remain planned until their evidence paths and validators exist.

The panel also reads
`content/development/seis-model-scaling-subagent-council.json`. It exposes
the twelve plan-only council agents, four council rules, five model stages,
and twelve 512B duties. All stages remain route-blocked and credential-free;
the council does not run models, download weights/datasets, benchmark, train,
call providers, execute SSH, provision cloud/GPU resources, publish
checkpoints, or claim SEIS owns frontier or AGI weights.

The panel also reads
`content/development/seis-ai-core-mcp-runtime-contract.json`. It exposes
the local stdio JSON-RPC transport, 35 tools, 30 resources, 3 prompts, four
verified MCP surfaces, fallback runtime, smoke test, and credential boundary.
This is local MCP smoke evidence only; it does not authenticate remote MCP
servers or execute credentials, SSH, deployment, GitHub mutation, or
unrestricted shell tools.

The panel also reads
`content/development/seis-agent-plugin-integration.json`. It exposes 185
installed/enabled and 5 not-installed audit states, five personal plugins,
ten specialist lanes, 300 helper plugins, MCP tool/resource bindings, and
task-scoped activation policy. Installed metadata does not claim connector
authentication or activate plugins; no-blanket-activation, no-secret-disclosure,
and user-confirmed external mutation boundaries remain enforced.

The panel also reads
`content/development/seis-language-model-intake-registry.json`. It exposes
eight candidate model families, three hardware lanes, five training lanes,
license/provenance gates, and the preferred retrieval-first knowledge strategy.
Every family remains metadata-only and not installed by the registry; downloads,
runtime authority, provider calls, training, fine-tuning, dataset downloads,
secret reads, and browser secrets remain disabled.

The panel also reads
`content/development/seis-language-model-training-curriculum.json`. It exposes
the eight family candidates, three hardware lanes, four scaling targets, four
curriculum phases, eight safe controls, four approval prerequisites, and seven
evidence artifacts. Every target remains route-ineligible with no runtime
authority, and the curriculum remains planning-only; it does not install models,
download checkpoints or datasets, call providers, run inference or benchmarks,
fine-tune, train adapters, or pretrain a foundation model.

The panel also reads
`content/development/seis-ai-public-readiness-program.json`. It separates
Local Demo public review from GitHub-wide readiness, AGI claims, 512B route
eligibility, runtime authority, training, weights, inference, and benchmark
status. It exposes six readiness gates, four audience modes, thirteen AGI
prerequisites, seven forbidden claims, and plan-only council actions; it does
not promote any of those blocked states.

The panel also reads
`content/development/seis-command-center-operations-readiness.json`. It
exposes release, CI, security, rollback, and handoff areas; four summary cards;
six checks; owners, statuses, gates, and evidence; and the
`review-before-release` completion rule. It does not promote release-ready,
deploy, merge, external-CI, or rollback claims without their required evidence.

The panel also reads
`content/development/seis-agi-independent-evidence-ledger.json`. It exposes
four research baselines, three missing external inquiries, seven readiness
gates, seven required artifacts, human approval as `not-recorded`, and the
five forbidden claims. The ledger remains plan-only and does not authorize AGI
or 512B claims, internet downloads, training, inference, benchmarks, deployment,
or routeability.

The panel also reads
`content/development/seis-agi-github-user-readiness-gates.json`. It exposes the
no-key validator, twelve local checks, four GitHub user modes, seven readiness
gates, eight everyone-ready prerequisites, six forbidden claims, and explicit
Local Demo versus AGI/release boundaries. It remains review-gated and does not
grant route eligibility, runtime authority, provider use, SSH, deployment, push,
merge, or release approval.

The panel also reads
`content/development/seis-agi-public-readiness-evidence.json`. It exposes the
blocked AGI evidence matrix, four source-derived gates, eleven evaluation
dimensions, twenty minimum claim-evidence requirements, zero accepted items,
twenty missing items, forbidden greenlights, and next-safe actions. It remains
Local Demo-only and never promotes AGI, 512B, inference, benchmark, provider,
training, deployment, or routeability claims.

The panel also reads
`content/development/seis-command-center-knowledge-system.json`. It exposes six
repository knowledge nodes, five evidence kinds, seven evidence records, the
knowledge release rule, and a security boundary that stores no secrets. This is
metadata-only knowledge-system evidence; it does not read private content,
expose credentials, or imply external retrieval or provider authority.

The panel also reads
`content/development/seis-data-schema-registry.json`. It exposes eighteen
source-backed records across the five SEIS lanes, with sixteen validated and two
scaffolded records, plus their shapes, freshness, validation commands, and
secret policies. This is metadata-only registry evidence; it does not read
record contents, access credentials, or activate data connectors.

The panel also reads
`content/development/seis-design-component-inventory.json`. It exposes twelve
source-backed design components, surface and selector coverage, accessibility
notes, motion policies, validation commands, and repository-relative source
paths. This is metadata-only design evidence; it does not mutate the design
system or claim browser QA beyond the source-backed checker.

The panel also reads
`content/development/seis-universal-capability-kernel.json`. It exposes 38
domains, 14 lanes, 38 agent roles, 168 plugin inventory records, Apple and
Windows language coverage, platform development tracks, and the scoped routing
boundary. This is metadata-only capability evidence; no connector, MCP server,
plugin, or external model is activated without relevance, authentication,
permission scope, and user approval.

The panel also reads
`content/development/seis-action-decision-contract.json` and
`content/development/seis-action-execution-contract.json`. It exposes the
read-only decision default, 12 capability rules, secret denial, dry-run default,
60-second command cap, explicit approval requirements, redaction patterns, and
documented rollback policy. This is contract evidence only; the native panel
does not execute actions, shell, Git, network, deployment, model, or data work.

The panel also reads
`content/development/seis-ai-core-agent-role-schema.json` and
`content/development/seis-ai-core-agent-permission-matrix.json`. It exposes
five lane roles, five permission levels, two enabled safe levels, plan-only
authority, one-level delegation, no network scope, denied tools, and the
separate security/recovery boundary for forbidden actions. This remains
status-and-plan-only agent metadata; it does not activate agents or grant
write, external, or forbidden authority.

The panel also reads
`content/development/seis-active-mission-board.json`. It exposes thirty
deterministic cards across now, next, and queued lanes, five platforms, 29
languages, 41 quality gates, 12 acceptance gates, and the no-language-percentage
runtime-install policy. The native surface is a planning projection; it does
not install runtimes or execute mission cards.

The panel also reads
`content/development/seis-long-horizon-missions.json`. It exposes a 52-week,
12-wave, 120-mission kernel with 38 domains, 35 language records, 20 Apple
missions, 20 Windows missions, source references, and the same no-language-
percentage runtime-install policy. This is metadata-only mission evidence; the
native surface does not install runtimes, activate agents, or execute missions.

The panel also reads
`content/development/seis-agi-evaluation-protocol.json`. It exposes the
protocol's 20 minimum evidence items, 11 evaluation dimensions, four
source-derived gates, 10 public research sources, and 11 required reviewers.
All evaluations remain `not-run`, the default promotion decision remains
`blocked`, and external review plus human route approval remain required. This
is a safety and evidence boundary, not AGI, benchmark, weights, inference, or
provider evidence.

The panel also reads `content/development/seis-fullstack-contract.json`. It
exposes eight read-only Local Demo endpoints, five backend-only provider
states, three bounded dry-run agent tasks, seven capabilities, and the
fixture-backed session summary. The server boundary remains read-only,
frontend secret persistence remains forbidden, and the static demo must keep
working without server endpoints, auth, provider keys, SSH, or deployment.

The panel also reads `content/development/seis-agent-lane-status.json`. It
exposes 14 active source-controlled lanes and the five personal SEIS lanes
(`seis`, `seis-cloud`, `seis-code`, `seis-design`, `seis-data`) with declared
skill, tool, safety, autonomy, and validation boundaries. This is observable
sub-agent metadata; it does not activate agents or claim background autonomy.

The panel also reads `content/development/seis-second-brain-system.json`. It
exposes six local vault notes, nine managed lanes, thirteen plan-only roster
agents, six installed AI profiles, and a publish-blocked pipeline. The
browser-local Markdown vault, no-secret boundary, planned Obsidian bridge,
human-review requirement, and no-provider/no-SSH/no-deployment rules remain
visible as metadata; the native surface does not import private vaults or
execute external actions.

The panel also reads
`content/development/seis-ai-core-provider-registry.json`. It preserves
Available, Missing Key, Disabled, Rate Limited, and Error distinctions across
seven providers, while keeping core zero-key, Local Demo fallback, backend-only
credentials, and no frontend secrets. Status inspection does not validate
credentials, call providers, run network health checks, or switch providers
silently.

The panel also reads
`content/development/seis-read-only-model-router-contract.json`. It exposes
allowed and forbidden router inputs, seven named provider states, blocked model
classes, ten required evidence gates, decision integrity rules, review artifact
paths, and the Local Demo decision shape. It keeps execution, credentials,
silent fallback, cloud routing from local-only mode, and private Obsidian
content routing disabled.

Validation:
`swift test --package-path packages/seis_platform_swift`.

GitHub user readiness gates:
`content/development/seis-agi-github-user-readiness-gates.json`,
`seis://ai/agi-github-user-readiness-gates.json`,
`node scripts/check-seis-agi-github-user-readiness-gates.mjs`.
AGI public readiness evidence:
`content/development/seis-agi-public-readiness-evidence.json`,
`seis://ai/agi-public-readiness-evidence.json`.

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
