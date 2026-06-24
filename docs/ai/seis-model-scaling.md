# SEIS Model Scaling Hardware Profile

## Purpose

Define the safe path for SEIS model research from a 20B local-compatibility
target for 16GB+ RAM machines toward future 70B, 150B, and larger parameter
classes.

This is a planning and validation contract. It is not a claim that SEIS has
trained, downloaded, benchmarked, published, or served a 20B, 70B, or 150B
model.

Machine-readable source:
`content/development/seis-model-scaling-hardware-profile.json`.

Validation:

```bash
npm run check:seis-model-scaling-hardware-profile
```

SEIS AI agent status tool:
`seis_ai_core_model_scaling_status`.

## Current Target

| Target | RAM Class | Status | Runtime Authority | Boundary |
| --- | --- | --- | --- | --- |
| SEIS 20B Local Compatibility Target | 16GB+ RAM | Planned, not validated | False | No weights, no inference, no benchmark, no live provider call. |
| SEIS 150B Frontier Research Target | Approved distributed/multi-accelerator/cloud research runtime | Not scoped | False | No weights, no inference, no benchmark, no live provider call, no cloud provisioning. |

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
  deployment, publication, or paid compute

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

| Class | Horizon | Status | Required Gate |
| --- | --- | --- | --- |
| 20B | Now | Planned, not validated | Quantized local compatibility benchmark and no-key startup validation. |
| 70B | Future | Research roadmap | Clean-room dataset, model card, safety eval, hardware budget, and explicit approval. |
| 150B | Future frontier | Frontier research roadmap | Only after 20B and 70B evidence exists; requires clean-room training plan, distributed-runtime budget, privacy review, safety eval, observability, rollback, and explicit human approval. |
| 120B+ | Future | Research roadmap | Independent evaluation, privacy review, observability, rollback plan, and cost approval. |
| Highest available future | Long-term | Not scoped | Do not scope until 20B, 70B, and 150B gates have evidence. |

## Creation Stages

| Stage | Meaning | Status |
| --- | --- | --- |
| Stage 0 | Local Demo and deterministic seed-model lab | Active |
| Stage 1 | SEIS 20B local compatibility target | Planned, not validated |
| Stage 2 | SEIS 70B research target | Research roadmap |
| Stage 3 | SEIS 150B frontier research target | Frontier research roadmap |
| Stage 4 | Highest available future parameter class | Not scoped |

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
