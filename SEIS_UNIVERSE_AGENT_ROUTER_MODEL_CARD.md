# SEIS Universe Agent Router Model Card

## Model Identity

- Model id: `seis-agent-router-seed-v0`
- Model family: `seis-agent-router`
- Version: `0.1.0`
- Maintainer: SEIS Universe Model Lab
- Release status: local research experiment
- License: follows repository license

## Intended Use

- Primary use: route SEIS task intents to the correct embedded agent/plugin lane
- Supported users: SEIS maintainers and SEIS-Agent runtime loops
- Supported workflows: lane selection, tool routing, plugin integration checks, governance-first task handoff
- Explicit non-goals: production authorization, connector authentication, external mutation approval
- Out-of-scope uses: user-private task routing, cross-repo plugin activation, or autonomous deployment selection

## Training Summary

- Base architecture hypothesis: small supervised intent labels plus deterministic safety-floor routing can improve SEIS lane selection without external provider calls
- Training framework: deterministic Node.js local routing experiment
- Hardware: local Node.js runtime
- Training data cards: `SEIS_UNIVERSE_AGENT_ROUTER_DATASET_CARD.md`
- Fine-tuning method: small supervised lane labels over SEIS-owned synthetic intents
- Retrieval components: none in this slice
- Tool-use components: routes through `seis_plugin_integration`
- Safety components: safety floor prioritizes cloud, security, governance, automation, research, product, design, data, code, then hub routing

## Evaluation Summary

- Evaluation suite: `packages/seis-ai/test/agent-router-lab.test.mjs`
- Task success: expected lane match for seed eval cases
- Permission accuracy: not applicable; permission decisions remain under `seis-permission-policy`
- Secret safety: no secret-like fields included in model data
- Factuality: constrained by SEIS-owned lane manifest and synthetic task intents
- Code correctness: deterministic artifact replay and test assertions
- Design quality: separates UI/design work from code/cloud/data/governance lanes
- Latency: local synchronous scoring
- Memory use: low
- Energy or cost notes: no provider calls

## Limitations

- Small seed corpus with limited intent diversity
- English-only
- Does not authenticate or activate external plugins
- Does not replace human review for high-risk tool execution
- Lane taxonomy is fixed to the current SEIS plugin integration manifest, including embedded security, research, automation, and product lanes

## Deployment

- Deployment target: local SEIS-Agent routing and command-line tooling
- Local/private mode: default
- Cloud mode: not supported
- Data leaving device: none
- Rollback path: remove dataset/model files and artifact script
- Monitoring: eval lane accuracy and stale artifact check

## Provenance

- Official documentation basis: Node.js standard library and runtime primitives
- Scientific paper basis: not required for seed baseline
- SEIS architecture decisions: `SEIS_UNIVERSE_CLEAN_BUILD.md`
- Dataset cards: `SEIS_UNIVERSE_AGENT_ROUTER_DATASET_CARD.md`
- Eval artifacts: `npm run check:seis-universe-agent-router-model`

## Approval

- Security review: synthetic-only corpus, no secret fields
- Data review: SEIS-owned synthetic examples only
- Product review: plugin/lane routing aligned with `seis-agent-plugin-integration`
- Engineering review: model lab tests, artifact check, and schema review
- Release decision: pilot-only
