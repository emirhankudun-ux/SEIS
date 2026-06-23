# Model Development Roadmap

Status: Future roadmap

This roadmap defines the responsible sequence for moving from AI application
behavior toward SEIS-owned model research.

## Phases

| Phase | Goal | Promotion evidence |
| --- | --- | --- |
| 0 | Baseline audit | Existing AI modules, datasets, tests, hardware, security, and claims reviewed. |
| 1 | Constitution | Purpose, non-goals, safety, languages, modalities, and success criteria defined. |
| 2 | Architecture research | Candidate model families compared with evidence and cost. |
| 3 | Data and tokenizer | Dataset governance and tokenizer plan created. |
| 4 | Nano model | Tiny original model trains, overfits tiny data, saves and restores checkpoints. |
| 5 | Scale experiments | Larger experiments only after nano evidence passes. |

## Gates

- No training without approved data and compute plan.
- No benchmark claim without recorded benchmark run.
- No checkpoint publication without model card and release decision.
- No private or restricted data use.

## Near-Term Work

The near-term work is documentation, contracts, fixtures, and evaluation
strategy. Full model training is out of scope for this foundation pass.

## Phase 0/1 Documents

- `docs/ai/SEIS_MODEL_BASELINE.md`
- `docs/ai/COMPUTE_CAPACITY.md`
- `docs/ai/MODEL_GAP_ANALYSIS.md`
- `docs/ai/SEIS_MODEL_CONSTITUTION.md`
- `docs/ai/SEIS_MODEL_SPECIFICATION.md`
- `docs/ai/SEIS_MODEL_ROADMAP.md`
