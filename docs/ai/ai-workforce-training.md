# SEIS AI Workforce Training

## Purpose

Define how the installed AI workforce can improve SEIS AI without turning the
project into an unsafe provider-key collector or an unsupported foundation-model
claim.

In this repository, installed AI workforce training means supervised feedback,
synthetic training-case proposals, deterministic local seed-model rebuilds, and
promotion-gate evidence. It is not cloud fine-tuning, external dataset scraping,
or production model training.

Machine-readable source:
`content/development/seis-ai-workforce-training-plan.json`.

Language Model Intake Registry:
`content/development/seis-language-model-intake-registry.json`.

Validation:

```bash
npm run check:seis-ai-workforce-training
npm run check:seis-language-model-intake
npm run report:seis-language-model-training-curriculum
npm run check:seis-language-model-training-curriculum
npm run automation:seis-ai-workforce-training
```

### Tüm Aileler İçin Kurulum Planı (Dry-Run)

Gerçek kurulum başlamadan önce tüm aday aileler için kurulum planını üretmek için:

```bash
npm run plan:seis-language-model-install
npm run plan:seis-language-model-install -- --json
npm run plan:seis-language-model-install -- --family llama,qwen,gemma,mistral,deepseek,openai-open-weight,embedding-and-reranker,code-specialist
```

Bu komutlar sadece **metadata planı** çıkarır:

- Aile readiness ve bloklistesi
- Örnek yerel komut önerileri
- Eğitim/evidence gereksinimleri
- 16GB hedefli yol haritası önizlemesi

Canlı kurulum veya checkpoint indirme bu komutlarla çalışmaz.

### Tam Bilgili Aile Kurulum Akışı (Önerilen)

SEIS'te “bütün dil modellerini kurmak” güvenli tarafta şu şekilde işler:

1. **Kurulum Planı (her zaman metadata-first):**
   `npm run plan:seis-language-model-install -- --family ...`
   Burada tüm ailelerin readiness, izin durumu ve bloklistesi üretilir.

2. **Doğrulama Paketleri:**
   - `npm run check:seis-language-model-intake`
   - `npm run check:seis-ai-workforce-training`
   - `npm run report:seis-language-model-training-curriculum`
   - `npm run check:seis-language-model-training-curriculum`

3. **Yerel Öğrenme Hazırlığı (tamamen yerel):**
   `npm run automation:seis-ai-workforce-training`
   Bu adım sadece seed model artefaktlarını ve güvenlik/performans doğrulama
   paketlerini yeniden üretir.

4. **İnsan Onayıyla İleri Adım:**
   Model indirme, fine-tune/adaptör, benchmark veya runtime yetkisi için her ailede
   ayrıca model kartı + veri kartı + checksum + rollback onayı gerekir.

#### Aile Bazlı Yol Haritası

- **20B (16GB+):** retrieval layer + seed modeli + ölçüm kanıtı olmadan canlı rota açılmaz.
- **70B:** önce 20B kanıt zinciri, ardından ayrıca donanım/safety/onay seti gerekir.
- **150B ve 512B+:** frontier araştırma statüsünde kalır; plan onayı, dağıtık bütçe ve
  insan onayı olmadan canlı lane'e geçilmez.

Özet akış:

```text
Plan (metadata) -> Checkler -> Curriculum -> Seed rebuild -> İnsan onayı -> Bir sonraki güvenli faz
```

## Current Status

| Area | Status | Evidence | Boundary | Next Safe Action |
| --- | --- | --- | --- | --- |
| Installed route inventory | Observed | `npm run ai -- list` on 2026-06-23 | Route readiness only; no provider prompt or credential verification. | Re-run before any secondary assistant handoff. |
| Workforce assignments | Documented | `content/development/ai-workforce-assignments.json` | Codex remains the only writer by default. | Keep secondary assistants in reviewer/draft mode. |
| Training control plane | Active local contract | `content/development/seis-ai-workforce-training-plan.json` | No live provider calls, SSH, deployment, dataset download, or cloud fine-tuning. | Run the local validator and seed training runner. |
| Language model intake | Active metadata-only contract | `content/development/seis-language-model-intake-registry.json` | This is not bulk installation and grants no download, fine-tune, training, runtime, or AGI authority. | Review one specific model family at a time with license, hardware, model-card, dataset-card, benchmark, and approval gates. |
| Seed models | Local deterministic lab | `packages/seis-ai/data/*`, `packages/seis-ai/models/*` | Runtime authority remains false. | Rebuild artifacts and promotion policy after accepted case updates. |
| Live providers | Disabled or missing key unless verified | `content/development/seis-ai-core-provider-registry.json` | Missing Key is not Error, and no browser secrets are allowed. | Add server-only adapters only after typed validation exists. |

## Training Loop

1. Codex sanitizes the objective, affected paths, excluded context, risk class,
   and validation target.
2. Installed assistants such as Qwen, Ollama, OpenCode, Hermes, Goose, and
   OpenDesign may provide bounded review, contradiction, runbook, or design
   candidate material from sanitized context.
3. Codex checks the Language Model Intake Registry before any local model
   experiment. The registry is metadata-only; it is not bulk installation,
   not checkpoint download, and not training authorization.
4. Codex treats every assistant output as untrusted until it is checked against
   repo evidence.
5. Accepted material becomes SEIS-owned synthetic cases only when it excludes
   secrets and user-private data.
6. Local deterministic builders rebuild the permission policy, memory ranker,
   eval critic, and agent router seed artifacts.
