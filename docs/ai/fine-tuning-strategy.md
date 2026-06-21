# Fine-Tuning Strategy

Status: Future strategy

Fine-tuning, LoRA, and adapter experiments are future SEIS research activities.
They must be tracked separately from prompt engineering and retrieval.

## Experiment Requirements

Every experiment must define:

- base model and license
- dataset manifest and provenance
- training objective
- privacy class
- compute environment
- hyperparameters
- evaluation plan
- safety review
- output artifact path
- rollback or disposal plan

## Forbidden Inputs

- leaked or proprietary data
- secrets
- private keys
- personal data without approval
- unlicensed third-party code
- restricted reference material

## Output Rules

- Fine-tunes are not foundation models.
- LoRA/adapters are not SEIS-owned base models.
- Results must be labeled by base model, data, training method, and evaluation
  evidence.
- Failed experiments remain useful if documented honestly.
