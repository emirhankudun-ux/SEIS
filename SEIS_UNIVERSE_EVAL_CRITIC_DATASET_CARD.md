# SEIS Universe Eval Critic Dataset Card

## Dataset Identity

- Dataset id: `seis-eval-critic-seed-v0`
- Dataset name: SEIS Eval Critic Seed Reviews
- Owner: SEIS
- Maintainer: SEIS Universe Model Lab
- Version: `0.1.0`
- Date created: 2026-06-19
- Intended SEIS model family: `seis-eval-critic`

## Source And Rights

- Source class: SEIS-owned synthetic examples
- Source location: `packages/seis-ai/data/eval-critic-seed-v0.json`
- License: follows repository license
- Consent status: no user-private data
- Allowed uses: local evaluator experiments, deterministic quality review, release-readiness baseline building
- Blocked uses: private transcript scoring without explicit authorization, production release approval, hidden moderation
- Removal path: replace dataset fixture and regenerate `packages/seis-ai/models/eval-critic-seed-v0.json`

## Contents

- Data type: labeled review examples for SEIS outputs, evidence, validation, security, and release claims
- Approximate size: eight train and five eval review cases
- Languages: English
- Modalities: text only
- Time range: 2026-06-19
- Sensitive data classes: none
- Known exclusions: no credentials, no personal user files, no restricted reference material

## Processing

- Collection method: first-principles SEIS governance and model-evaluation design
- Filtering method: synthetic payload review and unique case identifiers
- Deduplication method: unique case ids
- PII review: no personal data in examples
- Secret scan: no real secret values; unsafe cases use generic credential markers only
- Quality rubric: expected labels must distinguish `pass`, `revise`, and `block`
- Train split: labeled examples marked `train`
- Validation split: not introduced in this seed
- Test split: labeled examples marked `eval`

## Risk Review

- Privacy risks: low because examples are synthetic
- Security risks: low because unsafe cases contain only generic markers
- Bias or coverage risks: medium due small seed corpus
- License risks: low
- Contamination risks: low; no restricted references or private source material
- Mitigations: broaden cases before any production use and keep release approval human-owned

## Evaluation Link

- Related evals:
  - `packages/seis-ai/test/eval-critic-lab.test.mjs`
  - `npm run check:seis-universe-eval-critic-model`
- Baseline model: local lexical classifier with deterministic safety floor
- Learned model: `seis-eval-critic-seed-v0`
- Acceptance gates: eval label match, stale artifact check, clean-room signal scan
- Reviewer: SEIS maintainer
- Approval status: active local experiment evidence collected
