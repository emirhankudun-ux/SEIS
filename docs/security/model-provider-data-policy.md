# SEIS Model Provider Veri Politikası

## Amaç

Repository, kullanıcı ve ürün verisinin yerel modeller veya dış LLM
provider'larıyla işlenmesinde minimum veri, açık onay ve sır korumasını zorunlu
kılar.

İlgili kaynaklar:

- `docs/ai/provider-routing-policy.md`
- `content/development/seis-frontier-training-launch-plan.json`

## Veri Sınıfları

| Sınıf        | Örnek                                | Dış provider varsayılanı              |
| ------------ | ------------------------------------ | ------------------------------------- |
| Public       | Yayınlanmış doküman, açık kaynak kod | Politika ile izinli                   |
| Internal     | Yayınlanmamış roadmap, taslak        | Kapalı                                |
| Confidential | Özel repo, müşteri/veri seti         | Yasak, ayrı istisna gerekir           |
| Secret       | Token, parola, private key, cookie   | Her zaman yasak                       |
| Personal     | PII, biyometrik, özel not            | Her zaman yasak veya hukuki açık onay |

Sınıf bilinmiyorsa `Confidential` kabul edilir.

## Temel Kurallar

- Görev için minimum dosya ve minimum satır gönderilir.
- Sır değerleri provider, prompt, log, telemetry ve MCP'ye gönderilmez.
- `.env`, private key, cookie, credential store ve service-account dosyaları
  model bağlamına alınmaz.
- Private repository içeriği açık kullanıcı onayı olmadan dışarı çıkmaz.
- Local-only seçimi cloud fallback'e çevrilemez.
- Provider'ın training/retention politikası doğrulanmadan veri gönderilmez.

## Provider Onay Kaydı

Her live provider için:

- provider ve model kimliği,
- API/data processing bölgesi,
- retention süresi,
- provider training opt-out durumu,
- subprocessors ve aktarım koşulları,
- sözleşme ve privacy review tarihi,
- izin verilen veri sınıfları,
- sorumlu sahip ve kapatma yöntemi

kaydedilir. Eksik kayıtta durum `Disabled` olur.

## Gönderim Öncesi Pipeline

1. Dosya kapsamını kullanıcı veya allowlist belirler.
2. Veri sınıfı tespit edilir.
3. Secret ve PII taraması yapılır.
4. Gereksiz bağlam çıkarılır.
5. Redaksiyon sonucu kullanıcıya özetlenir.
6. Provider/model ve retention etkisi gösterilir.
7. Gerekliyse insan onayı kaydedilir.
8. Backend provider çağrısını yapar.

Browser doğrudan provider anahtarı veya provider API çağrısı taşımaz.

## Loglama

İzin verilen alanlar:

- route kararı,
- provider/model kimliği,
- veri sınıfı,
- redaksiyon sayıları,
- token/maliyet özeti,
- hata kategorisi,
- onay kimliği.

Yasak alanlar:

- prompt/dosya gövdesinin tamamı,
- API key/token/parola,
- private key veya cookie,
- kişisel veri,
- provider response içindeki redakte edilmemiş sırlar.

## Training ve Fine-Tune

Provider'a training verisi yüklemek inference çağrısından ayrı onay gerektirir.
Dataset card, lisans/provenance, PII temizliği, retention, silme, compute bütçesi
ve model sahipliği sınırı kaydedilmeden upload yapılamaz.

## Yerel Model

Yerel çalışma gizlilik riskini azaltır fakat ortadan kaldırmaz. Model dosyası
lisansı, prompt logları, cache, telemetry, plugin/tool yetkileri ve disk
şifrelemesi ayrıca incelenir. Yerel model secrets dizinlerini tarayamaz.

## Olay Yönetimi

Şüpheli veri gönderiminde:

1. Provider route kapatılır.
2. Loglarda değer değil olay kimliği korunur.
3. İlgili credential döndürülür/rotate edilir.
4. Retention/silme talebi başlatılır.
5. Etkilenen kapsam ve provider kaydedilir.
6. Güvenlik incelemesi tamamlanmadan route açılmaz.

## Bugünkü Durum

Bu branch live provider çağrısı, credential validation, dataset upload,
fine-tune veya training yapmaz. Local Demo ve salt-okunur sözleşmeler aktiftir;
gerçek provider routing insan onayı ve backend uygulaması bekler.
