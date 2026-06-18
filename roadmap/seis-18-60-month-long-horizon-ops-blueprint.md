# SEIS 18-60 Aylık Uzun Vade Operasyon BluePrinti

Bu belge, 365 günlük uygulama planını, 5-layer mimari modelini ve 4-kapı kurumsal denetimi
uzun dönemli büyümenin dayanağı haline getirmek için genişletir.

## 1) Odak Bildirimi (1 Yıldan Sonra Neyi Koruyacağız?)

SEIS’in uzun vadeli hedefi özellik eklemek değil, **karar doğruluğunu, güvenliği ve geri
alınabilirliği bozmadan ölçeklenebilir bir ekosistem** oluşturmaktır.

- `main` hattı tek teslim hattı olarak kalır.
- Kapı geçişleri otomatik ve zorunlu kalır.
- AI davranışı policy altında kalır; otomasyon, policy onayı olmadan işlem başlatmaz.
- Her modülün davranış değişikliği, karar kaydıyla doğrulanır.

## 2) Zaman Ufukları ve Metrik Eşiği

### 0–12 Ay (Konsolidasyon)

Amaç: 30/60/90 ritmiyle stabiliteyi sabitlemek.

- İlk hedef: 90 günlük hedeflerin tamamı; 5 katman eşlemeleri.
- Kapı başarı oranı hedefi: `GCR >= %85`.
- Kritik geri dönüş hedefi: `RRT < 45 dk`.
- Karar izi hedefi: `DTC >= %70`.

Kilit teslimler:
- Dashboard, Goals, Repos, Docs, Agents için en az 1 adet contract-first sınır kanıtı.
- En az 1 gerçek rollback dry-run (yalnızca prova) kaydı.
- `roadmap/seis-long-horizon-kpi-framework.md` ölçüm formatında ilk 3 aylık karşılaştırma.

### 12–24 Ay (Sağlamlaşma)

Amaç: otomasyonun hızını artırırken karar yüzeyini bozmaz hale getirmek.

- Modül başına maturity modeli başlatılır: `Operate -> Govern -> Optimize`.
- Kapı hedefi: `GCR >= %90`.
- Güvenlik hedefi: `MTSC < 24 saat`, `PVR < 2/1000`.
- Operasyon hedefi: yüksek riskli PR’lerde rollback prova zorunluluğu.

Kilit teslimler:
- Her modül için en az 2 tane 5-katman geçiş kanıtı.
- AI policy ihlal ve deny loglarının 30 günlük trendi.
- Topluluk akışları (issue, PR, discussion) için onboarding süresi iyileştirme planı.

### 24–36 Ay (Genişletilmiş Otonomi)

Amaç: kurallı otomasyon payını yükseltmek.

- Düşük riskli AI eylemlerinde policy-otomatik karar akışı, yüksek riskte insan onayı zorunlu.
- Kapı hedefi: `GCR >= %92`.
- Güvenlik hedefi: `MTSC < 12 saat`, `PVR < 1/1000`.
- Operasyon hedefi: 60+ günde bir otomatik geri dönüş tatbikatı.

Kilit teslimler:
- Repos + Docs akışlarında contract testleri ve değişiklikte dokümantasyon zorunluluğu.
- AI ve güvenlik kapıları için ayrı incident postmortem şablonu.
- `docs/governance/enterprise-change-gates.md` ile uyumlu “kapı başarısızsa genişleme durur” davranışı.

### 36–48 Ay (Platformu Güçlendirme)

Amaç: bir modülden çok bir sistem ailesi gibi yönetim.

- Operasyon hedefi: hata saptığında sistemin otomatik “safety pause” açması.
- Kapı hedefi: `GCR >= %94`.
- Metrik hedefi: `RRT < 30 dk`.

Kilit teslimler:
- 3 aylık otomasyon audit raporları.
- Ana karar metrikleri ile maliyet/performans/erişilebilirlik ilişkisi.
- `Roadmap + KPI` senkronizasyonunun haftalık rapora taşınması.

### 48–60 Ay (Kurumsal Olgunluk)

Amaç: büyümeyi güvenli hızda sürdüren sistem.

- Kapı hedefi: `GCR >= %95`.
- Güvenlik hedefi: `MTSC < 8 saat`, `PVR < 0.5/1000`.
- Kullanıcı/katkıcı hedefi: `FMIT < 60 dk`.

Kilit teslimler:
- 5 layer + 4 kapının denetim yüzeyi tek izleme paneline entegre olur.
- AI policy düzeyi 2 veya üstüne geçiş: kararların >80%’inde policy etiketleme ve rollback alanı.
- 5 yıllık demo ve ürün mimarisinde sürdürülebilir hızlanma: özellik değil güven kalite trendi.

## 3) Modül Büyüme Kuralları (12, 24, 36 Ay Blokları)

Aşağıdaki tablo her 12 aylık blokta öncelik sırasını belirler:

