# SEIS Universe Model Family

Status: God Mode AI model program v0

This document defines the first SEIS-owned artificial intelligence model family
program. It is a research and engineering control surface, not a claim that
SEIS already has a trained foundation model.

## Mission

SEIS Universe should develop original SEIS-owned model families that improve
software engineering, design systems, repository governance, model research,
memory, tool use, and human-AI collaboration.

The first objective is not maximum parameter count. The first objective is a
safe, measurable, SEIS-aligned intelligence stack that can be trained,
evaluated, improved, and deployed with provenance.

## Clean-Room Rule

The model family must be designed from:

1. SEIS-owned product direction.
2. SEIS-owned requirements and architecture decisions.
3. Original hypotheses.
4. Official framework and hardware documentation.
5. Peer-reviewed papers and public technical reports.
6. Clearly licensed data, tools, and reproducible experiments.

The model family must not use restricted reference code, private prompts,
undocumented behavior, private data, leaked material, or compatibility goals as
training or implementation sources.

## Family Map

| Model family             | Purpose                                                           | First release target                              | Training status     |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| `seis-reasoner`          | SEIS planning, architecture, code review, and repo governance     | small supervised adapter or local eval harness    | not started         |
| `seis-permission-policy` | classify safe, gated, denied, and approval-required actions       | deterministic labels plus policy model experiment | learned seed active |
| `seis-memory-ranker`     | rank SEIS memory, docs, decisions, and evidence for retrieval     | embedding/reranking experiment                    | learned seed active |
| `seis-eval-critic`       | evaluate answers, diffs, claims, and release readiness            | rubric-driven evaluator                           | learned seed active |
| `seis-design-sense`      | reason about UI, accessibility, motion, and design-system quality | multimodal research track                         | not started         |

These names are SEIS-owned research names. They do not imply compatibility with
any outside model, product, API, or private architecture.

## God Mode Requirements

Every model-family change must improve all five God Mode evidence layers:

- Product experience: user-visible purpose and expected workflow.
- Application/platform: a manifest, template, checker, or runtime contract.
- AI/AGI learning: a hypothesis, dataset card, model card, or eval result.
- Cloud/security: data, secret, permission, and deployment boundaries.
- Governance/quality: deterministic checks and documented acceptance gates.

## Data Policy

Allowed data classes:

- SEIS-owned public repository data.
- User-authorized private data with explicit scope.
- Public-domain datasets.
- Clearly licensed datasets.
- Synthetic datasets generated and reviewed by SEIS.

Blocked data classes:

- credentials, tokens, private keys, certificates, and environment files
- personal identity documents or private user files without explicit consent
- restricted reference archives or source folders
- unclear-license scraped material
- model outputs whose license or usage rights are unclear
- private chats or emails without explicit user authorization

Every dataset must have a dataset card before it can enter training or
evaluation.

## Training Strategy

Training should progress in stages:

1. Dataset and eval design.
2. Baseline with existing allowed models through official APIs or local runtimes.
3. Small supervised experiments on SEIS-owned labels.
4. Retrieval/ranking experiments for memory and governance evidence.
5. Preference or policy experiments only after safety labels exist.
6. On-device Apple-first inference experiments where practical.
7. Cloud training only after cost, security, provenance, and rollback gates pass.

No large training job should run until data cards, model cards, evals, compute
budget, and rollback policy exist.

## Evaluation Gates

Initial gates:

- `seis_task_success`: solves scoped SEIS tasks with evidence.
- `clean_room_compliance`: does not reference restricted implementation source.
- `permission_accuracy`: correctly classifies safe, gated, denied, and
  approval-required actions.
- `secret_safety`: refuses to expose or commit secrets.
- `provenance_quality`: claims cite official, SEIS-owned, or licensed sources.
- `patch_safety`: preserves unrelated user work.
- `design_quality`: catches accessibility, layout, and motion risks.
- `energy_cost_awareness`: reports latency, memory, cost, and device impact.

## Deployment Strategy

SEIS should prefer a layered deployment model:

- local deterministic checkers for governance and safety
- local or Apple-first model experiments for private workflows
- provider-hosted models only when the user approves data boundaries
- cloud training only with secrets outside git and documented cost limits
- release artifacts only after model cards, dataset cards, evals, and rollback
  plans exist

## First Build Slice

The first build slice is:

1. Keep this model-family manifest visible.
2. Add dataset-card and model-card templates.
3. Add an eval plan.
4. Add a deterministic checker.
5. Activate `seis-permission-policy` as the first deterministic seed model.
6. Add a local learning lab before any provider-hosted or large training run.
7. Keep large training disabled until governance gates pass.

This gives SEIS a real AI model program without pretending that model training
has already happened.

## Active Seed Model

The first active model-family seed is `seis-permission-policy`.

Seed eval status: seed eval active.

Evidence:

- Dataset card: `SEIS_UNIVERSE_PERMISSION_POLICY_DATASET_CARD.md`
- Model card: `SEIS_UNIVERSE_PERMISSION_POLICY_MODEL_CARD.md`
- Runtime: `packages/seis-ai/src/model/permission-policy.mjs`
- Eval: `packages/seis-ai/test/permission-policy.test.mjs`
- Gate: `npm run check:seis-universe-seed-model`

## Active Learning Slice

The first learned local model experiment is `seis-permission-policy-learned-seed-v0`.

Evidence:

- Dataset: `packages/seis-ai/data/permission-policy-seed.json`
- Learning runtime: `packages/seis-ai/src/model/permission-policy-lab.mjs`
- Artifact: `packages/seis-ai/models/permission-policy-seed-v0.json`
- Eval: `packages/seis-ai/test/permission-policy-lab.test.mjs`
- Generator: `npm run automation:seis-permission-policy-model`
- Gate: `npm run check:seis-universe-model-lab`

The first learned memory retrieval experiment is `seis-memory-ranker-seed-v0`.

Evidence:

- Dataset: `packages/seis-ai/data/memory-ranker-seed-v0.json`
- Learning runtime: `packages/seis-ai/src/model/memory-ranker-lab.mjs`
- Artifact: `packages/seis-ai/models/memory-ranker-seed-v0.json`
- Eval: `packages/seis-ai/test/memory-ranker-lab.test.mjs`
- Generator: `npm run automation:seis-memory-ranker-model`
- Gate: `npm run check:seis-universe-memory-ranker-model`

The first learned evaluation critic experiment is `seis-eval-critic-seed-v0`.

Evidence:

- Dataset card: `SEIS_UNIVERSE_EVAL_CRITIC_DATASET_CARD.md`
- Model card: `SEIS_UNIVERSE_EVAL_CRITIC_MODEL_CARD.md`
- Dataset: `packages/seis-ai/data/eval-critic-seed-v0.json`
- Learning runtime: `packages/seis-ai/src/model/eval-critic-lab.mjs`
- Artifact: `packages/seis-ai/models/eval-critic-seed-v0.json`
- Eval: `packages/seis-ai/test/eval-critic-lab.test.mjs`
- Generator: `npm run automation:seis-eval-critic-model`
- Gate: `npm run check:seis-universe-eval-critic-model`
