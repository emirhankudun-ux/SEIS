# SEIS Üçüncü Taraf Uyum Haritası

Oluşturulma: 2026-06-09T11:58:51.438Z
Kaynak: /Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS/SEIS
Hedef: /Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS

## Özet
- Toplam aday dosya: 16
- Kaynaktan eklenecek: 0
- Adaptasyon gereken: 5
- Tamamen uyumlu: 11
- Kaynakta olmayan ama hedefte olan: 0

## Aksiyon önceliği (Critical)

## Aksiyon önceliği (High)
- LLM planlayıcı: **adapt**
- LLM görev yönlendirme politikası: **adapt**
- Plugin manifest: **adapt**

## Aksiyon önceliği (Medium)
- LLM paket envanteri: **adapt**
- LLM adaptör hazırbulma: **adapt**

## Aksiyon önceliği (Low)

## Önerilen Yol
1. `npm run check:seis-plugin-bundle`
2. `npm run check:seis-repos-llm-bridge`
3. `npm run check:llm-orchestration-policy`
4. `npm run automation:refresh-seis-surface --summary`
