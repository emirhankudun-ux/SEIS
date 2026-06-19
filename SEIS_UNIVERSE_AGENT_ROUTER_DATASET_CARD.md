# SEIS Universe Agent Router Dataset Card

## Dataset Identity

- Dataset id: `seis-agent-router-seed-v0`
- Dataset name: SEIS Agent Router Seed Intents
- Owner: SEIS
- Maintainer: SEIS Universe Model Lab
- Version: `0.1.0`
- Date created: 2026-06-19
- Intended SEIS model family: `seis-agent-router`

## Source And Rights

- Source class: SEIS-owned synthetic examples
- Source location: `packages/seis-ai/data/agent-router-seed-v0.json`
- License: follows repository license
- Consent status: no user-private data
- Allowed uses: local agent/plugin routing experiments, deterministic evaluation, lane selection baselines
- Blocked uses: external connector activation, user-private workflow routing, or production authorization without explicit approval
- Removal path: replace dataset fixture and regenerate `packages/seis-ai/models/agent-router-seed-v0.json`

## Contents

- Data type: labeled SEIS task intents mapped to agent/plugin lanes
- Approximate size: eight train and six eval routing cases
- Languages: English
- Modalities: text only
- Time range: 2026-06-19
- Sensitive data classes: none
- Known exclusions: no credentials, no private user files, no external implementation examples

## Processing

- Collection method: first-principles SEIS lane-routing design
- Filtering method: duplicate case id validation and allowed-lane validation
- Deduplication method: unique case identifiers
- PII review: no personal data in examples
- Secret scan: synthetic payload only
- Quality rubric: predicted lane must match expected lane for all eval cases
- Train split: labeled routing cases marked `train`
- Validation split: not yet introduced in this slice
- Test split: labeled routing cases marked `eval`

## Risk Review

- Privacy risks: low due synthetic, non-user-private data
- Security risks: medium because routing can influence tool/lane choice
- Bias or coverage risks: medium due small seed taxonomy
- License risks: low
- Contamination risks: low; no restricted references
- Mitigations: deterministic safety floor routes cloud/security/release-sensitive work to higher-control lanes

## Evaluation Link

- Related evals:
  - `packages/seis-ai/test/agent-router-lab.test.mjs`
  - `npm run check:seis-universe-agent-router-model`
- Baseline model: deterministic lexical routing baseline in lab runtime
- Learned model: `seis-agent-router-seed-v0`
- Acceptance gates: eval lane accuracy and stale artifact check
- Reviewer: SEIS maintainer
- Approval status: active experiment evidence collected
