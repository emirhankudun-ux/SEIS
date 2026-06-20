# Dataset Intake Policy

Status: Future policy

Dataset intake controls what data may enter SEIS model research, evaluation, or
retrieval workflows.

## Required Fields

Each dataset candidate must record:

- dataset id
- source
- owner or license
- consent status
- language
- domain
- privacy class
- safety class
- transformation history
- deduplication status
- filtering status
- contamination checks
- inclusion reason
- exclusion risks

## Intake Rules

- Unknown license means blocked.
- Secret-bearing data means blocked.
- Private data requires explicit approval and legal/privacy review.
- Evaluation data must be separated from training data.
- Synthetic data must record generator, prompt policy, and review status.

## Storage Rule

Dataset manifests may be tracked. Raw sensitive datasets must not be committed.
