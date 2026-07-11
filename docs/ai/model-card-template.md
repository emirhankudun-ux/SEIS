# SEIS Model Kartı Şablonu

> Bu dosya doldurulmamış şablondur. Model, training, checkpoint veya benchmark
> kanıtı değildir. Bilinmeyen alanlar `unknown` yazılmalı; sonuç uydurulmamalıdır.

Yürütme kaynağı:
`content/development/seis-frontier-training-launch-plan.json`.

## 1. Kimlik

- Model adı:
- Sürüm:
- Model türü: base / fine-tune / adapter / router / seed
- Parametre sayısı:
- Mimari:
- Tokenizer:
- Sahiplik durumu: SEIS-owned / third-party base / mixed / unknown
- Durum: research / internal / candidate / released / withdrawn
- Model artifact hash:
- Kaynak commit:

## 2. Doğruluk Beyanı

- Training gerçekleştirildi mi? yes / no / unknown
- Training log yolu:
- Checkpoint kaydı:
- Benchmark raporu:
- Bağımsız eval raporu:
- SEIS foundation-model sahipliği iddiası izinli mi? yes / no
- AGI iddiası izinli mi? yes / no

`yes` yanıtlarının her biri doğrulanabilir kanıt yolu taşımak zorundadır.

## 3. Amaç ve Kapsam

- Birincil amaç:
- Desteklenen görevler:
- Desteklenmeyen görevler:
- Hedef kullanıcılar:
- Yasak kullanımlar:
- Karar verme sınırı:

## 4. Base Model ve Lisans

- Base model:
- Base model sürümü/hash:
- Base model sahibi:
- Base lisansı:
- Adapter/fine-tune lisansı:
- Ticari kullanım kararı:
- Attribution gereksinimi:
- Yeniden dağıtım kısıtları:

## 5. Veri

- Dataset manifesti:
- Dataset card:
- Kaynak türleri:
- Lisans özeti:
- PII/private veri durumu:
- Sentetik veri oranı ve üretim yöntemi:
- Deduplication yöntemi:
- Contamination kontrolü:
- Train/dev/test hashleri:
- Veri cutoff:

## 6. Training

- Yöntem: pretraining / SFT / LoRA / DPO / other
- Training kodu ve commit:
- Config/hyperparameter kaydı:
- Seed:
- Compute donanımı ve bölgesi:
- Başlangıç/bitiş zamanı:
- Toplam compute ve tahmini maliyet:
- Cost-stop sonucu:
- Checkpoint sıklığı:
- Başarısız/yarıda kalan run'lar:

## 7. Evaluation

| Eval                | Dataset sürümü | Baseline | Sonuç | Eşik | Durum   |
| ------------------- | -------------- | -------- | ----- | ---- | ------- |
| Türkçe              |                |          |       |      | not-run |
| Kod                 |                |          |       |      | not-run |
| Repository          |                |          |       |      | not-run |
| Tool use            |                |          |       |      | not-run |
| Safety              |                |          |       |      | not-run |
| Privacy/secret leak |                |          |       |      | not-run |
| Memorization        |                |          |       |      | not-run |

Ham sonuç ve değerlendirme betiği yolları:

## 8. Bilinen Sınırlamalar

- Dil ve alan boşlukları:
- Halüsinasyon örnekleri:
- Bias/fairness riskleri:
- Uzun bağlam sınırlamaları:
- Tool-use riskleri:
- Donanım/latency sınırları:
- Kullanılmaması gereken senaryolar:

## 9. Güvenlik

- Threat model:
- Red-team kapsamı:
- Prompt injection sonucu:
- Data exfiltration sonucu:
- Zararlı kullanım değerlendirmesi:
- Redaksiyon davranışı:
- İnsan onayı gereken eylemler:
- Açık kritik/yüksek bulgular:

## 10. Çalıştırma ve Gizlilik

- Desteklenen runtime:
- Minimum ölçülmüş RAM/VRAM:
- Quantization:
- Provider veya ağ gereksinimi:
- Telemetry/log politikası:
- Yerel-only garanti:
- Veri retention:

## 11. Release ve Geri Alma

- Release sahibi:
- Güvenlik onayı:
- Veri/lisans onayı:
- Eval onayı:
- İnsan final onayı:
- Yayın kanalı:
- Rollback checkpoint'i:
- Geri çekme koşulları:
- Sonraki inceleme tarihi:

## 12. Değişiklik Geçmişi

| Tarih | Sürüm | Değişiklik | Kanıt | Onaylayan |
| ----- | ----- | ---------- | ----- | --------- |
|       |       |            |       |           |
