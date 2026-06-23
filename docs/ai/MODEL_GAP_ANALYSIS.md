# SEIS Model Gap Analysis

Status: Phase 0 gap analysis

This document compares the current SEIS AI foundation against the evidence
required for responsible SEIS-owned model research.

## Gap Summary

| Requirement | Current state | Gap | Next evidence |
| --- | --- | --- | --- |
| Model purpose | Defined at a high level in AI Core and SEIS Universe docs. | Needs measurable capability targets. | `SEIS_MODEL_SPECIFICATION.md`. |
| Architecture | No trainable architecture selected. | Need research ADRs and nano-model design. | `docs/adr/ai/*`. |
| Tokenizer | No tokenizer experiment. | Need Turkish, English, code, math, and design token analysis. | Tokenizer research report. |
| Data provenance | No training data manifest. | Need source, license, consent, quality, and split records. | Dataset manifest schema. |
| Training pipeline | No training script or logs for a nano model. | Need minimal reproducible CPU path first. | Nano-model experiment. |
| Evaluation | Governance and seed benchmarks exist. | Need model-specific benchmark design and contamination controls. | Eval run records. |
| Checkpoints | Checkpoint governance exists as policy. | No trained checkpoint. | Checkpoint registry after training. |
| Model card | Template exists. | No real model card because no trained model exists. | Model card only after evidence. |
| Safety | Permission/redaction tests exist. | Need model behavior safety evals after training. | Safety eval report. |
| Release governance | Policy direction exists. | Need promotion gates tied to real artifacts. | Release decision record. |

## Product vs Model Boundary

SEIS currently has a growing AI-native application layer:

- Command Center AI Core projection
- local-only route contracts
- prompt regression fixtures
- agent runtime lifecycle fixtures
- retrieval and repository assistant fixtures
- tool permission fixtures
- MCP smoke coverage

These are product and application-layer assets. They do not prove a trained
SEIS-owned model.

## Highest-Risk Gaps

1. **Data provenance**: Training without source/license/consent records would
   break clean-room and security expectations.
2. **Benchmark integrity**: Reported scores without held-out datasets and
   contamination control would be misleading.
3. **Checkpoint governance**: Publishing weights without model cards and safety
   review would create unsupported ownership and safety claims.
4. **Compute ambiguity**: Training plans without hardware/budget evidence would
   be non-reproducible.
5. **Provider confusion**: External model output must never be relabeled as a
   SEIS-owned model.

## Recommended Next Slices

1. Add dataset manifest schema and empty approved-source registry.
2. Add tokenizer research ADR template.
3. Add CPU-only nano-model experiment design without running training.
4. Add eval run record schema for future benchmarks.
5. Add Command Center read-only cards for model research gate status.
