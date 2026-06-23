# SEIS Compute Capacity

Status: Phase 0 capacity record

This document defines the compute evidence SEIS needs before any model training
claim. It does not assert that SEIS has reserved GPUs, cloud quota, or a
production training cluster.

## Current Capacity Evidence

| Capability | Current state | Evidence level |
| --- | --- | --- |
| Local deterministic tests | Available through Node test suites and JSON seed artifacts. | Proven by `npm test`. |
| Browser/product QA | Available through local browser QA evidence for AI Core panel navigation. | Proven by `npm run check:ai-core-browser-qa-evidence`. |
| Local model experiments | Research direction only. | Not yet proven for training. |
| Apple Silicon / MLX capacity | Potential future path. | No measured device inventory in repo. |
| GPU training | Not recorded. | No quota, hardware inventory, or training log. |
| Cloud training | Approval-gated future path. | No provider account, key, quota, or budget committed. |
| Long-context evaluation | Planned through fixtures and eval strategy. | No live benchmark scale run. |

## Training Readiness Levels

| Level | Meaning | Current status |
| --- | --- | --- |
| L0 | Documentation and governance only. | Active. |
| L1 | Deterministic local fixtures and tests. | Active for AI Core seed artifacts. |
| L2 | Tiny local nano-model experiment can run and resume. | Not ready. |
| L3 | Reproducible local training with dataset provenance. | Not ready. |
| L4 | Approved cloud or dedicated hardware training. | Not ready. |
| L5 | Release-governed model checkpoint pipeline. | Not ready. |

## Required Capacity Record Before Training

Before any training run, create a run record with:

- machine or provider class
- CPU, memory, GPU/NPU, disk, and OS
- framework and version
- expected runtime and budget
- dataset id and size
- checkpoint storage plan
- failure and resume plan
- secret handling plan
- approval owner
- rollback or cleanup plan

## Prohibited Capacity Claims

Do not claim:

- GPU capacity exists without measured hardware or provider quota evidence
- cloud quota exists without provider-side confirmation
- a model trained successfully without logs
- a benchmark passed without benchmark artifacts
- a checkpoint is release-ready without governance approval

## Near-Term Capacity Plan

1. Keep current AI Core work fixture-backed and local.
2. Add a `research/` sandbox only after governance documents are accepted.
3. Run a tiny CPU-only nano-model proof before any cloud request.
4. Record every experiment in append-only reports with no secrets.
5. Use cloud compute only after human approval, budget definition, and data
   provenance review.
