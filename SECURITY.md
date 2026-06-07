# Security Policy

## Reporting Security Vulnerabilities

Teşekkürler — güvenliği ciddiye alıyoruz. Bir güvenlik açığı bulursan, lütfen herkese açık olarak rapor etme — doğrudan [@emirhankudun-ux](https://github.com/emirhankudun-ux) ile iletişime geç.

### Bildirimi Nasıl Yapmalısın?

1. **Doğrudan mesaj gönder**: GitHub üzerinden bize mesaj at.
2. **E-posta ile iletişim**: emirhankudun@gmail.com adresine güvenlik açığını anlatan bir e-posta gönder.
3. **Detaylar ekle**:
   - Açığın türü (XSS, CSRF, injection vb.)
   - Etkilenen dosya/bölüm
   - Reproduksiyon adımları (eğer mümkünse)
   - Olası çözüm (eğer varsa)

### Yanıt Süresi

- İlk yanıt: 48 saat içinde
- Düzeltme: Duruma bağlı olarak 1-2 hafta
- Açık kaynak: Düzeltme onaylandıktan sonra yayınlanır

## Desteklenen Versiyonlar

Aşağıdaki versiyonlar güvenlik güncellemeleri alıyor:

| Versiyon | Destek |
|----------|--------|
| 1.x      | ✅ Aktif |

## Güvenlik Best Practices

- **Gizli bilgiler paylaşma**: `.env` dosyaları, API anahtarları, kimlik bilgileri asla repo'da kalmamalı.
- **Bağımlılıkları güncel tut**: Düzenli olarak `npm audit` çalıştır.
- **Kod incelemesi**: PR'ları güvenlik açılarına karşı kontrol et.

Teşekkürler!