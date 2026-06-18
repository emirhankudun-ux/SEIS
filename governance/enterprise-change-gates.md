# SEIS Kurumsal Değişiklik Kapıları (Zorunlu 4 Kapı)

Bu belge `main`e girecek her değişikliği standartlar.

## Kapı 1 — Doğrulama Metrikleri

- Koşul: `npm run check:workspace`, `npm run seis:check`
- Eksik ise kapı kapanır.

## Kapı 2 — Güvenlik

- Koşul: güvenlik taraması ve risk planı.
- Eksik ise kapı kapanır.

## Kapı 3 — Dokümantasyon

- Koşul: davranış kaydı (ADR / docs / karar notu) ve migration/güncelleme notu.
- Eksik ise kapı kapanır.

## Kapı 4 — Rollback

- Koşul: etki alanı, geri alma adımı, dry-run raporu (veya uygulanmış geri dönüş prova kaydı).
- Eksik ise kapı kapanır.

## Değişiklik Değerlendirme Formu

- Değişiklik ID:
- Modül: Dashboard / Goals / Repos / Docs / Agents / Other
- Risk Seviyesi: P0 / P1 / P2
- Kapı 1 Kanıtı:
- Kapı 2 Kanıtı:
- Kapı 3 Kanıtı:
- Kapı 4 Kanıtı:
- AI Etkisi: Yok / Varlı (policy onayı var / insan onayı var)
- Rollback Senaryosu:
- Durum: Açık / Onaylı / Gerekçeli Duraklatma

## Uzun Vade Dönüşüm Kuralı

Bu bölümde eski `Uzun Vade Dondurma Kuralı` metni korunarak, uzun dönem karar ritmi standartlaştırıldı.

## Uzun Vade Dondurma Kuralı

- **D1:** `GCR`, `DTC`, `RRT`, `PVR` düşüşü: sadece kapı/rollback iyileştirme sprinti.
- **D2:** İki dönem üst üste düşüş: yeni özellik açma durur, kök neden eylemi zorunlu.
- **D3:** Kritik düşüş: yeni modül genişlemesi durur; güvenlik ve rollback iyileştirme öncelikli.

Referans: [roadmap/seis-18-60-month-long-horizon-ops-blueprint.md](../roadmap/seis-18-60-month-long-horizon-ops-blueprint.md)
