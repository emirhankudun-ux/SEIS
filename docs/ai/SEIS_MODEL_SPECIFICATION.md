# SEIS Model Specification

Status: Phase 1 specification draft

This specification describes the target shape of future SEIS-owned model
research. It is not a claim that the model has been trained.

## Target Use Cases

- Turkish and English technical assistance
- repository-aware software engineering
- secure code review and dependency reasoning
- documentation synthesis and governance review
- UI/UX and design-system reasoning
- model-router and agent-runtime decision support
- long-context project understanding
- local/private drafting when provider routing is not allowed

## Initial Model Tiers

| Tier | Purpose | Constraint |
| --- | --- | --- |
| Nano | Prove tokenizer, training loop, loss decrease, checkpoint resume, and tiny eval. | CPU/local first; no production claims. |
| Small | Validate domain curriculum and local inference. | Only after nano gate passes. |
| Assistant | Research-grade project assistant. | Requires data provenance and safety evals. |
| Platform | Integrated SEIS ecosystem model. | Future only; requires release governance. |

## Capability Targets

| Capability | Measurement required before claim |
| --- | --- |
| Turkish/English reasoning | Held-out bilingual eval with tokenization metrics. |
| Code generation | Reproducible coding benchmark and repair tests. |
| Security review | Vulnerability and secret-safety eval set. |
| Repository reasoning | Multi-file task benchmark with provenance. |
| Design reasoning | Design-token and UI critique evals. |
| Tool use | Permission-aware tool-routing simulation. |
| Long context | Context-retention and retrieval-boundary evals. |

## Architecture Candidates

Future ADRs should compare:

- decoder-only transformer
- encoder-decoder architecture
- mixture-of-experts
- state-space or recurrent model
- hybrid attention
- retrieval-augmented architecture
- multimodal encoder/projector
- tool/memory interface layer

No architecture is selected until an ADR records the evidence and tradeoffs.

## Tokenizer Requirements

Tokenizer research must evaluate:

- Turkish morphology
- English technical text
- source code and indentation
- math notation
- design-system terms
- Unicode and byte fallback
- token fertility by language/domain
- compression and latency tradeoffs

## Runtime Requirements

- no browser-side secrets
- deterministic eval mode
- checkpoint resume
- structured run logs
- safe generation defaults
- redaction and secret-pattern tests
- explicit model/version id in outputs
- clear separation from external provider models

## Release Requirements

No model release can happen without:

- model card
- dataset card or manifest
- eval report
- safety report
- checkpoint governance record
- license decision
- release approval
