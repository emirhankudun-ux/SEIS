# SEIS Long-Horizon KPI Framework

## Amaç

Uzun dönem hedeflerinde başarının “his" ile değil, ölçümlerle teyit edilen sağlık eğrisiyle değerlendirilmesi.

## KPI Seviyeleri

### A) Sistem Dayanıklılığı

1. **Gate Completion Rate (GCR)**
   - Haftalık: açılan PR’larda kalite/güvenlik/AI/roll-back kontrolünün tamamlanma oranı.
   - Hedef:
     - 12 Ay: %85+
     - 36 Ay: %95+
2. **Rollback Readiness Time (RRT)**
   - Kritik değişiklikte güvenli geri dönüş için gereken ortalama dakika.
   - Hedef:
     - 12 Ay: 45 dk altı
     - 36 Ay: 20 dk altı
3. **Decision Trace Completeness (DTC)**
   - Aktif modül kararlarının ADR ve dokümantasyonla eşlenme oranı.
   - Hedef:
     - 12 Ay: %70+
     - 36 Ay: %95+

### B) Güvenlik ve AI Olgunluğu

4. **Policy Violation Rate (PVR)**
   - AI policy ihlali veya policy bypass denemeleri/1000 etkileşim.
   - Hedef:
     - 12 Ay: < 2
     - 36 Ay: < 0.5
5. **Mean Time to Security Containment (MTSC)**
   - Tespit edilen güvenlik riskinin kapsama alındığı ortalama süre.
   - Hedef:
     - 12 Ay: < 24 saat
     - 36 Ay: < 4 saat

### C) Ürün ve Topluluk

6. **First Meaningful Interaction Time (FMIT)**
   - Yeni katkıcıların ilk başarılı etkileşimi (dokümantasyon okuma + PR açma) süresi.
   - Hedef:
     - 12 Ay: 2 saat
     - 36 Ay: 1 saat
7. **Governance Compliance Satisfaction (GCS)**
   - Katılımcı geri bildirimlerinde "talimatlar bulunur/işe yarar" algısı.
   - Hedef:
     - 12 Ay: %70 olumlu
     - 36 Ay: %85 olumlu

## Kural Seti

- Hedefe ulaşılamayan KPI için zorunlu eylem:
  - 2 haftalık genişleme kuralı: yeni özellik durdurulur.
  - Kapı/süreç ve dokümantasyon iyileştirme sprinti açılır.
  - Metrik yeniden ölçülüp hedefe dönmeden roadmap genişleme devam etmez.

Not: ölçüm düşüşü iki dönem üst üste devam ederse, [docs/governance/enterprise-change-gates.md](../docs/governance/enterprise-change-gates.md) ve [docs/governance/quality-gates.md](../docs/governance/quality-gates.md) içinde tanımlanan uzun dönem kapı kuralı uygulanır.

## 3/6/12 Aylık KPI Toplama Modeli

- Her 3 ayda bir:
  - Kapı başarı oranları
  - Metrik sapmaları
  - Karar gecikmeleri
  - Rollback prova başarıları
  raporlanır.
- Her 6 ayda bir:
  - AI politikasına karşı gerçek olay incelemesi
  - Açık/kapalı risk listesi
  - Üst seviye “otomasyon otonomi düzeyi” kararı güncellenir.

## 10 Yıllık Yolun Kapanış Ölçümü

- 10. yılda hedef: "SEIS, genişleyen özellikler kadar hızlı büyüyen bir güvenlik ve karar altyapısına sahip midir?" sorusunun yıllık olarak pozitif yanıt vermesi.
- Ölçüm:
  - DTC ve GCR yüksek,
  - RRT düşük,
  - PVR minimum seviyede ve
  - Yeni katkı rotasyonu sürdürülebilir olduğunda başarı kabul edilir.
