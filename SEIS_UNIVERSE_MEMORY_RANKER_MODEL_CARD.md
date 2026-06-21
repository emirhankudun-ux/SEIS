# SEIS Universe Memory Ranker Model Card

## Model Identity

- Model id: `seis-memory-ranker-seed-v0`
- Model family: `seis-memory-ranker`
- Version: `0.1.0`
- Maintainer: SEIS Universe Model Lab
- Release status: local research experiment
- License: follows repository license

## Intended Use

- Primary use: rank SEIS governance and evidence documents for assistant retrieval
- Supported users: SEIS maintainers and AI governance loops
- Supported workflows: evidence selection, decision support, retrieval pre-ranking
- Explicit non-goals: private user memory indexing, production ranking, security authorization
- Out-of-scope uses: global recommendation engines, cross-project private data ranking without consent

## Training Summary

- Base architecture hypothesis: token overlap plus local relevance weights from seed intent-case pairs improves retrieval in SEIS governance workflow
- Training framework: deterministic Node.js local ranking experiment
- Hardware: local Node.js runtime
- Training data cards: `SEIS_UNIVERSE_MEMORY_RANKER_DATASET_CARD.md`
- Fine-tuning method: small supervised ranking list with expected top-1 targets
- Retrieval components: lexical token profile and relevance-weight priors
- Tool-use components: local ranking function and model artifact for deterministic score replay
- Safety components: no external network and no private data ingestion

## Evaluation Summary

- Evaluation suite: `packages/seis-ai/test/memory-ranker-lab.test.mjs`
- Task success: retrieval top-1 match for seed eval cases
- Permission accuracy: not applicable (non-authorization model)
- Secret safety: no secret-like fields included in model data
- Factuality: constrained by synthetic SEIS governance corpus
- Code correctness: deterministic artifact replay and test assertions
- Design quality: evidence-first retrieval behavior for model governance docs
- Latency: local synchronous scoring
- Memory use: low
- Energy or cost notes: no provider calls

## Limitations

- Small seed corpus with limited retrieval diversity
- English-only
- Rank confidence not exposed
- No long-context reranking or semantic embedding in this slice
- Candidate set must be explicitly provided per query

## Deployment

- Deployment target: local SEIS agent and command-line tooling
- Local/private mode: default
- Cloud mode: not supported
- Data leaving device: none
- Rollback path: remove dataset/model files and artifact script
- Monitoring: top-1 eval trend and stale artifact check

## Provenance

- Official documentation basis: Node.js standard library and runtime primitives
- Scientific paper basis: not required for seed baseline
- SEIS architecture decisions: `SEIS_UNIVERSE_CLEAN_BUILD.md`
- Dataset cards: `SEIS_UNIVERSE_MEMORY_RANKER_DATASET_CARD.md`
- Eval artifacts: `npm run check:seis-universe-memory-ranker-model`

## Approval

- Security review: synthetic-only corpus, no secret fields
- Data review: SEIS-owned synthetic examples only
- Product review: retrieval evidence alignment with governance-first workflows
- Engineering review: model lab tests, artifact check, and schema review
- Release decision: pilot-only
