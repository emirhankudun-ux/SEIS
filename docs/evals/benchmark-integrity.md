# SEIS Benchmark Bütünlüğü

## Amaç

Benchmark sonuçlarının tekrar üretilebilir, kontaminasyondan korunmuş ve
iddialarla orantılı olmasını sağlar. Bu belge ölçülmüş benchmark sonucu değildir.

Yürütme kaynağı:
`content/development/seis-frontier-training-launch-plan.json`.

## Ön Kayıt

Run başlamadan önce aşağıdakiler kilitlenir:

- model/checkpoint hash,
- benchmark dataset sürümü ve hash,
- dahil/hariç görevler,
- metrik ve eşikler,
- baseline modeller,
- decoding ve seed,
- donanım ve runtime,
- tekrar sayısı,
- başarısızlık ve timeout politikası.

Sonuç görüldükten sonra eşik değiştirilirse yeni run kimliği gerekir.

## Kontaminasyon Kontrolü

- Benchmark örnekleri training corpus ve sentetik veri kaynaklarıyla exact ve
  fuzzy eşleştirilir.
- Paraphrase ve çözüm metni sızıntısı ayrıca aranır.
- Public benchmark bilinirliği risk olarak raporlanır.
- Prompt geliştiren kişiler held-out cevaplara erişmez.
- Kontamine örnek kaldırılır; sessizce skor içinde tutulmaz.
- Model self-report'u kontaminasyon kanıtı sayılmaz.

## Ayrım

| Kayıt    | Kullanım                            |
| -------- | ----------------------------------- |
| Train    | Ağırlık/adapter güncelleme          |
| Dev      | Prompt ve hyperparameter seçimi     |
| Test     | Tek seferlik tarafsız ölçüm         |
| Red-team | Safety ve adversarial failure arama |

Aynı örnek birden fazla role taşınırsa tüm ilgili skorlar işaretlenir.

## Tekrar Üretilebilirlik

Rapor şu bilgileri taşır:

- kod commit ve dependency lock,
- model/tokenizer/config hashleri,
- dataset manifesti,
- random seedler,
- cihaz, driver ve runtime sürümleri,
- batch/context/quantization ayarları,
- ham çıktı ve hata log konumu,
- checksum ve oluşturma zamanı.

Gerekli artifact yoksa sonuç `unverified` kalır.

## Skor Kuralları

- Eksik cevaplar başarı sayılmaz.
- Timeout ve tool hataları ayrı raporlanır.
- İnsan değerlendirmesinde rubric, körleme ve anlaşma oranı bulunur.
- Çoklu denemede yalnız en iyi skor seçilmez; dağılım yayımlanır.
- Safety kritik metrikleri genel ortalamayla maskelenmez.
- 16GB+ uyumluluk yalnız peak RSS/VRAM ölçümüyle doğrulanabilir.

## Karşılaştırma

Karşılaştırılan modeller aynı prompt, tool, context, veri ve donanım bütçesine
yakın koşullarda çalıştırılır. Provider modellerde sürüm ve tarih kaydedilir.
Kapalı provider değişikliği sonuçlar arasında eşitlik varsayımı oluşturmaz.

## İddia Sınırı

- `template-not-measured` benchmark değildir.
- Dry-run yalnız komut ve artifact yolunu doğrular.
- Tek eval AGI kanıtı değildir.
- Parametre sayısı kalite veya güvenlik kanıtı değildir.
- Başka modelin yayımladığı skor SEIS run sonucu değildir.
- Yeniden çalıştırılmayan dış skor açıkça external olarak etiketlenir.

## Yayın Kontrolü

Public skor için dataset lisansı, contamination raporu, run manifesti, ham
artifact hashleri, bağımsız inceleme ve insan release onayı gerekir. Sonradan
kontaminasyon veya hesaplama hatası bulunursa rapor geri çekilir ve changelog'a
işlenir.
