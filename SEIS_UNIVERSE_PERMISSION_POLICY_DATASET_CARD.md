# SEIS Universe Permission Policy Dataset Card

Status: seed train and eval dataset v0

## Dataset Identity

- Dataset id: `seis-permission-policy-seed-eval`
- Dataset name: SEIS Permission Policy Seed Eval
- Owner: SEIS
- Maintainer: SEIS Universe Model Lab
- Version: `0.2.0`
- Intended SEIS model family: `seis-permission-policy`

## Source And Rights

- Source class: SEIS-owned synthetic examples
- Source location: `packages/seis-ai/data/permission-policy-seed.json`
- License: follows repository license
- Consent status: no user-private data
- Allowed uses: local evaluation, local seed training, policy regression testing,
  model-card evidence
- Blocked uses: training on private user data, external publication as benchmark
  without review
- Removal path: remove or replace examples in the dataset fixture, regenerate
  the model artifact, and rerun the model-lab gate

## Contents

- Data type: small labeled action-classification examples
- Approximate size: twelve seed train cases and eight seed eval cases
- Languages: English labels and intents
- Modalities: text only
- Sensitive data classes: none by design
- Known exclusions: no real secrets, no private file paths, no user data

## Processing

- Collection method: first-principles SEIS permission policy design
- Filtering method: clean-room and secret-pattern review
- Deduplication method: manually unique eval ids
- PII review: no personal data included
- Secret scan: targeted scan in validation
- Quality rubric: expected class must match policy decision
- Train split: labeled synthetic examples marked `train`
- Validation split: none yet
- Test split: labeled synthetic examples marked `eval`

## Risk Review

- Privacy risks: low; synthetic and SEIS-owned
- Security risks: low; no executable commands are run by the dataset
- Bias or coverage risks: medium-high until more policy scenarios are added
- License risks: low; repository-owned examples
- Contamination risks: low; no restricted references
- Mitigations: keep as local seed-only training until a larger dataset card is
  approved

## Evaluation Link

- Related evals: `npm run check:seis-universe-seed-model`,
  `npm run check:seis-universe-model-lab`
- Baseline model: deterministic SEIS permission policy seed model
- Learned model: `seis-permission-policy-learned-seed-v0`
- Acceptance gates: all seed cases pass, no secret/reference signals
- Reviewer: SEIS maintainer
- Approval status: active seed and model-lab gates
