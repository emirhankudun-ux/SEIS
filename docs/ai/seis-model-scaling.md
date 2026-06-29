# SEIS Model Scaling Hardware Profile

## Purpose

Define the safe path for SEIS model research from a 20B local-compatibility
target for 16GB+ RAM machines toward future 70B, 150B, 512B apex SEIS AGI
readiness, and larger parameter classes.

This is a planning and validation contract. It is not a claim that SEIS has
trained, downloaded, benchmarked, published, served a 20B, 70B, 150B, or 512B
model, or demonstrated AGI.

Machine-readable source:
`content/development/seis-model-scaling-hardware-profile.json`.

Language Model Intake Registry:
`content/development/seis-language-model-intake-registry.json`.

## Internet Research Baseline

The public frontier-model landscape supports a conservative SEIS 512B plan-only
boundary rather than a local-runtime claim:

- [Meta Llama 3.1 405B](https://ai.meta.com/blog/meta-llama-3-1/) documents a
  405B open foundation-model release, which keeps SEIS 512B in frontier-scale
  territory rather than ordinary developer-laptop territory.
- [Megatron-Turing NLG 530B](https://arxiv.org/abs/2201.11990) documents a
  530B-scale training effort with large-scale distributed infrastructure, which
  supports the requirement for explicit GPU/cloud budget, observability,
  rollback, and human approval before any 512B training scope.
- [DeepSeek-V3](https://arxiv.org/abs/2412.19437) documents a 671B-total MoE
  model with far fewer activated parameters per token, which supports keeping
  dense-vs-MoE architecture selection as a required gate rather than assuming a
  routeable dense 512B model.
- [Qwen3-235B-A22B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507)
  documents a public MoE model card with total and activated parameter counts,
  which reinforces that SEIS must track total parameters, activated parameters,
  inference memory, context length, and safety separately.
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
  keeps governance, risk mapping, measurement, management, safety, security,
  privacy, transparency, accountability, and fairness as first-class gates for
  any SEIS AGI-readiness claim.
- [Anthropic Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy)
  reinforces that capability thresholds, safeguards, security posture, and
  escalation reviews must be explicit before frontier model deployment claims.

Validation:

```bash
npm run check:seis-model-frontier-escalation-policy
npm run check:seis-150b-frontier-model-program
npm run check:seis-512b-apex-model-program
npm run check:seis-model-scaling-hardware-profile
npm run check:seis-model-scaling-subagent-council
npm run check:seis-language-model-intake
```

SEIS AI agent status tool:
`seis_ai_core_model_scaling_status`.

Frontier escalation policy:
`content/development/seis-model-frontier-escalation-policy.json`.

150B Frontier Model Program:
`content/development/seis-150b-frontier-model-program.json`.

MCP resource:
`seis://ai/150b-frontier-model-program.json`.

512B Apex Model Program:
`content/development/seis-512b-apex-model-program.json`.

MCP resource:
`seis://ai/512b-apex-model-program.json`.

Model scaling sub-agent council:
`content/development/seis-model-scaling-subagent-council.json`.

## Current Target

| Target | RAM Class | Status | Runtime Authority | Boundary |
| --- | --- | --- | --- | --- |
| SEIS 20B Local Compatibility Target | 16GB+ RAM | Planned, not validated | False | No weights, no inference, no benchmark, no live provider call. |
| SEIS 150B Frontier Research Target | Approved distributed/multi-accelerator/cloud research runtime | Not scoped | False | No weights, no inference, no benchmark, no live provider call, no cloud provisioning. |
| SEIS 512B AGI Apex Research Target | Frontier-scale distributed research cluster | Apex program, plan only | False | No AGI proof, no weights, no inference, no benchmark, no provider call, no cloud/GPU provisioning. |

16GB+ is a target compatibility class. It becomes a verified claim only after a
quantized runtime adapter, memory ceiling benchmark, no-key startup test,
fallback identity check, redacted logging, model card, dataset card, and human
approval exist.

Until then, SEIS AI Core continues to use Local Demo mode and the deterministic
local seed-model lab.

## What SEIS 20B Means Right Now

`SEIS 20B` is a model-development target profile. It means SEIS is preparing
the contracts needed to evaluate a future 20B-class local model path on 16GB+
RAM machines. It does not mean SEIS has trained, downloaded, served, benchmarked,
published, or renamed a 20B model.

The practical first milestone is not training. The practical first milestone is
a reviewable compatibility package:

- clean-room provenance plan
- model card and dataset card templates
- selected local runtime adapter
- quantized artifact approval path
- benchmark manifest with memory and throughput fields
- local-only fallback behavior
- redacted logs and client-bundle secret scan
- human approval before downloads, training, fine-tuning, benchmarks, SSH,
  deployment, publication, AGI claims, or paid compute

## 16GB+ Compatibility Profiles

The machine-readable profile now separates RAM classes so that `16GB+` stays a
clear local target without becoming an unverified performance claim.

| Profile | Target | Status | Allowed Today |
| --- | --- | --- | --- |
| 16GB+ RAM developer floor | 20B / Q4-class candidate | Planning only, not verified | Local Demo and deterministic seed-model lab only |
| 24GB+ RAM candidate lane | 20B / Q4-class candidate | Planning only, not verified | Local Demo only |
| 32GB+ RAM validation lane | 20B / Q5-Q6 candidate | Planning only, not verified | Local Demo and future approved adapter tests |
| 64GB+ or approved accelerator lane | 70B research | Research roadmap | Planning only |
| Distributed or cloud research lane | 150B+ frontier | Not scoped | Disabled |

Every profile remains `routeEligibleToday: false`. Route eligibility requires
evidence, not intention.

## Benchmark Manifest Contract

Before SEIS can say that a 20B profile works on 16GB+ RAM, the repository must
complete the benchmark artifact at:

`reports/seis-model-scaling/20b-16gb-memory-benchmark.json`

That file now exists only as `template-not-measured`. It is not benchmark
evidence and does not verify 16GB+ compatibility. A future completed version
must be human-reviewed and include at least:

- machine RAM
- runtime name and version
- model artifact ID and license
- quantization
- context tokens
- peak resident memory
- KV-cache memory
- OS memory pressure
- wall-clock startup time
- tokens per second
- fallback verification
- secret-redaction status
- local-only fallback result
- measurement timestamp
- reviewer identity

The benchmark manifest must not contain provider keys, SSH private keys, access
tokens, unredacted secret paths, or training claims without training logs.

Current manifest status:

| File | Status | Meaning |
| --- | --- | --- |
| `reports/seis-model-scaling/20b-16gb-memory-benchmark.json` | `template-not-measured` | Required fields exist, but no model artifact, runtime, memory, throughput, or fallback measurements have been recorded. |

## Command Center 20B Local Preflight

The SEIS Desktop Command Center can export a browser-local dry-run checklist to:

`/home/seis/Documents/seis-20b-local-preflight.md`

This preflight is useful product evidence because it gives the demo a concrete
20B preparation workflow. It is not benchmark evidence. It does not download a
model, run inference, train weights, call a provider, execute SSH, deploy
infrastructure, measure RAM, or prove 16GB+ compatibility.

The preflight remains route-blocked until the benchmark manifest is completed
with human-reviewed, redacted measurements and the model artifact has clean-room
provenance, model-card, dataset-card, local-only fallback, and safety evidence.

## Host Hardware Preflight

SEIS can also inspect the current host RAM class without downloading or running a
model:

```bash
npm run inspect:seis-model-local-hardware
npm run inspect:seis-model-local-hardware:write
npm run check:seis-model-local-hardware-preflight
```

The write command stores ignored QA evidence at:

`dist/qa/model-scaling/local-hardware-preflight.json`

This host preflight can observe whether the machine has a 16GB+ RAM floor. The
check command must fail on a host below that floor instead of printing a
successful preflight. Passing the RAM-floor check still does not prove 20B
compatibility, does not run inference, does not benchmark memory, and does not
make any 20B, 70B, or 150B route eligible.

The check command is stronger than the inspector command: it validates the host
preflight output together with the model-scaling profile, 20B benchmark
manifest, benchmark dry-run report, model-card template, and dataset-card
template. It still performs no model download, inference, provider call, SSH,
deployment, or benchmark measurement.

## 20B Model And Dataset Card Templates

The 20B lane now has explicit evidence templates that must be filled before any
future route eligibility claim:

| File | Status | Purpose |
| --- | --- | --- |
| `content/development/seis-20b-model-card-template.json` | `template-not-filled` | Requires model artifact id, license review, clean-room provenance, quantization, safety evaluation, memory benchmark reference, redacted runtime logs, and reviewer metadata before any 20B runtime claim. |
| `content/development/seis-20b-dataset-card-template.json` | `template-not-filled` | Requires source inventory, license map, rights review, privacy review, PII/secret scan, deduplication plan, dataset split plan, and reviewer metadata before any dataset, training, fine-tuning, benchmark, or provider-upload work. |

Both templates are intentionally blocked today. They do not approve model
downloads, dataset downloads, training, fine-tuning, benchmark execution,
publication, provider upload, or route eligibility.

## 20B Benchmark Dry-Run

SEIS now has a deterministic benchmark-preparation dry-run report:

```bash
npm run automation:seis-20b-benchmark-dry-run
npm run check:seis-20b-benchmark-dry-run
```

The generated report is:

`reports/seis-model-scaling/20b-benchmark-dry-run.json`

This report verifies that the 20B benchmark prerequisites are still blocked
until model artifact review, dataset provenance review, runtime adapter
approval, measured memory benchmark evidence, local-only fallback proof,
redacted logs, and human review exist.

It is not benchmark evidence. It does not download a model, run inference,
train weights, fine-tune, call a provider, execute SSH, deploy infrastructure,
measure RAM, or make 20B, 70B, 150B, or 512B route eligible.

## Model Parameter Ladder

SEIS now has a separate parameter ladder contract for the user-requested path
from 16GB+ RAM / 20B toward 70B, 150B, 300B+, 512B, and the highest future
parameter class:

| Surface | Value |
| --- | --- |
| Source | `content/development/seis-model-parameter-ladder.json` |
| MCP resource | `seis://ai/model-parameter-ladder.json` |
| Quality gate | `npm run check:seis-model-parameter-ladder` |
| Status | `planning-contract-not-runtime` |
| Default route | `seis-local-demo` |

The ladder is machine-readable planning evidence only. It creates no trained
model, downloads no weights or datasets, runs no inference, benchmarks no
memory, provisions no GPU or cloud runtime, executes no SSH, and does not make
any model route eligible.

| Parameter class | Hardware class | Status | Allowed today |
| --- | --- | --- | --- |
| 20B | 16GB+ RAM target after measurement | Planned, not validated | Local Demo, deterministic seed-model lab, documentation, and dry-run preflight only |
| 70B | 64GB+ or approved accelerator/server runtime | Research roadmap | Planning only |
| 150B | Approved distributed, multi-accelerator, or cloud research runtime | Frontier research roadmap | Disabled |
| 300B+ | Not scoped | Exploration boundary | Disabled |
| 512B | Frontier-scale distributed research cluster | Apex program, plan only | Disabled |
| Highest available future | Defined only after lower-tier measured evidence | Not scoped | Disabled |

## Frontier Escalation Policy

SEIS now has a dedicated frontier escalation policy for moving from the planned
20B target toward 70B, 150B, 512B, and larger future classes:

`content/development/seis-model-frontier-escalation-policy.json`

MCP resource:

`seis://ai/model-frontier-escalation-policy.json`

Validation:

```bash
npm run check:seis-model-frontier-escalation-policy
```

This policy is the formal no-skip ladder. It keeps the following rule explicit:

- `no-skip-20b`: 70B, 150B, 512B, and larger parameter classes cannot become
  runtime-scoped until the 20B local compatibility gates produce real evidence.

The policy also records:

- `stage-1-20b-local-compatibility` as planned, not validated
- `stage-2-70b-research` as research roadmap
- `stage-3-150b-frontier` as frontier research roadmap
- `stage-4-512b-apex` as apex program, plan only
- `stage-4-highest-available-future` as not scoped

Every non-demo stage remains `routeEligibleToday: false`. The active allowed
mode remains Local Demo and deterministic seed-model lab only.

The policy does not download models, download datasets, run inference, train,
fine-tune, benchmark memory, call providers, execute SSH, deploy infrastructure,
publish weights, or claim SEIS owns a trained 20B, 70B, 150B, 512B, AGI, or
larger foundation model.

## 150B Frontier Model Program

SEIS now tracks the 150B direction as a separate program record:

`content/development/seis-150b-frontier-model-program.json`

MCP resource:

`seis://ai/150b-frontier-model-program.json`

Validation:

```bash
npm run check:seis-150b-frontier-model-program
```

The status is `frontier-program-plan-only`. It is not a trained model, routeable
runtime, benchmark, checkpoint, cloud deployment, SSH workflow, provider
wrapper, or production claim. It exists so the 20B-to-70B-to-150B path has a
machine-readable charter, stage plan, promotion gates, agent responsibilities,
and forbidden-claim rules before any future frontier work is approved.

Current stage boundary:

| Stage | Status | Route state |
| --- | --- | --- |
| Charter | Planned | Not route eligible |
| Clean-room data | Blocked until provenance plan | Not route eligible |
| Architecture selection | Not selected | Not route eligible |
| Distributed runtime | Budget and approval needed | Not route eligible |
| Training readiness | Not authorized | Not route eligible |
| Evaluation and safety | Not run | Not route eligible |

The 150B Frontier Model Program remains blocked until 20B and 70B evidence,
clean-room training plan, distributed runtime budget, observability,
kill-switch, rollback, cost-stop, privacy, safety, and explicit human approval
exist.

## 512B Apex Model Program

SEIS now tracks the 512B / SEIS AGI direction as a separate apex program record:

`content/development/seis-512b-apex-model-program.json`

MCP resource:

`seis://ai/512b-apex-model-program.json`

AGI evaluation protocol:

`content/development/seis-agi-evaluation-protocol.json`

MCP resource:

`seis://ai/agi-evaluation-protocol.json`

Validation:

```bash
npm run check:seis-512b-apex-model-program
node scripts/check-seis-agi-evaluation-protocol.mjs
```

The status is `apex-program-plan-only`. It is not AGI, a trained model,
routeable runtime, benchmark, checkpoint, cloud deployment, SSH workflow,
provider wrapper, or production claim. It exists so installed AI systems and
all SEIS sub-agents can review a 512B readiness path without gaining download,
training, benchmark, provider, cloud/GPU, SSH, deployment, or release authority.

The 512B Apex Model Program remains blocked until 20B, 70B, 150B, and 300B+
evidence exists, a clean-room training plan is accepted, the AGI capability
evaluation protocol is accepted, all-agent council review is recorded, and
explicit human approval exists.

## 512B AGI Readiness Research Baseline

The 512B program now carries a public internet research baseline inside
`content/development/seis-512b-apex-model-program.json`. That baseline links
frontier-scale examples such as Llama 3.1 405B, Megatron-Turing NLG 530B,
DeepSeek-V3 671B MoE, and Qwen3-235B-A22B to SEIS engineering implications.

The baseline is deliberately conservative:

- parameter count alone is not AGI evidence
- a prompt, RAG layer, provider wrapper, local demo, or sub-agent assignment is
  not a SEIS-owned foundation model
- total parameters, activated parameters, context length, inference memory,
  model-card evidence, dataset provenance, and safety evidence must be tracked
  separately
- public GitHub readiness requires zero-key reproducible startup, CI evidence,
  release/rollback notes, forbidden-claim checks, and no secret exposure

The AGI readiness definition remains `definition-only-not-demonstrated`.
`content/development/seis-agi-evaluation-protocol.json` now defines the
required evaluation dimensions: multi-domain reasoning, long-horizon planning,
tool-use reliability, out-of-distribution generalization, memory/learning
boundaries, safety/misuse resistance, security/data governance, and human plus
external review.
Before SEIS can make any real AGI claim, the repository must contain
independent multi-domain capability evaluation, long-horizon planning
evaluation, tool-use reliability evidence, out-of-distribution generalization
evidence, privacy/data-rights review, red-team results, model/system cards,
training logs, checkpoint governance, external review, and explicit human
approval.

## Language Model Intake Registry

SEIS tracks broad model-family intake separately from model scaling:

`content/development/seis-language-model-intake-registry.json`

The registry is metadata-only. It can list candidate families such as Llama,
Qwen, Gemma, Mistral, DeepSeek, OpenAI open-weight candidates,
embedding/reranker families, and code-specialist families, but it cannot
install them, download checkpoints, approve fine-tuning, approve full training,
or prove AGI.

The safe order is retrieval first, then a single reviewed local model
experiment, then adapter/fine-tune work only after model cards, dataset cards,
license review, benchmark plans, safety review, and explicit approval.

## Model Scaling Sub-Agent Council

The 20B/70B/150B/512B path is now assigned to a dedicated plan-only council:

`content/development/seis-model-scaling-subagent-council.json`

Validation:

```bash
npm run check:seis-model-scaling-subagent-council
```

The council keeps all model-scaling work split across 12 bounded agents:
Architect, Code, Design, UI/UX, Research, Search, Security, DevOps,
Documentation, QA, Cloud, and Automation. Every agent is `plan-only`.

This means the agents may inspect local evidence, report gaps, and produce
plans. They may not download models, download datasets, run inference, execute
benchmarks, train or fine-tune models, set provider credentials, execute SSH,
provision cloud/GPU resources, deploy, publish checkpoints, or approve route
eligibility by themselves.

| Stage | Lead agents | Status | Route state |
| --- | --- | --- | --- |
| 20B | Architect, Code, Security, QA, Documentation | Planned, not validated | Not route eligible |
| 70B | Research, DevOps, Cloud, Security | Research roadmap | Not route eligible |
| 150B | Architect, Research, Cloud, Security, QA | Frontier research roadmap | Not route eligible |
| 512B | Architect, Code, Design, UI/UX, Research, Search, Security, DevOps, Documentation, QA, Cloud, Automation | Apex program, plan only | Not route eligible |
| Highest future | Architect, Research, Security, Documentation | Not scoped | Not route eligible |

The council is coordination evidence only. A plan-only sub-agent assignment is
not runtime evidence and cannot be used as proof that SEIS has trained,
downloaded, benchmarked, served, or routed a 20B, 70B, or 150B model.

For the 512B program, all 12 agents now have explicit plan-only duties:
architecture charter, validator/MCP synchronization, honest UI labeling,
user-facing no-overclaim review, public research tracking, provenance-aware
search, security blocking, distributed runtime planning, documentation
alignment, deterministic QA, cloud-disabled status, and automation/push/merge
approval gates. These duties improve readiness only; they do not authorize
model downloads, training, benchmarks, provider calls, SSH, deployment, GitHub
mutation, or route eligibility.

## 20B / 16GB+ Memory Budget Contract

The first practical SEIS model target is a 20B local-compatibility profile for
16GB+ RAM machines. This is a target profile, not a validated runtime claim.

The profile now records a memory budget contract with required measurements for:

- cold start peak resident memory
- steady-state idle resident memory
- prompt prefill memory at the declared context length
- decode memory at the declared context length
- tokens per second with the hardware profile
- fallback behavior when the memory ceiling is exceeded
- redacted logs proving no provider key or secret exposure
- KV-cache memory and OS memory pressure

Minimum benchmark artifacts must include machine RAM, runtime name and version,
model artifact ID, quantization, context tokens, peak resident memory, throughput,
fallback status, secret-redaction status, local-only fallback result, and
measurement time.

Until those measurements exist, 16GB+ remains `not-verified`.

## Quantization And Runtime Candidates

20B on 16GB+ requires quantization before it can even become a candidate.
Current lanes are:

| Lane | Status | Route Eligible Today |
| --- | --- | --- |
| Q4-class 20B local candidate | Planned, not benchmarked | False |
| Q5/Q6-class 20B workstation candidate | Planned, not benchmarked | False |
| Higher precision research-only lane | Future research | False |

Runtime candidates are no-key local profiles only:

- llama.cpp-compatible local runtime
- Ollama local runtime

Both remain candidate-only and require explicit approval before model download,
runtime setup, benchmark execution, publication, or deployment.

## Future Scale Ladder

The dedicated parameter ladder source is:

`content/development/seis-model-parameter-ladder.json`

MCP resource:

`seis://ai/model-parameter-ladder.json`

| Class | Horizon | Status | Required Gate |
| --- | --- | --- | --- |
| 20B | Now | Planned, not validated | Quantized local compatibility benchmark and no-key startup validation. |
| 70B | Future | Research roadmap | Clean-room dataset, model card, safety eval, hardware budget, and explicit approval. |
| 150B | Future frontier | Frontier research roadmap | Only after 20B and 70B evidence exists; requires clean-room training plan, distributed-runtime budget, privacy review, safety eval, observability, rollback, and explicit human approval. |
| 300B+ | Future | Research roadmap | Independent evaluation, privacy review, observability, rollback plan, and cost approval. |
| 512B | Apex frontier | Apex program, plan only | Only after 20B, 70B, 150B, and 300B+ evidence exists; requires clean-room training plan, frontier cluster budget, AGI eval protocol, safety red-team, observability, rollback, cost-stop, all-agent review, and explicit approval. |
| Highest available future | Long-term | Not scoped | Do not scope until 20B, 70B, 150B, 300B+, and 512B gates have evidence. |

## Creation Stages

| Stage | Meaning | Status |
| --- | --- | --- |
| Stage 0 | Local Demo and deterministic seed-model lab | Active |
| Stage 1 | SEIS 20B local compatibility target | Planned, not validated |
| Stage 2 | SEIS 70B research target | Research roadmap |
| Stage 3 | SEIS 150B frontier research target | Frontier research roadmap |
| Stage 4 | SEIS 512B apex research target | Apex program, plan only |
| Stage 5 | Highest available future parameter class | Not scoped |

The stage ladder exists so SEIS can move forward without fake checkpoints. A
stage can be promoted only when its required evidence exists in files, logs,
benchmarks, model cards, dataset cards, and review records.

## 150B Frontier Research Boundary

The current user goal includes a 150B SEIS AI direction. In this repository,
that means a validated research lane, not a trained or routeable model claim.
The 150B lane is blocked until SEIS has:

- real 20B and 70B gate evidence
- a clean-room training plan
- dataset and model cards with rights and safety review
- distributed or multi-accelerator runtime architecture
- cost, privacy, and observability plans
- rollback and shutdown procedures
- independent evaluation and red-team scope
- explicit human approval before any download, training, fine-tuning,
  benchmark, publication, deployment, SSH, or cloud provisioning

## Non-Goals

- Do not claim SEIS owns trained 20B, 70B, or 150B foundation-model weights.
- Do not claim 150B weights are downloadable, routeable, benchmarked, or
  production-ready.
- Do not rename third-party checkpoints, LoRA adapters, quantizations, provider
  APIs, prompt profiles, RAG systems, or wrappers as SEIS foundation models.
- Do not silently route local-only requests to a cloud provider.
- Do not expose provider secrets in browser code.
- Do not run dataset downloads, model downloads, training, fine-tuning, paid
  benchmarks, GPU provisioning, SSH, deployment, or publication without human
  approval.

## Promotion Gates

Before 20B can move from planned target to validated local profile, SEIS needs:

- clean-room dataset plan
- dataset card with source and rights review
- model card with training and evaluation summary
- selected quantized runtime adapter
- measured 16GB+ memory ceiling benchmark
- no-key core startup test
- local-only fallback test
- redacted logs and client-bundle secret scan
- independent benchmark suite
- explicit human approval for any download, training, fine-tuning, publication,
  deployment, SSH, or paid benchmark

## Related Documents

- [SEIS AI Core](seis-ai-core.md)
- [Model Router](model-router.md)
- [AI Workforce Training](ai-workforce-training.md)
- [Agent Runtime](agent-runtime.md)
- [Security Policy](../../SECURITY.md)
