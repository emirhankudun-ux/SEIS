# SEIS Language Model Training Curriculum

Generated: 2026-06-29T06:09:40.048Z

## Hedef ve Kısıt

Bu curriculum, tüm aday dil modeli aileleri için güvenli yol haritası üretir.
Gerçek yükleme, eğitim veya dış provider çağrısı yapılmaz.

## Dil Ailesi Adayları

| Family ID | Display Name | Allowed Today | Training Use | Install State |
| --- | --- | --- | --- | --- |
| code-specialist | Code specialist model families | metadata-only | not-authorized | not-installed-by-registry |
| deepseek | DeepSeek family | metadata-only | not-authorized | not-installed-by-registry |
| embedding-and-reranker | Embedding and reranker families | metadata-only | not-authorized | not-installed-by-registry |
| gemma | Google Gemma family | metadata-only | not-authorized | not-installed-by-registry |
| llama | Meta Llama family | metadata-only | not-authorized | not-installed-by-registry |
| mistral | Mistral family | metadata-only | not-authorized | not-installed-by-registry |
| openai-open-weight | OpenAI open-weight candidates | metadata-only | not-authorized | not-installed-by-registry |
| qwen | Qwen family | metadata-only | not-authorized | not-installed-by-registry |

## Eğitim Yol Şeritleri

| Lane ID | Status | Allowed Today | Foundation Training |
| --- | --- | --- | --- |
| repo-local-seed-models | active | true | false |
| retrieval-knowledge-layer | planned | false | false |
| lora-or-adapter-experiment | approval-required | false | false |
| full-fine-tune | disabled | false | false |
| foundation-pretraining | disabled | false | true |

## Ölçek Hedefleri

- 20B: planned-not-validated
- 70B: research-roadmap
- 150B: not-scoped
- 512B: not-scoped

## Eğitim Aşamaları

- 1. **metadata-intake** — Evaluate candidate families without download, install, or live provider routing.
- 2. **fleet-readiness-contracts** — Keep runway safe: model cards, dataset cards, benchmark contracts, approval gates.
- 3. **local-seed-rebuild** — Rebuild deterministic local seed artifacts for policy, memory ranker, eval critic, and routing.
- 4. **human-reviewed-readiness** — Produce measurable approvals before any model training or benchmark execution.

## Güvenli Yol Haritası

- Model class and lane must pass explicit human approval before any install step.
- License and checksum review must be complete before any checkpoint handling.
- Dataset card and model card completion needed before any retrieval/adapter proposal.
- Observed benchmark evidence needed before any route eligibility changes.
