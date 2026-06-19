# SEIS Universe Eval Critic Model Card

## Model Identity

- Model id: `seis-eval-critic-seed-v0`
- Model family: `seis-eval-critic`
- Version: `0.1.0`
- Maintainer: SEIS Universe Model Lab
- Release status: local research experiment
- License: follows repository license

## Intended Use

- Primary use: classify SEIS work summaries, model artifacts, and release claims as `pass`, `revise`, or `block`
- Supported users: SEIS maintainers and God Mode governance loops
- Supported workflows: evidence review, validation honesty checks, secret-safety screening, release-readiness preflight
- Explicit non-goals: production approval authority, private-user behavior scoring, external moderation, legal compliance decisions
- Out-of-scope uses: autonomous deployment approval, hidden user profiling, broad private transcript evaluation

## Training Summary

- Base architecture hypothesis: a small SEIS-owned review classifier plus deterministic safety floor can catch unsupported release claims and unsafe raw outputs before handoff
- Training framework: deterministic Node.js local classifier experiment
- Hardware: local Node.js runtime
- Training data cards: `SEIS_UNIVERSE_EVAL_CRITIC_DATASET_CARD.md`
- Fine-tuning method: small supervised label set with token and flag features
- Retrieval components: none
- Tool-use components: local evaluator and model artifact replay
- Safety components: hard floor for raw credential-like output, failed redaction, unsupported release claims, and high-risk actions without human approval

## Evaluation Summary

- Evaluation suite: `packages/seis-ai/test/eval-critic-lab.test.mjs`
- Task success: exact label match for seed eval cases
- Permission accuracy: not an authorization model; it reviews evidence quality and risk posture
- Secret safety: blocks raw-output fields that contain credential-like material
- Factuality: constrained to supplied evidence and validation metadata
- Code correctness: deterministic artifact replay and test assertions
- Design quality: not applicable in this seed
- Latency: local synchronous scoring
- Memory use: low
- Energy or cost notes: no provider calls

## Limitations

- Small synthetic corpus
- English-only labels and examples
- No semantic reasoning or long-context proof verification
- Cannot replace human review for high-risk model, data, deploy, or release decisions
- Requires structured review metadata for best results

## Deployment

- Deployment target: local SEIS agent and command-line governance checks
- Local/private mode: default
- Cloud mode: not supported
- Data leaving device: none
- Rollback path: remove dataset/model files, artifact script, and package scripts
- Monitoring: eval label accuracy, stale artifact check, and safety-floor adjustment count

## Provenance

- Official documentation basis: Node.js standard library and runtime primitives
- Scientific paper basis: not required for seed baseline
- SEIS architecture decisions: `SEIS_UNIVERSE_CLEAN_BUILD.md`
- Dataset cards: `SEIS_UNIVERSE_EVAL_CRITIC_DATASET_CARD.md`
- Eval artifacts: `npm run check:seis-universe-eval-critic-model`

## Approval

- Security review: synthetic examples only, no real secret values
- Data review: SEIS-owned examples only
- Product review: supports God Mode validation honesty and release-readiness review
- Engineering review: model lab tests, artifact check, and clean-room signal scan
- Release decision: pilot-only
