# SEIS AI Değerlendirme Stratejisi

## Amaç

Prompt, retrieval, agent, adapter ve model değişikliklerini aynı kanıt düzeninde
ölçmek; capability artışını safety ve gizlilikten ayrı göstermemektir.

Yürütme kaynağı:
`content/development/seis-frontier-training-launch-plan.json`.

Evaluation report ve release bağlantı şemaları:
`content/development/seis-model-training-evidence-chain.json`.

## Gerçeklik Sınırı

Mevcut seed-model testleri yerel ve deterministiktir. Bunlar 20B+ LLM
benchmark'ı veya AGI kanıtı değildir. Çalıştırılmamış eval için sonuç yazılmaz.

## Değerlendirme Katmanları

| Katman           | Ölçülen şey                                      | Örnek kanıt                |
| ---------------- | ------------------------------------------------ | -------------------------- |
| Unit/contract    | Şema, izin, fallback, redaksiyon                 | Node testleri ve validator |
| Prompt           | Format, doğruluk, refusal, sürüm regresyonu      | Golden fixture             |
| Retrieval        | Recall, precision, citation, private-data sınırı | Held-out query seti        |
| Agent            | Plan, tool seçimi, izin ve durdurma              | Dry-run görev paketi       |
| Model capability | Türkçe, kod, repo, araştırma                     | Model-specific eval run    |
| Safety           | Misuse, injection, exfiltration, secret handling | Red-team raporu            |
| Operations       | Latency, memory, cost, recovery                  | Ölçülmüş run manifesti     |

## Eval Dataset Kuralları

- Her dataset benzersiz kimlik, sürüm ve hash taşır.
- Train/dev/test ayrımı immutable manifestte tutulur.
- Held-out test içeriği training ve prompt optimizasyon pipeline'ına verilmez.
- Lisans, provenance ve sentetik üretim yöntemi kaydedilir.
- Private kullanıcı verisi varsayılan olarak eval setine alınmaz.
- Sızmış benchmark sorusu tespit edilirse ilgili sonuç geçersiz sayılır.

## Temel Eval Paketleri

### Türkçe

Anlama, üretim, terminoloji, uzun sözcükler, code-switching ve güvenli refusal.

### Kod ve Repository

Kod okuma, dar patch, test seçimi, path sınırı, secret koruması ve diff
doğruluğu.

### Dokümantasyon ve Araştırma

Kaynak ayrımı, iddia/kanıt eşleşmesi, tarihsel doğruluk ve belirsizlik beyanı.

### Tool ve Agent

Doğru tool seçimi, minimum yetki, approval gate, cancellation, timeout,
delegation sınırı ve sonuç doğrulaması.

### Güvenlik

Prompt injection, sır çıkarma, path traversal, unsafe shell, provider data
leakage, yetki yükseltme ve sahte başarı iddiası.

## Metrikler

- task success ve exact/semantic correctness,
- citation precision ve unsupported-claim oranı,
- tool selection ve argument doğruluğu,
- safety violation ve secret leak oranı,
- false allow / false deny,
- p50/p95 latency, peak RAM/VRAM ve maliyet,
- baseline'a göre regresyon,
- tekrar çalıştırmalar arası varyans.

Tek bir ortalama skor kritik safety başarısızlığını gizleyemez.

## Çalışma Manifesti

Her eval run şunları kaydeder:

- model/provider/runtime ve kesin sürüm,
- kod commit'i ve config,
- dataset sürüm/hash,
- seed ve decoding ayarları,
- donanım/işletim sistemi,
- başlangıç/bitiş zamanı,
- ham sonuç konumu,
- özet metrikler,
- hata ve timeout'lar,
- onaylayan ve tekrar üretim komutu.

Prompt veya sır değeri loglara ham yazılmaz.

`packages/evals/schemas/model-evaluation-report.schema.json` bu tekrar
üretilebilirlik sınırını `codeCommit`, `configHash`, `randomSeeds`,
`hardwareProfile`, `runtimeVersion`, `rawOutputUri` ve `rawOutputHash`
alanlarıyla zorunlu kılar. `benchmarkExecuted: true` olduğunda rapor ve ham
çıktı hashleri ile kod commit'i eksik bırakılamaz.

## Terfi Politikası

Bir sürüm ancak:

1. Önceden kayıtlı eşikleri karşılar.
2. Kritik safety testlerinin tamamını geçer.
3. Base ve önceki sürüme göre regresyon göstermez.
4. En az bir bağımsız tekrar çalıştırmada doğrulanır.
5. Veri kontaminasyonu incelemesi geçer.
6. İnsan incelemesi ve release onayı alır.

Bu koşullar route veya deployment onayını otomatik vermez.

## Doğrulama

```bash
npm run check:seis-model-training-evidence-chain
npm run check:data-schema-registry
```

Bu komutlar şema, fixture, hash ve referans sözleşmesini doğrular; çalıştırılmış
bir frontier benchmark veya model kalitesi kanıtı üretmez.

## Raporlama

Başarılarla birlikte başarısız örnekler, desteklenmeyen alanlar, ölçülmeyen
metrikler ve bilinen kontaminasyon riskleri yayımlanır. `not-run`, `unknown`
ve `not-applicable` değerleri sıfır skorla karıştırılmaz.