| Dönem | Dashboard | Goals | Repos | Docs | Agents |
| --- | --- | --- | --- | --- | --- |
| 12–18 Ay | Mevcut kalite ölçümleme | Yol haritası disiplinini kapılara bağlama | Sözleşme yüzeyi stabilizasyonu | Davranış-ADR eşlemesi | Policy enforcement temel akışı |
| 18–24 Ay | Risk uyarı otomasyonu | İleri hedef-trace | Branch/publish akışı kontrol | Decision log kalitesi | Risk sınıflaması + rollback alanı |
| 24–36 Ay | UX + erişilebilirlik karar metrikleri | Üretim etkisi olan hedeflerin kanıtı | İçe/dışa entegre kalite kontratı | Topluluk bilgi yüzeyi sadeleşmesi | Policy-first otomasyon + insan-onayı eşiklendirme |
| 36–60 Ay | Stratejik gösterge paneli | Ürün-kurulum geri besleme | Reproducible release ve teslim ritmi | Kurumsal dokümantasyon standardı | Gelişmiş policy enforcment ve otomatik geri alma testleri |

## 4) 5-Katman Olgunluk Ölçütü (Zorunlu)

Her katman için 12 aylık minimum olgunluk:

- **Experience:** erişilebilirlik, hata geri bildirimi, deneyim metrikleri her sprintte ölçülür.
- **Core Domain:** karar-etiketli state geçişleri, domain boundary ihlali alarmı.
- **Knowledge:** ADR/DOC eşleme oranı hedefin altında ise kapı reddi.
- **AI Policy & Orchestration:** policy bypass denemeleri için deny logu ve insan onayı.
- **Operations & Security:** rollback prova, güvenlik kontrol ve canary testleri.

Kapı şartnamesi: herhangi bir katmanda kritik gerileme (`-20%`) varsa yeni özellik planı askıya alınır.

## 5) KPI ve Durdurma Mekanizması (Düzenleyici Kural)

### D1/D2/D3 Tetik Seviyeleri

- **D1:** `GCR`, `DTC`, `RRT` veya `PVR` ölçümlerinin bir dönemde hedefin %10 altında kalması.
- **D2:** D1’in ardışık iki dönemde tekrarı; yeni modül genişleme planları beklemeye alınır.
- **D3:** `RRT` veya `PVR` kritik seviyede kalırsa; güvenlik/rollback odaklı planlar dışında yeni feature dağıtımı durur.

- **Her 30 günde:** GCR, RRT, DTC, PVR haftalık özetlenir.
- **Her 90 günde:** hedef sapması varsa yalnızca süreç iyileştirme sprinti açılır.
- **Dondurma Kuralı:** iki ardışık denetimde eşik düşerse, en az bir sprint sadece kapı/rollback iyileştirmesine ayrılır.
- **Açılım Kuralı:** eşiğe dönülmeden yeni modül kapasitesi açılmaz.

## 6) 365 Gün ve Sonrası için Bağlantılar

- `roadmap/seis-365-day-blueprint.md`: kısa dönem tamamlanma planı
- `roadmap/seis-long-horizon-strategy.md`: 10 yıllık vizyon hattı
- `roadmap/seis-long-horizon-kpi-framework.md`: eşik ölçüm dili
- `docs/governance/quality-gates.md`, `docs/governance/enterprise-change-gates.md`: teknik kapılar
- `docs/architecture/seis-5-layer-operating-map.md`: katman haritalama referansı

## 7) Büyük Teknoloji ve Büyük AI Benchmark Uyarlaması (5 Yıllık)

SEIS SSH erişim modelini, Apple / Google / büyük AI firmalarının işletim kalıplarına eşleştirmek için bu blueprint zorunlu olarak aşağıdaki eksende ilerler:

- **Apple yaklaşımı (UX + güvenlik):**
  - Tek görünür hedef: `SEIS-SSH`
  - Cihaz-bağımsız cloud-first erişim
  - Secret dışı, sade ve güvenli varsayılanlar

- **Google yaklaşımı (policy-as-code):**
  - `deploy/seis-ssh-access-model.json` + `deploy/seis-ssh-cloud-roadmap.json` + `scripts/*` üçlüsü bir kontrol birimi olarak çalışır.
  - Drift yalnızca rapor olarak değil, kapanış şartı olarak işlenir.

- **Büyük AI yaklaşımı (AI-plane güvenliği):**
  - AI araç yüzeyi policy-korumalıdır.
  - Komut ve araç izleri denetlenir.
  - Long-running işlerde state-koruma ve hızlı kurtarma ana prensiptir.

### Uygulama Dayanağı

- Yıllık olgunluk manifestosu: `deploy/seis-ssh-5-year-enterprise-benchmark.json`
- Yürütme gate’i: `npm run check:seis-ssh-enterprise-benchmark`
- CI içinde kapanış: `npm run quality:governance`

### 5 Yıllık KPI Sözleşmesi

- **Y1:** erişim doğruluk oranı ve kurtarma davranışı
- **Y2:** politika drift raporu + yeni cihaz bootstrap süresi
- **Y3:** restore ve rollback otomasyonu
- **Y4:** AI araç risk sınıflaması + yanlış pozitif düşüşü
- **Y5:** availability ve kritik olay MTTR hedefleri

Bu blueprint, ürün tasarımından çok daha önce “tek yüzey + tek policy + tek gate” ilkesini işletir.
