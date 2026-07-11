# SEIS Model Geliştirme Yol Haritası

## İlke

Bu yol haritası tarih veya parametre hedefini başarı taahhüdü olarak kullanmaz.
Her adım yalnız önceki adımın ölçülmüş ve kabul edilmiş kanıtıyla açılır.

Yürütme kaynağı:
`content/development/seis-frontier-training-launch-plan.json`.

## Bugünkü Başlangıç Noktası

- SEIS AI Core uygulama katmanı ve Local Demo vardır.
- Deterministic küçük seed modelleri laboratuvar kanıtıdır; LLM değildir.
- 20B/70B/150B/300B+/512B eğitim başlamamıştır.
- Frontier checkpoint, benchmark ve AGI kanıtı yoktur.
- Tüm ölçek lane'leri `deny` durumundadır.

## Beş Yıllık Program

### Yıl 1 - Kanıt Altyapısı

- veri provenance ve dataset manifestleri,
- model/training/checkpoint/compute şemaları,
- prompt, retrieval, agent ve model eval paketi,
- küçük SEIS seed modelleri için tekrar üretilebilir laboratuvar,
- onaylı tek bir yerel inference pilotu,
- provider ve privacy routing kapıları.

Başarı ölçütü büyük model eğitimi değil, kanıt zincirinin çalışmasıdır.

### Yıl 2 - Küçük Model ve Adapter Araştırması

- lisanslı küçük model baseline'ları,
- tokenizer ve Türkçe/kod ölçümleri,
- sınırlı SFT/LoRA deneyi için ayrı onay paketi,
- contamination ve memorization testleri,
- checkpoint rollback tatbikatı,
- bağımsız safety eval.

Base model SEIS'e ait değilse bu durum model kartında açık kalır.

### Yıl 3 - 20B Fizibilite ve 70B Karar Kapısı

- 20B mimari/tokenizer/data bütçesi,
- dağıtık compute maliyet ve kapasite ölçümü,
- küçük pilotlardan çıkarılan scaling varsayımlarının doğrulanması,
- recovery, observability ve cost-stop provası,
- 20B için gerçek go/no-go incelemesi.

20B kanıtı kabul edilmeden 70B çalışması başlatılmaz.

### Yıl 4 - Frontier Fizibilite

- 70B kanıtı varsa 150B araştırma paketi,
- model/data parallelism ve iletişim bütçesi,
- çoklu veri merkezi ve provider risk analizi,
- bağımsız güvenlik ve misuse değerlendirmesi,
- 300B+ için yalnız fizibilite kararı.

Bu yıl için de eğitim garantisi yoktur.

### Yıl 5 - SEIS Universe Araştırma Temeli

- kabul edilmiş küçük/20B/70B/150B kanıtlarının yeniden değerlendirilmesi,
- 300B+ veya 512B araştırmasının bilimsel/mali gerekçesi,
- AGI iddiasından bağımsız capability ve safety protokolü,
- checkpoint ve public release governance,
- açık kaynak/kamuya sunum hazırlığı.

512B parametre hedefi AGI kanıtı değildir ve otomatik yürütme yetkisi vermez.

## Ölçek Terfi Matrisi

| Hedef            | Ön koşul                                     | Bugünkü karar    |
| ---------------- | -------------------------------------------- | ---------------- |
| Küçük seed       | SEIS sentetik veri + deterministic eval      | Laboratuvar açık |
| Yerel açık model | Lisans + indirme + bellek + safety onayı     | Kapalı           |
| Adapter          | Dataset/run/checkpoint/eval manifesti        | Kapalı           |
| 20B              | Tam data/compute/recovery/eval paketi        | Deny             |
| 70B              | Kabul edilmiş 20B kanıtı                     | Deny             |
| 150B             | Kabul edilmiş 20B ve 70B kanıtı              | Deny             |
| 300B+            | Önceki sınıflar + fizibilite                 | Deny             |
| 512B             | Tüm alt sınıflar + bağımsız eval + açık onay | Deny             |

## Her Yıl Yeniden Sorulacak Sorular

1. Aynı ürün hedefi RAG veya küçük modelle çözülebiliyor mu?
2. Veri hakları ve kullanıcı gizliliği kanıtlanabiliyor mu?
3. Compute maliyeti ve çevresel etki kabul edilebilir mi?
4. Eval seti kontamine olmadan bağımsız kalabiliyor mu?
5. Checkpoint ve release geri alınabilir mi?
6. Model ölçeği gerçekten ölçülmüş kalite kazancı sağlıyor mu?

Bu sorulardan biri olumsuzsa daha büyük modele geçilmez.

## İnsan Onayı

Model/dataset indirme, provider authentication, ücretli GPU, training/fine-tune
job, benchmark, checkpoint yayınlama, route açma ve public release ayrı insan
onayı gerektirir. GitHub push/PR/merge de bu yol haritasından yetki kazanmaz.
