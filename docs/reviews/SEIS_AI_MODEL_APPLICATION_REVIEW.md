# SEIS AI Model ve Uygulama İncelemesi

## İnceleme Kapsamı

Bu inceleme SEIS AI Core uygulama katmanı ile SEIS Universe model araştırma
hedefini birbirinden ayırır. Kaynak yürütme sözleşmesi:
`content/development/seis-frontier-training-launch-plan.json`.

İncelenen dal: `ai/frontier-training-launch-plan-20260711`.

## Yönetici Özeti

SEIS bugün provider-neutral, zero-key Local Demo, salt-okunur MCP ve plan-only
agent sözleşmelerine sahip bir AI uygulama foundation'ıdır. SEIS'e ait
eğitilmiş 20B+ LLM, frontier checkpoint, ölçülmüş frontier benchmark veya AGI
kanıtı yoktur.

Bu pass, gerçek eğitim yerine eğitim öncesi kanıt, veri, güvenlik, checkpoint,
eval ve insan onayı kapılarını kurar. Tüm 20B/70B/150B/300B+/512B lane'leri
`deny` durumunda kalır.

## Gerçek Olarak Çalışan

- Zero-key Local Demo ve deterministic seed-model laboratuvar testleri.
- Provider durum ve read-only route sözleşmeleri.
- Agent permission, cancellation, redaction ve dry-run fixture'ları.
- Yerel stdio MCP araç/kaynak/prompt kayıtları.
- Fail-closed frontier training status aracı.
- MCP resource ve status için runtime secret/path/invariant kontrolleri.
- Manifest, model scaling ve bağlı governance validator'ları.

Bu yüzeyler model eğitimi veya live provider erişimi değildir.

## Local Demo veya Mock

| Yüzey                  | Durum                | Sınır                       |
| ---------------------- | -------------------- | --------------------------- |
| AI chat/Command Center | Local Demo           | Provider çağrısı yok        |
| Model router           | Read-only karar      | Live adapter yok            |
| Agent runtime          | Fixture ve plan-only | Arka plan write runtime yok |
| Provider registry      | Repo-local durum     | Credential doğrulaması yok  |
| Model scaling          | Planlı uyumluluk     | Ağırlık/inference yok       |
| 20B benchmark          | Template/dry-run     | Ölçülmüş sonuç yok          |

## Planlı Araştırma

- onaylı yerel model inference pilotu,
- dataset provenance ve contamination pipeline'ı,
- tokenizer ve küçük model deneyleri,
- ayrı SFT/LoRA/DPO araştırmaları,
- 20B fizibilite ve dağıtık compute bütçesi,
- bağımsız capability/safety evaluation,
- checkpoint ve release governance,
- kanıt varsa 70B/150B/300B+/512B fizibilite incelemeleri.

Bu sıra bir eğitim taahhüdü değildir.

## Güvenlik İncelemesi

Bağımsız diff incelemesi üç sağlamlaştırma ihtiyacı belirledi:

1. Manifest bozulduğunda runtime'ın izin değerlerine güvenmemesi.
2. Credential taramasının GitHub/AWS/Google/bearer/JWT/URI ve hassas alan
   değerlerini kapsaması.
3. Manifest kontrollü council yolunun repository kökünden çıkamaması.

Bu pass içinde:

- runtime invariant kontrolü eklendi,
- hatalı manifest `invalid-fail-closed` ve tüm yürütme değerleri `false`
  döndürüyor,
- merkezi credential kontrolü hem status hem MCP resource okumasına bağlandı,
- kaynak dosyaları `resolveInside` ve exact allowlist ile sınırlandı,
- authorization tampering, credential alanı ve path traversal negatif testleri
  eklendi.

Gerçek credential bulunmadı; taramalarda değerler yazdırılmadı.

## Model Sahipliği Kararı

| İddia                                     | Bugünkü karar                           |
| ----------------------------------------- | --------------------------------------- |
| Prompt engineering yapıldı                | Uygulama katmanı; model sahipliği değil |
| RAG/retrieval var                         | Uygulama katmanı; model eğitimi değil   |
| Provider model kullanımı                  | Provider sahipliği; SEIS modeli değil   |
| LoRA/SFT yapıldı                          | Hayır, kanıt yok                        |
| SEIS foundation model eğitildi            | Hayır                                   |
| SEIS checkpoint'i var                     | Hayır                                   |
| 20B/70B/150B/300B+/512B benchmark yapıldı | Hayır                                   |
| AGI gösterildi                            | Hayır                                   |

## Zorunlu İnsan Onayı

- model veya dataset indirme,
- provider authentication veya data upload,
- ücretli GPU/cloud provisioning,
- training/fine-tune job,
- gerçek benchmark,
- checkpoint publication,
- route eligibility değişikliği,
- SSH, deployment, GitHub push/PR/merge,
- public model/dataset release,
- AGI veya foundation-model sahipliği iddiası.

## Doğrulama Komutları

```bash
npm run check:seis-frontier-training-launch-plan
npm run check:seis-agent-plugin-integration
node --test packages/seis-ai/test/agent.test.mjs
node --test packages/seis-ai/test/mcp-smoke.test.mjs
npm test --prefix packages/seis-ai
npm run seis:check
npm run check:foundation
git diff --check
```

## Açık Riskler

- Live provider adapter ve server-only credential validation yok.
- Onaylı yerel LLM runtime pilotu yok.
- Formal Draft 2020-12 training/checkpoint/compute/eval/release şemaları ve sentetik fixture hash zinciri eklendi; gerçek kabul edilmiş evidence kayıtları hâlâ yok.
- Ed25519 release attestation verifier ve RFC 7638 public-key kimliği eklendi; trust-root hâlâ anahtarsız ve `not-configured`, dolayısıyla release `deny` kalıyor.
- Gerçek dataset provenance ve contamination raporu yok.
- Ölçülmüş memory/latency/cost benchmark yok.
- Bağımsız insan safety review yapılmadı.
- Repo geneli lint, bu değişiklik dışındaki mevcut borçlar nedeniyle kırık.

## Karar

AI foundation değişiklikleri iç inceleme ve foundation PR hazırlığına uygundur.
Gerçek model indirme, eğitim, benchmark, route veya release için hazır değildir.
