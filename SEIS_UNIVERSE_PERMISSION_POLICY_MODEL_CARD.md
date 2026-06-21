# SEIS Universe Permission Policy Model Card

Status: deterministic and learned local seed model v0

## Model Identity

- Model id: `seis-permission-policy-seed-v0`
- Learned artifact id: `seis-permission-policy-learned-seed-v0`
- Model family: `seis-permission-policy`
- Version: `0.2.0`
- Maintainer: SEIS Universe Model Lab
- Release status: local governance seed
- License: follows repository license

## Intended Use

- Primary use: classify SEIS agent actions into permission decisions
- Supported users: SEIS maintainers and local SEIS agent workflows
- Supported workflows: read/write/shell/network/git/data/model/deploy safety
  routing
- Explicit non-goals: not a trained foundation model, not a replacement for
  human approval, not a cloud policy engine
- Out-of-scope uses: production authorization without additional review

## Training Summary

- Base architecture hypothesis: explicit capability labels improve safe tool use
- Training framework: SEIS local bag-of-features learning lab
- Hardware: local Node.js runtime
- Training data cards: `SEIS_UNIVERSE_PERMISSION_POLICY_DATASET_CARD.md`
- Fine-tuning method: none
- Retrieval components: none
- Tool-use components: deterministic action classification and local learned
  action classifier
- Safety components: secret-like pattern denial, destructive action gating, and
  deterministic safety floor for learned predictions

## Evaluation Summary

- Evaluation suite: `packages/seis-ai/test/permission-policy.test.mjs`,
  `packages/seis-ai/test/permission-policy-lab.test.mjs`
- Task success: all seed eval cases must pass
- Permission accuracy: read-only, write, shell, deploy, force-push, and secret
  cases covered
- Secret safety: secret capability and secret-like text deny by default
- Factuality: not applicable
- Code correctness: covered by Node.js tests and stale artifact check
- Latency: local synchronous classification
- Memory use: negligible
- Energy or cost notes: no network or model-provider calls

## Limitations

- Small seed eval set
- English-only examples
- Learned seed is a small local experiment, not foundation-model behavior
- No probabilistic confidence score
- No domain-specific dataset beyond SEIS permission labels
- Human review remains required for high-risk actions

## Deployment

- Deployment target: local SEIS agent and governance checks
- Local/private mode: default
- Cloud mode: not supported
- Data leaving device: none
- Rollback path: remove seed model script, tests, and package gate
- Monitoring: deterministic check results, model-lab eval results, and stale
  artifact gate

## Provenance

- Official documentation basis: Node.js standard test runner and ESM runtime
- Scientific paper basis: not required for seed rules
- SEIS architecture decisions: `SEIS_UNIVERSE_CLEAN_BUILD.md`
- Dataset cards: `SEIS_UNIVERSE_PERMISSION_POLICY_DATASET_CARD.md`
- Eval artifacts: `npm run check:seis-universe-seed-model`,
  `npm run check:seis-universe-model-lab`

## Approval

- Security review: local targeted secret scan
- Data review: synthetic SEIS-owned examples only
- Product review: God Mode AI seed model
- Engineering review: deterministic tests, learning-lab tests, and artifact gate
- Release decision: seed gate only; not a trained model release