7. Benchmark and promotion gates decide whether the artifacts remain lab-ready,
   need benchmark expansion, or stay blocked.
8. Human approval is required before live provider calls, cloud fine-tuning,
   paid benchmarks, dataset downloads, SSH, deployment, push, merge, or model
   publication.

## Language Model Coverage Plan

Tüm dil modeli adaylarını (Llama, Qwen, Gemma, Mistral, DeepSeek, OpenAI
open-weight, embedding/reranker, code-specialist) bir kereye mahsus aynı güvenli
katmanda planlayıp onaylamak için şu iki komutu çalıştırın:

```bash
npm run report:seis-language-model-training-curriculum
npm run check:seis-language-model-training-curriculum
```

Üretilen çıktılar:

- `content/development/seis-language-model-training-curriculum.json`
- `reports/seis-model-scaling/seis-language-model-training-curriculum.json`
- `reports/seis-model-scaling/seis-language-model-training-curriculum.md`

Bu plan gerçek yükleme veya eğitim yapmadan önce lisans, checksum, model kartı,
veri kartı ve insan onayı şartlarını açıkça zorunlu kılar.

## Language Model Intake Registry

The registry answers the request to evaluate broad model families without
blindly installing everything. It tracks Llama, Qwen, Gemma, Mistral, DeepSeek,
OpenAI open-weight candidates, embeddings/rerankers, and code-specialist
families as metadata-only candidates.

This is retrieval first and model-install second:

- build a clean SEIS knowledge graph and retrieval layer before fine-tuning;
- review license, checkpoint provenance, checksum, disk, RAM/GPU, and safety
  boundaries before any model install;
- keep 16GB machines on metadata, deterministic seed models, and explicitly
  approved small/quantized experiments only;
- keep 70B, 150B, 300B+, 405B, 512B, and larger models blocked until hardware,
  budget, evaluation, observability, rollback, and approval evidence exists.

## Model Targets

| Model | What it learns | Training command | Runtime authority |
| --- | --- | --- | --- |
| Permission policy | Whether an action is allow, gate, approval_required, or deny. | `npm run automation:seis-permission-policy-model` | False |
| Memory ranker | Which governance or evidence record best matches a query. | `npm run automation:seis-memory-ranker-model` | False |
| Eval critic | Whether a review package should pass, revise, or block. | `npm run automation:seis-eval-critic-model` | False |
| Agent router | Which SEIS lane and validation gate should handle an intent. | `npm run automation:seis-agent-router-model` | False |

The combined runner is:

```bash
npm run automation:seis-ai-workforce-training
```

It rebuilds local seed artifacts and writes a redacted report under
`reports/seis-ai-workforce-training/`. It does not call Qwen, Ollama, Claude,
Gemini, OpenAI, or any cloud provider.

## Safety Rules

- No secrets, `.env` values, private keys, cookies, or tokens may enter prompts,
  datasets, reports, logs, screenshots, localStorage, IndexedDB, or commits.
- Core SEIS must remain usable with zero cloud-provider keys.
- Missing provider keys disable only those providers; they do not block the
  local demo or seed training lab.
- Secondary AI output is candidate evidence, not source of truth.
- Dataset cases must remain SEIS-owned synthetic examples with no user-private
  data.
- Runtime authority remains false until independent benchmarks, observability,
  rollback, human approval, and security review pass.

## Model Kurulum & Eğitim Notları

- `bütün modeli kurmak` bir tek adımda yapılmaz; aile bazlı ve onay bazlıdır.
- Canlı install hattı henüz kapalıdır; planlar sadece karar ve risk yönetimi içindir.
- 16GB+ makinede öncelik: küçük/quantize modeller, retrieval layer, seed artifactlar.
- Tam model eğitimi (adapter/finetune/full pretrain) için ek plan dosyaları, dataset kartları ve checkpoint kanıtı gerekir.

## Install and Training Ledger

`content/development/seis-language-model-install-training-ledger.json` is the
current source-of-truth for the request to install all language models and train
SEIS AI. The safe interpretation is phased and evidence-gated:

- no bulk model install;
- no checkpoint download without per-model approval;
- no provider calls with repository data by default;
- no adapter, LoRA, fine-tune, or foundation pretraining without dataset cards,
  model cards, evaluation plans, safety review, and human approval;
- only deterministic repo-local seed-model training is allowed today.

Generate and validate the ledger with:

```bash
npm run report:seis-language-model-install-training-ledger
npm run check:seis-language-model-install-training-ledger
```

The reviewer-facing report is maintained at
`reports/seis-model-scaling/seis-language-model-install-training-ledger.md`.

## Mock vs Real

| Surface | Status |
| --- | --- |
| Route inventory | Real local command output from `npm run ai -- list`. |
| Seed-model rebuild | Real deterministic local artifact generation. |
| Secondary assistant review | Planned/supervised; disabled until a sanitized handoff is explicitly run. |
| Live provider training | Not performed. |
| Foundation-model ownership | Not claimed. |

## Related Documents

- [SEIS AI Core](seis-ai-core.md)
- [Model Router](model-router.md)
- [Knowledge Retrieval Training](seis-knowledge-retrieval-training.md)
- [Agent Runtime](agent-runtime.md)
- [Prompt Engine](prompt-engine.md)
- [AI Workforce Assignments](../development/agents/ai-workforce-assignments.md)
- [Security Policy](../../SECURITY.md)
