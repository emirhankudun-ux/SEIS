# SEIS Native AI Model — SEIS-150B

Date: 2026-06-30

SEIS gets its own foundation model: **SEIS-150B**, a 150-billion-parameter,
decoder-only transformer that is SEIS's sovereign in-house intelligence tier.

This document is the model card. It is paired with a machine-readable record and
an executable spec, and validated in CI — the same governance pattern SEIS uses
for every capability.

| Artifact | Path |
|---|---|
| Model card (this doc) | `docs/platform/seis-native-ai-model.md` |
| Machine-readable record | `content/governance/seis-ai-model.json` |
| Executable spec | `scripts/seis-ai-model.cjs` |
| CI check | `npm run check:seis-ai-model` |

## Status: specification (not yet weights)

A 150B-parameter model is trained on a GPU cluster, not inside this repository.
So `status` starts at `specification` and advances through `training` →
`evaluation` → `released`. The headline "150B" is **not** an unverified claim:
the check below derives the parameter count from the declared architecture and
fails if it does not land within ±3% of 150 billion. When weights exist,
`status` is promoted and `artifact` records their location and hash.

## Architecture

SEIS-150B is a dense, decoder-only transformer in the GPT/Llama family.

| Hyperparameter | Value |
|---|---|
| Hidden size (`d_model`) | 12288 |
| Layers | 82 |
| Attention heads | 96 (head dim 128) |
| Key/value heads (GQA) | 12 (8× KV compression) |
| Feed-forward width (`d_ff`) | 39936 (SwiGLU, 3.25 × `d_model`) |
| Vocabulary | 128256 |
| Max context | 32768 tokens |
| Positional encoding | RoPE |
| Normalization | RMSNorm |
| Activation | SwiGLU |
| Embeddings | tied (input ↔ output) |

### Parameter count (derived, not asserted)

`computeParameters()` in the executable spec sums the dominant terms:

- **Embeddings** — `vocab × d_model` (tied, counted once) ≈ 1.58B
- **Per layer** — attention projections (GQA Q/O full width, K/V compressed) +
  SwiGLU feed-forward (gate + up + down) + two RMSNorm gains ≈ 1.81B
- **82 layers** ≈ 148.6B, plus the final pre-logits norm

Total ≈ **150.2B parameters** — within 0.1% of the 150B target.

## Training plan

| Stage | Description |
|---|---|
| Pretraining | Self-supervised next-token prediction on a ~3T-token corpus (~20 tokens/param, Chinchilla-style) |
| Instruction tuning | Supervised fine-tuning on curated task data |
| Alignment | Preference optimization (DPO/RLHF-style) against SEIS governance values |

- **Precision:** bf16 · **Optimizer:** AdamW
- **Parallelism:** tensor + pipeline + data + fully-sharded
- **Compute:** estimated 1k+ high-memory (H100-class) accelerators

## How it fits the hybrid routing policy

The [hybrid AI routing policy](./hybrid-ai-routing-policy.md) is unchanged.
OpenAI/Codex remains the operational default writer/runtime **today**. SEIS-150B
is recorded as the `sovereign-inhouse` tier the policy can promote to its default
**only when** `status === "released"` and the evaluation gates pass. Until then
it is a governed plan, not the live default — so the two records never conflict.

## Validation

`npm run check:seis-ai-model` enforces, with no AI tooling installed (CI-safe):

1. The declared architecture computes to within ±3% of 150B parameters.
2. `parametersBillions` matches the computed total (rounded).
3. The JSON record matches the executable spec exactly (single source of truth).
4. `status` is one of the allowed lifecycle values.
5. While `status !== "released"`, the routing default stays `codex` — the
   in-house model cannot silently become the live default before it exists.
6. This doc and the routing doc both exist and are linked.

The check is wired into the governance aggregate (`npm run check:governance`).
