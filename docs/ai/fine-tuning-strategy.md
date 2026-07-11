# SEIS Fine-Tuning Stratejisi

## Amaç

Fine-tune kararını ürün ihtiyacı, veri hakları, maliyet ve ölçülmüş kalite
kazanımıyla sınırlar. Bu belge bir training çalışması veya onayı değildir.

Kaynak sözleşme:
`content/development/seis-frontier-training-launch-plan.json`.

## Yöntem Ayrımı

| Yöntem             | Ağırlık değişir mi? | SEIS model sahipliği doğurur mu? | Kullanım                     |
| ------------------ | ------------------- | -------------------------------- | ---------------------------- |
| Prompt engineering | Hayır               | Hayır                            | Davranış ve format kontrolü  |
| RAG                | Hayır               | Hayır                            | Güncel/özel bilgi erişimi    |
| SFT                | Evet                | Hayır, base model ayrı kalır     | Görev ve format uyarlama     |
| LoRA/adapter       | Adapter ağırlığı    | Yalnız adapter provenance'ı      | Düşük maliyetli uyarlama     |
| DPO/preference     | Evet                | Hayır, base model ayrı kalır     | Tercih hizalama              |
| Pretraining        | Evet, tam           | Ancak tam kanıt zinciriyle       | Foundation model araştırması |

Fine-tune, pretraining ile eş anlamlı değildir.

## Önce Daha Basit Çözüm

Fine-tune talebi şu sırayla değerlendirilir:

1. Prompt ve çıktı şeması yeterli mi?
2. RAG ile güncel bilgi sağlanabilir mi?
3. Tool kullanımı problemi çözebilir mi?
4. Küçük bir adapter ölçülebilir avantaj sağlıyor mu?
5. Tam fine-tune maliyet ve risk açısından gerekli mi?

Daha basit yöntem hedefi karşılıyorsa training yapılmaz.

## Veri Kabul Paketi

- dataset kimliği ve sürümü,
- her kaynak için lisans/provenance,
- private/PII sınıflandırması,
- deduplication ve contamination raporu,
- sentetik veri üreticisi ve kabul sahibi,
- train/dev/test hashleri,
- opt-out ve silme süreci,
- amaç dışı kullanımı engelleyen politika.

Özel, sızdırılmış, proprietary veya lisansı belirsiz veri reddedilir.

## Çalışma Manifesti

Her run başlamadan önce:

- base model kimliği, lisansı ve hash,
- tokenizer/config sürümü,
- yöntem ve hyperparameter'lar,
- seed ve kod commit'i,
- compute tipi, bölgesi, bütçesi ve cost-stop,
- checkpoint sıklığı ve retention,
- eval paketi ve kabul eşikleri,
- güvenlik sahibi ve rollback sorumlusu,
- açık insan onayı

kaydedilir. Eksik alanla job gönderilemez.

## Eğitim Sırası

1. Veri dry-run ve schema doğrulaması.
2. Çok küçük smoke run.
3. Overfit/memorization ve secret-leak kontrolü.
4. Sınırlı pilot run.
5. Held-out capability ve safety eval.
6. Base model karşılaştırması.
7. İnsan incelemesi ve go/no-go.
8. Ayrı release kararı.

Pilot başarısı production route yetkisi değildir.

## DPO ve Tercih Verisi

- Tercih çiftlerinin kaynağı ve değerlendiren rolü kaydedilir.
- Kişisel hassas veriden tercih sinyali üretilmez.
- Reward hacking, verbosity bias ve sycophancy ayrıca ölçülür.
- DPO sonucu SFT ve base baseline'larıyla karşılaştırılır.

## Checkpoint ve Rollback

Her checkpoint; run kimliği, step, hash, parent, veri manifesti, kod commit'i,
eval durumu ve storage konumunu taşır. `docs/ai/checkpoint-governance.md`
kuralları uygulanır. Başarısız safety veya regression sonucu checkpoint'i
karantinaya alır.

## Kabul Eşikleri

Bir adapter veya fine-tune ancak:

- hedef görevlerde önceden kayıtlı iyileşme,
- kritik safety metriklerinde gerileme olmaması,
- memorization/secret leak testlerinin geçmesi,
- latency ve bellek bütçesine uyum,
- tekrar üretilebilir run,
- doldurulmuş model/dataset kartı,
- bağımsız inceleme ve insan onayı

ile terfi edebilir.

## Bugünkü Durum

SEIS için cloud fine-tune, LoRA, DPO veya foundation pretraining çalıştırılmadı.
Training logu, adapter, checkpoint ve benchmark sonucu yoktur. Tüm gerçek
yürütme `deny` durumundadır.
