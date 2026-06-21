# SEIS Universe Memory Ranker Dataset Card

## Dataset Identity

- Dataset id: `seis-memory-ranker-seed-v0`
- Dataset name: SEIS Memory Ranker Seed Retrieval
- Owner: SEIS
- Maintainer: SEIS Universe Model Lab
- Version: `0.1.0`
- Date created: 2026-06-18
- Intended SEIS model family: `seis-memory-ranker`

## Source And Rights

- Source class: SEIS-owned synthetic examples
- Source location: `packages/seis-ai/data/memory-ranker-seed-v0.json`
- License: follows repository license
- Consent status: no user-private data
- Allowed uses: local retrieval experiments, deterministic evaluation, ranking baseline building
- Blocked uses: private user memory ingestion without explicit authorization
- Removal path: replace dataset fixture and regenerate `packages/seis-ai/models/memory-ranker-seed-v0.json`

## Contents

- Data type: ranked retrieval examples for repository governance and model-operating context
- Approximate size: four train and four eval retrieval cases
- Languages: English
- Modalities: text only
- Time range: 2026-06-18
- Sensitive data classes: none
- Known exclusions: no user-authored secrets, no private personal notes

## Processing

- Collection method: first-principles governance routing design
- Filtering method: deterministic token schema and duplicate case filtering
- Deduplication method: unique case identifiers and unique candidate ids per query
- PII review: no personal data in examples
- Secret scan: synthetic payload only
- Quality rubric: expected top-1 retrieval must match expected governance target
- Train split: labeled retrieval cases marked `train`
- Validation split: not yet introduced in this slice
- Test split: labeled retrieval cases marked `eval`

## Risk Review

- Privacy risks: low due synthetic text and no private repository content
- Security risks: low; no executable material
- Bias or coverage risks: medium due small synthetic slice
- License risks: low
- Contamination risks: low; no restricted references
- Mitigations: broaden retrieval scenarios before production use

## Evaluation Link

- Related evals:
  - `packages/seis-ai/test/memory-ranker-lab.test.mjs`
  - `npm run check:seis-universe-memory-ranker-model`
- Baseline model: deterministic lexical baseline in lab runtime
- Learned model: `seis-memory-ranker-seed-v0`
- Acceptance gates: eval top-1 accuracy and stale artifact check
- Reviewer: SEIS maintainer
- Approval status: active experiment evidence collected
