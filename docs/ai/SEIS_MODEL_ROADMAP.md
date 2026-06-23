# SEIS Model Roadmap

Status: Phase 1 roadmap draft

This roadmap defines the responsible path from current AI Core contracts to
future SEIS-owned model research. It does not authorize immediate training or
claim that training has happened.

## Phase 0: Baseline and Capacity

Deliverables:

- `docs/ai/SEIS_MODEL_BASELINE.md`
- `docs/ai/COMPUTE_CAPACITY.md`
- `docs/ai/MODEL_GAP_ANALYSIS.md`

Exit criteria:

- existing AI modules and seed artifacts are inventoried
- current non-claims are explicit
- compute capacity is not overstated
- gaps are prioritized

## Phase 1: Constitution and Specification

Deliverables:

- `docs/ai/SEIS_MODEL_CONSTITUTION.md`
- `docs/ai/SEIS_MODEL_SPECIFICATION.md`
- `docs/ai/SEIS_MODEL_ROADMAP.md`

Exit criteria:

- purpose, non-goals, safety rules, target domains, and model tiers are defined
- model ownership evidence requirements are written
- release gates are documented

## Phase 2: Architecture Research

Deliverables:

- ADRs under `docs/adr/ai/`
- architecture comparison matrix
- nano-model design proposal

Exit criteria:

- candidate architectures are compared with compute and data requirements
- first nano-model architecture is selected
- no scaled training is started

## Phase 3: Data and Tokenizer

Deliverables:

- dataset manifest schema
- approved-source registry
- tokenizer research report
- contamination-control plan

Exit criteria:

- every source has license and provenance status
- train/validation/test split policy exists
- sensitive-data filtering is defined
- tokenizer experiment plan is approved

## Phase 4: Original Nano Model

Deliverables:

- minimal model definition
- training script
- tiny dataset manifest
- checkpoint save/resume test
- loss-decrease report
- tiny overfit test
- generation sample with warnings

Exit criteria:

- loss decreases
- checkpoint recovery works
- output changes during training
- eval runs
- numerical and shape tests pass
- no production or safety claims are made

## Phase 5: Evidence-Gated Scale

Deliverables:

- scalable training plan
- model registry
- inference runtime plan
- safety benchmark suite
- release governance report

Exit criteria:

- nano evidence passes
- data and compute approvals exist
- benchmark integrity is proven
- model card is complete for any released checkpoint

## Current Next Step

The next implementation slice should add data provenance schemas and model
research gate cards to Command Center while keeping all training, provider,
SSH, and infrastructure actions disabled until approved.
