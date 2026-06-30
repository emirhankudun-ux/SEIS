# SEIS Knowledge Retrieval Training

SEIS'in "tam bilgili" hedefi tek bir modelin her seyi ezberlemesi olarak
tanımlanmaz. Guvenli hedef; kaynak-provenansli retrieval, olculebilir kalite,
redaksiyon, yerel fallback ve claim kapilaridir.

## Current Status

- Contract status: contract-defined-not-indexed
- Retrieval source provenance manifest accepted: true
- Retrieval index built: false
- Embedding model installed: false
- Provider embedding calls: false
- Fully knowledgeable AI claim: false
- AGI claim: false

## Source Classes

| Source class | Status | Allowed today |
| --- | --- | --- |
| repo-public-docs | candidate-allowlisted | metadata inventory only |
| repo-governance-json | candidate-allowlisted | metadata inventory only |
| repo-reports | candidate-allowlisted | metadata inventory only |
| official-public-ai-sources | metadata-only | citation and metadata only |
| private-user-data | blocked | blocked |

## Internet Research Baseline

- [huggingface-transformers](https://huggingface.co/docs/transformers/index) - Framework boundary for model training/inference planning; checkpoint provenance remains separate.
- [ollama-library](https://ollama.com/library) - Local model family discovery; catalog presence does not grant SEIS install permission.
- [meta-llama-3-1-405b](https://ai.meta.com/blog/meta-llama-3-1/) - Frontier-scale parameter baseline showing why 405B/512B must remain research-scale.
- [deepseek-v3](https://github.com/deepseek-ai/DeepSeek-V3) - MoE scale reference; total and active parameters must be tracked separately.
- [nist-ai-rmf](https://www.nist.gov/itl/ai-risk-management-framework) - Risk management baseline for public AI readiness and governance.

## Required Before Retrieval Index Build

- path allowlist for source files
- source provenance manifest accepted
- secret and credential scan
- private data exclusion policy
- chunk schema and source URI policy
- provenance manifest with source type and license notes
- staleness detection for generated reports
- local-only fallback behavior
- redacted logs
- human approval

## Required Before Fully Knowledgeable Claim

- retrieval index built from approved sources
- retrieval precision and recall evaluation
- citation faithfulness evaluation
- hallucination regression suite
- security redaction test
- fresh clone validation
- public documentation explaining real/mock/planned states
- independent review

## Commands

```bash
npm run report:seis-knowledge-retrieval-training
npm run check:seis-retrieval-source-provenance
npm run check:seis-knowledge-retrieval-training
```

## Report

Reviewer report:
`reports/seis-model-scaling/seis-knowledge-retrieval-training-contract.md`
