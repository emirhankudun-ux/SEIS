# Checkpoint Governance

Status: Future policy

Checkpoint governance controls future model artifacts, fine-tunes, adapters,
and experiment outputs.

## Rules

- Do not create fake checkpoints.
- Do not commit large model artifacts without release policy approval.
- Every checkpoint needs source code, config, data manifest, training log,
  evaluation record, and safety review.
- Private or restricted checkpoints must remain outside public git.
- Published checkpoints require a model card and release approval.

## Checkpoint Record

Each checkpoint should record:

- checkpoint id
- parent model or run id
- commit SHA
- data version
- config hash
- training run id
- evaluation status
- storage location
- access policy
- retention policy

## Promotion States

- experimental
- internal-review
- blocked
- approved-internal
- approved-public
- retired
