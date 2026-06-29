# SEIS 61–120 Aylık Uzun Vade Operasyon Blueprinti (Yıl 6–10)

Bu belge, 5. yıldan itibaren uygulanacak 61–120 aylık ikinci aşama operasyon planını
belirler. İlk 60 ayda kurulan 4 kapı / 5 katman disiplininin korunması ve
güçlendirilmesi temel koşuldur.

## 1) Zamanlama ve Sınırlar

- **Toplam hedef alanı:** 61–120 ay (yaklaşık yıl 6–10), mevcut planın ikinci aşaması.
- **Kural:** 5 yılda kazanılan ölçü, güvenlik, rollback ve karar izi disiplini bu dönemde
  gevşetilmeden genişler.
- **Temel ön koşul:** “D1/D2/D3” kapı modeli bozulmadan kalmalı; kritik gerilemede
  genişleme durdurulmalıdır.

## 2) Yıl Grupları (5 yıllık ikinci katman)

| Dönem | Ana Amaç | Başarı İfadesi |
| --- | --- | --- |
| 61–72 ay | Genişletilmiş otonomi ve federatif pilotlar | Düşük riskli modüllerde policy-tabanlı otomasyon + insan onayıyla %70+ kural uygunluğu |
| 73–84 ay | Kendi kendini iyileştiren operasyon | Mevcut rollback ve canary testleriyla olay kapanış süresinde kalıcı iyileşme |
| 85–96 ay | Topluluk ve ekosistem ölçeklenmesi | Topluluk onboarding ve PR döngüsü sürdürülebilir hızda, riskli akışlarda denetim kapanır |
| 97–108 ay | Kurumsal kalite standardizasyonu | KPI panosu, risk skorları ve policy ihlal kalıpları birlikte işletilir |
| 109–120 ay | SEIS suprematik stabilite | 10 yıl sonunda “karar kalitesi” ve geri dönüş güvenliği ana kalite metrikleriyle ölçülür |

## 3) Süreç Kapıları (Uzun Vadeli)

### 61–72 ay (Faza 6) – Güvenli Federasyon

- SEIS modül yüzeyleri arası birlikte çalışabilirlik planı çıkarılır.
- Yüksek riskli kararlar için insan onayı ve karar izi zorunlu kalır.
- KPI hedefi: `GCR ≥ %95`, `RRT ≤ 30 dk`.

### 73–84 ay (Faza 7) – Policy-led Otonomi

- Kural altı düşük risk akışları için policy-driven otomasyon genişletilir.
- İnsan-onaylı yüksek risk akışları için kapı süresi < `48 saat`.
- KPI hedefi: `PVR < 0.5/1000`, `DTC ≥ %82`.

### 85–96 ay (Faza 8) – Operasyonel Öğrenme Döngüsü

- Modül bazlı karar ve olay analizleri yılda en az iki defa yayımlanır.
- Hatalı karar kalıplarında geri alma ve eğitim kapanışı zorunlu olur.
- KPI hedefi: `MTSC ≤ 6 saat`, `RRT ≤ 24 dk`.

### 97–108 ay (Faza 9) – Kurumsal Dayanıklılık

- Tekil modül başarısı yerine sistem düzeyinde dayanıklılık ölçülür.
- Tüm ana akışlarda erişilebilirlik, güvenlik, maliyet ve hız dengesi birlikte izlenir.
- KPI hedefi: `GCR ≥ %97`, kritik akışlarda 0 kritik yanlış pozitif.

### 109–120 ay (Faza 10) – Platform Kurumsallaşma

- 10. yıl hedefi: canlı sistemin “özelleştirilmiş, hızlı, geri döndürülebilir ve
  politikalı” bir yapı olması.
- Teknik borç kapama eylemleri yıllık olarak planlanır; yeni eklenti yalnızca kapanış planı
  ile onaylanır.
- KPI hedefi: `DTC ≥ %90`, `PVR < 0.2/1000`, güvenlik olaylarında `RRT ≤ 10 dk`.

## 4) 5 Katman Üzerinden 10 Yıllık Beklenen Olgunluk

- **Experience:** erişilebilirlik, performans ve premium deneyim hedefleri kalite barajı altında kalmaz.
- **Core Domain:** veri/özellik akışları sözleşme ile kanıtlanır.
- **Knowledge Layer:** ADR, proof kayıtları, karar izi ve arşiv hiyerarşisi korunur.
- **AI Layer:** policy-first ve denetimli karar modeli geri çekilmeden geliştirilir.
- **Operations/Security:** rollback, red-team senaryosu, denetim ve güvenlik kapısı tek panoda kalır.

## 5) Kaynak Bağlantıları

- Birincil uzun dönem çerçeve: `roadmap/seis-long-horizon-strategy.md`
- İlk operasyon blueprint'i: `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md`
- KPI çerçevesi: `roadmap/seis-long-horizon-kpi-framework.md`
- Uygulama ritmi: `docs/goals/cycle-plan.md`, `docs/goals/horizon-map.md`

## 6) 6–10 Yıl İlerleme ve Sorumluluklar

- Her 6 aylık blokta kapı metrikleri ve karar izleri rapora alınır.
- Yeni özellik/uygulama ancak rollback planı ve öğrenme kapanışıyla onaylanır.
- Yüksek riskli akışlarda insan-onayı kapısı devre dışı bırakılmaz.
