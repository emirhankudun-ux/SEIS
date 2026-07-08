# SEIS AI Model Ecosystem Catalog

This catalog is the safe answer to the request to install every language model
and train SEIS into a fully knowledgeable AI. SEIS tracks the model ecosystem,
but it does not bulk-install models, download checkpoints, run inference, call
providers, train, fine-tune, benchmark, push, merge, or claim AGI from this
catalog.

Status: catalog-ready-no-install-no-training

## Summary

| Field | Value |
| --- | --- |
| Candidate family lanes | 12 |
| Installs authorized | 0 |
| Downloads authorized | 0 |
| Training authorized | 0 |
| Route-eligible families today | 0 |
| Real AGI claim allowed | false |

## Candidate Families

- `llama` - Meta Llama: 1B-8B local, 70B research, 405B frontier; license-review-required; local/provider candidate.
- `qwen` - Qwen: 0.6B-32B dense, 30B/235B MoE, coder, VL, image, safety; license-review-required-per-checkpoint; local/provider candidate.
- `gemma` - Google Gemma: Gemma 4, EmbeddingGemma, ShieldGemma, PaliGemma; license-review-required; local/edge candidate.
- `mistral` - Mistral: Ministral, Devstral, Mistral Small, Mistral Large; license-review-required-per-model; local/provider candidate.
- `deepseek` - DeepSeek: R1 distilled, R1 671B MoE, V3/R1 research; license-review-required-per-checkpoint; reasoning research candidate.
- `phi` - Microsoft Phi: small local, reasoning, vision; license-review-required; small local candidate.
- `openai-gpt-oss` - OpenAI gpt-oss: 20B, 120B; license-and-model-card-review-required; open-weight candidate.
- `embedding-reranker` - Embeddings and rerankers: Nomic, mixedbread, EmbeddingGemma, Sentence Transformers; license-review-required; retrieval-first candidate.
- `code-specialist` - Code-specialist models: Qwen Coder, CodeLlama, Devstral, Codestral-style; license-review-required-per-checkpoint; code assistant candidate.
- `multimodal-safety` - Multimodal and safety models: Gemma variants, Shield models, OCR/VL/audio; license-and-safety-review-required; safety/support candidate.
- `provider-routed` - External provider models: OpenAI, Anthropic, Gemini, Qwen API, Mistral API; backend-secret-review-required; server-only provider candidate.
- `seis-512b-apex` - Future SEIS 512B AGI research target: 512B, highest-future; research-gate-only; not routeable.

## Approval Stages

- family discovery
- exact model id and revision selection
- license and acceptable-use review
- checkpoint checksum and provenance
- hardware and cost estimate
- dataset card and clean-room provenance for training
- model card or adapter card
- benchmark plan and stop condition
- security review and no-secret logging
- human approval before install, inference, fine-tune, push, merge, or release

## Public Claim Boundary

- canClaimCatalogExists: true
- canClaimAllModelsInstalled: false
- canClaimTrainingExecuted: false
- canClaimAnyCheckpointDownloaded: false
- canClaimProviderAccessVerified: false
- canClaim20bRuntimeReady: false
- canClaim512bRouteEligible: false
- canClaimSEISOwnedFoundationModel: false
- canClaimRealAgi: false
