# SEIS 365 Gün Vizyon Blueprinti

Bu 365 günlük planın uzun dönem genişlemesi için ana referans: [roadmap/seis-18-60-month-long-horizon-ops-blueprint.md](/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS/roadmap/seis-18-60-month-long-horizon-ops-blueprint.md).

## Genel Çerçeve

SEIS için 365 günlük hedef; hızın değil, güvenli büyümenin ölçeklenebilir hale gelmesidir.
Ölçülebilir odaklar:

- 4 kapı bütünlüğü
- 5-katman modülerliği
- AI policy ve rollback güvenilirliği

## 0–90 Gün (Stabilizasyon)

- 30/90 blueprint’in bitiş ölçütleri uygulanır.
- Dashboard, Goals, Repos, Docs, Agents için kapı geçmişi kurulmuş olur.
- RRT (rollback süresi) kritik akışlarda < 90 dk hedeflenir.

## 90–180 Gün (Derinleştirme)

- Repos ve Docs modüllerinde contract-first veri geçişleri tamamlanır.
- Güvenlik kapısı genişletilir:
  - yüksek risk PR’lerinde otomatik ek kontrol,
  - canary öncesi rollback doğrulama.
- AI policy’de düşük riskli domainler için otomatik kural uygulaması pilotlanır.

## 180–270 Gün (Kurumsal Tekilleşme)

- Kapsamlı `roadmap/seis-long-horizon-kpi-framework.md` raporu her 30 günde bir güncellenir.
- Modül bazlı karar kaydı oranı (%DTC hedef) yükseltilir.
- 3 günlük ve haftalık güvenilirlik periyotlarında gate başarısı düşen alanlarda iyileştirme sprinti açılır.

## 270–365 Gün (Sağlam Büyüme)

- 5 katmanın operasyonel birleşimi: plan, güvenlik ve AI doğrulama otomasyonları tek kontrol yüzeyinde izlenir.
- Topluluk katkısı için PR şablonu + docs akışları sadeleştirilir.
- `main` hattında kapı geçmişi otomasyonla raporlanır; sürdürülebilir olmayan genişlemeler durdurulur.

## Başarı Eşikleri

- Gate completion rate (GCR): 12. ay sonunda %85 üstü.
- Rollback readiness (RRT): 12. ay sonunda 45 dakikanın altı.
- Decision trace coverage (DTC): 12. ay sonunda %70 üzerinde.

## Durdurma Kuralı

- Bir çeyrekte GCR, RRT veya DTC hedeflerinin altında kalınırsa, yeni modül genişlemesi yerine kapı-iyileştirme sprinti açılır.

## Bağlantılar

- Her ayın sonunda: `roadmap/seis-long-horizon-kpi-framework.md` ile karşılaştırmalı rapor.
- Her kritik karar: `docs/governance/enterprise-change-gates.md` üzerinden kapı kaydı.
