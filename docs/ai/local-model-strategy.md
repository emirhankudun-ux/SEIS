# SEIS Yerel Model Stratejisi

## Amaç

SEIS'in API anahtarı olmadan çalışabilen, gizlilik odaklı bir AI katmanına
ilerlemesi için yerel model seçimi, doğrulaması ve terfi kurallarını tanımlar.
Bu belge model indirme veya eğitim onayı değildir.

Kaynak sözleşme:
`content/development/seis-frontier-training-launch-plan.json`.

## Gerçeklik Sınırı

- SEIS'in bugün 20B, 70B, 150B, 300B+ veya 512B eğitilmiş modeli yoktur.
- 16GB+ RAM etiketi yalnız uyumluluk araştırma sınıfıdır; tam 20B eğitim
  kapasitesi kanıtı değildir.
- Quantization bir modeli küçültür; SEIS'e model sahipliği kazandırmaz.
- Ollama veya benzeri bir runtime kurulumu, model eğitimi anlamına gelmez.
- RAG, prompt engineering ve provider routing model eğitimi değildir.

## Çalışma Modları

| Mod                    | Ağ                | Anahtar       | Veri sınırı                               | Bugünkü durum     |
| ---------------------- | ----------------- | ------------- | ----------------------------------------- | ----------------- |
| Local Demo             | Yok               | Yok           | Sabit fixture ve SEIS'e ait sentetik veri | Çalışan temel mod |
| Yerel runtime          | Varsayılan kapalı | Yok           | Yalnız onaylı yerel dosyalar              | Planlı            |
| Yerel özel depo        | Yok               | Yok           | Açık kullanıcı seçimi ve redaksiyon       | Planlı            |
| Provider yönlendirmeli | Gerekli           | Sunucu tarafı | Politika ve onay ile sınırlı              | Devre dışı        |

Yerel-only seçildiğinde buluta sessiz fallback yasaktır.

## Donanım Gerçekliği

| Sınıf                     | 16GB+ sistemde hedef                        | Eğitim yorumu                                     |
| ------------------------- | ------------------------------------------- | ------------------------------------------------- |
| Küçük SEIS seed modelleri | CPU/yerel deterministik değerlendirme       | Mevcut laboratuvar kanıtı LLM değildir            |
| Küçük açık ağırlıklı LLM  | Onaylı quantized inference adayı            | İndirme, lisans ve bellek ölçümü gerekir          |
| 20B                       | Quantized inference fizibilitesi            | Tam eğitim için 16GB yeterli kabul edilmez        |
| 70B+                      | Dağıtık veya çoklu hızlandırıcı araştırması | Ölçülmüş bütçe ve insan onayı olmadan başlatılmaz |
| 512B                      | Araştırma yönü                              | Eğitim veya AGI kanıtı yoktur                     |

## Model Kabul Kriterleri

Bir model adayı ancak aşağıdaki kayıtlarla değerlendirilebilir:

1. Kaynak depo ve sürüm/commit kimliği.
2. Lisans ve ticari kullanım incelemesi.
3. Model kartı ve bilinen sınırlamalar.
4. Dosya hashleri ve indirme kaynağı.
5. Bağlam uzunluğu, tokenizer ve tool-use yetenekleri.
6. Ölçülmüş RAM/VRAM, başlangıç süresi ve token/saniye.
7. Türkçe, kod, güvenlik ve halüsinasyon değerlendirmeleri.
8. Redaksiyon, loglama, rollback ve kaldırma planı.

## Aşamalı Uygulama

### Aşama 0 - Local Demo

Sabit fixture, deterministic seed modelleri ve salt-okunur MCP yüzeyleri.
Gerçek LLM veya provider iddiası yoktur.

### Aşama 1 - Envanter ve dry-run

Kurulu runtime ve model metadata'sı sır değerleri okunmadan envanterlenir.
Model kimlikleri yalnız kullanıcı tarafından açıkça istenirse görünür olur.

### Aşama 2 - Tek model pilotu

Yalnız bir allowlist model, onaylı indirme ve lisans kaydıyla denenir. İndirme
öncesinde disk, RAM, hash ve rollback planı kabul edilir.

### Aşama 3 - Router entegrasyonu

Model ancak ölçülmüş eval ve bellek raporları kabul edilirse route adayı olur.
Aktif model ve fallback kimliği UI'da görünür kalır.

### Aşama 4 - Adapter araştırması

LoRA/SFT yalnız veri provenance, çalışma manifesti, bütçe, checkpoint ve eval
kapıları tamamlandığında ayrı onayla değerlendirilir.

## Kabul Kapısı

Gerçek yerel model aktivasyonu için:

- `npm run check:seis-frontier-training-launch-plan` geçmeli,
- lisans ve veri kullanım kararı kaydedilmeli,
- ölçülmüş benchmark raporu bulunmalı,
- model/dataset kartları doldurulmalı,
- gizlilik ve güvenlik incelemesi kabul edilmeli,
- açık insan onayı kaydedilmelidir.

Bu kanıtlar yoksa karar `deny` olarak kalır.
