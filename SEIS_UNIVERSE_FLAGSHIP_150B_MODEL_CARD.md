# SEIS Universe Flagship 150B Model Card

Status: **TARGET SPECIFICATION ONLY — not a trained model.**
This card describes a long-horizon research target for a SEIS-owned flagship
reasoning model. No weights exist, no training has started, and nothing in this
repository ships a 150B-parameter model. It is a planning artifact under the
SEIS Universe Model Family program, intended to make the goal explicit and
measurable, not to claim a capability SEIS already has.

## Model Identity

- Model id: `seis-flagship-150b`
- Model family: `seis-flagship-150b` (SEIS Universe Model Family)
- Version: `0.0.0-spec` (specification, pre-training)
- Maintainer: Emirhan Kudun · emirhankudun@gmail.com
- Release status: **target spec / not trained**
- Release date: — (none; aspirational)
- License: SEIS-owned (to be decided at first real release)

## Intended Use

- Primary use: SEIS-aligned long-horizon reasoning — architecture, code review,
  repo governance, and multi-tool planning across the SEIS workspace.
- Supported users: SEIS maintainers and SEIS automation surfaces.
- Supported workflows: the four SEIS AI surfaces (MCP tools, polyglot audits,
  one-command audit gates, composed agent lanes).
- Explicit non-goals: imitating, distilling, or reproducing any closed third-party
  model; matching any external model's behavior or API.
- Out-of-scope uses: anything requiring a trained model today — until weights
  exist, the working backbone remains hosted Claude models via `seis-orchestrator`.

## Training Summary

- Base architecture hypothesis: dense/MoE decoder-only transformer, ~150B-parameter
  target scale (final scale TBD by compute and eval evidence, not by headline count).
- Training framework: to be selected from official, documented OSS frameworks.
- Hardware: large multi-GPU/TPU cluster — **not available in this repository or
  environment**; this is the primary reason the model is a spec, not an artifact.
- Training data cards: to be authored as SEIS-owned, clearly licensed dataset cards
  (see `SEIS_UNIVERSE_DATASET_CARD_TEMPLATE.md`). No closed-model outputs.
- Fine-tuning method: SEIS-owned supervised + preference data; clean-room only.
- Retrieval components: `seis-memory-ranker` for evidence/doc retrieval.
- Tool-use components: SEIS MCP tools + polyglot audit lanes.
- Safety components: `seis-permission-policy` for action gating; `seis-eval-critic`
  for output critique.

## Evaluation Summary

Targets (to be measured once a model exists; no results yet):

- Evaluation suite: SEIS Universe eval plan (`SEIS_UNIVERSE_EVAL_PLAN.md`).
- Baselines: hosted Claude backbones (`opus`/`sonnet`/`haiku`) used **as evaluation
  baselines only**, never as training teachers.
- Task success / code correctness / permission accuracy / secret safety / factuality
  / design quality / latency / cost: all TBD — no numbers may be reported until real.

## Limitations

- Known failure modes: none measured — the model does not exist.
- Unsupported languages/platforms: all, currently.
- Security limitations: not applicable until a real artifact and threat model exist.
- Required human review: full — every claim here is aspirational and must not be
  presented as a shipped capability.

## Deployment

- Deployment target: SEIS cloud/SSH runtime (long-horizon).
- Local/private mode: aspirational.
- Cloud mode: aspirational.
- Data leaving device: governed by SEIS cloud/security boundaries when real.
- Rollback path: until trained, the live fallback is `seis-orchestrator` over hosted
  Claude backbones.
- Monitoring: TBD.

## Provenance

- Official documentation basis: framework/hardware docs to be cited at build time.
- Scientific paper basis: public, peer-reviewed scaling/architecture literature.
- SEIS architecture decisions: SEIS Universe Model Family + clean-room rule.
- Licensed open-source tools: to be selected and recorded.
- Dataset cards: to be authored (none exist yet).
- Eval artifacts: none yet.

## Approval

- Security review: pending (spec stage).
- Data review: pending (no datasets yet).
- Product review: target acknowledged.
- Engineering review: feasibility-gated on cluster-scale compute (not in scope here).
- Release decision: **not approved for training** — remains a documented target.
