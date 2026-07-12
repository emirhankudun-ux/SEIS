# SEIS Model Training Execution

## Status

SEIS model training is `preflight-only-not-authorized`.

The machine-readable launch source is
`content/development/seis-frontier-training-launch-plan.json`. It is exposed as
the read-only MCP resource
`seis://ai/frontier-training-launch-plan.json` and the read-only status tool
`seis_ai_core_frontier_training_status`.

The immutable evidence schema chain is
`content/development/seis-model-training-evidence-chain.json` and is documented
in `docs/ai/training-evidence-chain.md`.

This foundation does not submit a job, authenticate a provider, download a
model or dataset, allocate paid compute, train weights, run a benchmark,
publish a checkpoint, or demonstrate AGI.

## Launch Sequence

Every real run must pass the same sequence:

1. Define the model purpose, method, ownership boundary, and success criteria.
2. Accept a dataset manifest with source, license, rights, privacy, PII,
   secret, deduplication, split, and contamination evidence.
3. Accept the architecture, tokenizer, parameter accounting, base-checkpoint
   provenance, and model-card draft.
4. Accept the hardware topology, memory estimate, cost ceiling, timeout,
   cancellation, observability, rollback, and cost-stop plan.
5. Freeze an immutable run manifest with dependencies, container identity,
   seeds, optimizer, schedule, checkpoint cadence, and redacted logging rules.
6. Record all twelve council reviews and unresolved objections.
7. Obtain explicit, unexpired human approval for the exact run, target,
   dataset, compute budget, persistence location, and cancellation owner.
8. Launch through a separately approved execution adapter.
9. Preserve logs, checkpoints, hashes, evaluation reports, incident notes, and
   cost evidence without exposing credentials.
10. Keep the model route blocked until independent evaluation, safety review,
    model card, checkpoint governance, and a second promotion approval pass.

Missing evidence always returns `deny`. Council members cannot approve their
own execution or replace human approval.

## Method Boundaries

| Method          | SEIS meaning                                                                                      | Ownership boundary                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Pretraining     | Training from initialized weights or a formally documented continuation checkpoint                | Requires complete training, data, tokenizer, checkpoint, and evaluation evidence before any SEIS-owned model claim |
| SFT             | Supervised post-training on reviewed language-modeling, conversational, or prompt-completion data | Does not by itself prove foundation-model ownership                                                                |
| DPO             | Preference post-training on reviewed prompt/chosen/rejected data                                  | Does not replace pretraining evidence or AGI evaluation                                                            |
| LoRA / adapter  | Parameter-efficient adaptation of a separately identified base model                              | Must be documented as an adapter, not as a new foundation model                                                    |
| Prompting / RAG | Application-layer prompting or retrieval                                                          | Is not training and creates no model ownership claim                                                               |

The official TRL documentation defines the supported SFT dataset families and
the preference-data requirement for DPO. These methods remain candidates only:

- [TRL SFT Trainer](https://huggingface.co/docs/trl/main/en/sft_trainer)
- [TRL DPO Trainer](https://huggingface.co/docs/trl/main/en/dpo_trainer)

## Execution Candidates

No execution backend is selected today.

- [Hugging Face Jobs](https://huggingface.co/docs/huggingface_hub/en/guides/jobs)
  is a possible managed-job adapter. A future run must declare hardware,
  timeout, encrypted secret transport, persistence, budget, cancellation, and
  result ownership before submission.
- [PyTorch FSDP2](https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html)
  is a possible sharded execution layer for approved distributed research.
- [NVIDIA Megatron Core parallelism](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/parallelism-guide.html)
  is a possible frontier-scale parallelism layer. Tensor, pipeline, context,
  expert, and data-parallel choices require measured topology and reliability
  evidence rather than headline parameter counts.

These links document candidates. They do not authorize installation, cloud
access, remote jobs, model downloads, or training.

## 16GB Local Boundary

A 16GB+ developer machine is currently suitable for Local Demo, deterministic
seed-model lab checks, dataset-card drafting, static validation, and a future
approved quantized inference preflight. It is not evidence of capacity for full
20B training and does not verify 20B inference compatibility.

The 70B, 150B, 300B+, and 512B lanes require progressively stronger measured
distributed-compute, checkpoint, cost, safety, and reliability evidence. Every
lane remains `launchDecision: deny` and `routeEligibleToday: false`.

## Risk And Safety Boundary

Training and release review must apply the voluntary
[NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
and the
[NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
as risk-management inputs. SEIS requires explicit data-rights, privacy,
information-security, misuse, transparency, supply-chain, incident, and human
oversight controls before public model readiness.

## Validation

The available command validates only the launch contract and integration:

```bash
npm run check:seis-frontier-training-launch-plan
node --test packages/seis-ai/test/agent.test.mjs
node --test packages/seis-ai/test/mcp-smoke.test.mjs
```

A passing result proves that the plan remains fail-closed. It does not prove
training, model quality, checkpoint integrity, AGI capability, or public
readiness.

## Human Approval Required

Explicit approval is required before model or dataset download, provider
authentication, paid compute, training or fine-tuning submission, benchmark
execution, checkpoint publication, route promotion, SSH, deployment, GitHub
push or pull-request creation, public release, or any AGI claim.
