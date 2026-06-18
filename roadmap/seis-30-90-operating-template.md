# SEIS 30/90 Uygulanabilir Blueprint

## 1) Tek Sayfalık Manifesto (Neden + Sınır + Kabul)

**Amaç:** SEIS’te kısa teslimat hızından önce uzun vadeli sürdürülebilirlik, güvenlik ve geri alınabilirlik kurmak.

- **Neden:** modüller arasında kontrollü büyüme olmadan teknik borç doğar; bu belge büyümeyi `denetim -> karar -> geri dönüş` sırasına bağlar.
- **Sınırlar:**
  - Ana dağıtım hattı yalnızca `main`.
  - Her davranış değişikliği için dokümantasyon + PR + gate kapanış kanıtı şarttır.
  - AI eylemi policy ve onay olmadan otomasyona geçemez.
  - 5-katman sınırları dışında doğrudan modül bağı bağımsız çalışmaz.
- **Kabul ölçütleri (global):**
  - `docs/governance/enterprise-change-gates.md` içindeki 4 kapı tamamlanmadan publish yok.
  - `quality`, `security`, `ai` kapıları CI’de koşar.
  - En az bir geri dönüş (`rollback dry-run`) kanıtı açık kalır.

## 2) Hedef Dosya Yapısı

- `docs/governance/seis-architecture-manifesto.md`
- `goals/architecture.md` (uygulanabilir ana iskelet)
- `docs/architecture/seis-5-layer-operating-map.md`
- `docs/governance/quality-gates.md`
- `governance/quality-gates.md`
- `docs/governance/enterprise-change-gates.md`
- `governance/enterprise-change-gates.md`
- `docs/ai/policy.md`
- `ai/policy.md`
- `docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md`
- `docs/decisions/adr-0003-seis-evolutionary-governance-throttle.md`
- `roadmap/seis-90-day-blueprint.md`
- `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md`
- `.github/workflows/seis-system-gates.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

## 3) Mevcut Modüller – 5 Katmana Mapping (Dashboard / Goals / Repos / Docs / Agents)

| Modül | Birincil Katman | Destek Katmanları | Boundary | Zorunlu Contract | Kabul |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Experience | Core Domain, Operations & Security | UI davranışı doğrudan eyleme dönmez; event tabanlı geçer | `status`, `risk`, `impact` | Alarm doğruluğu ve kullanıcı davranış ölçümü raporlanır |
| Goals | Core Domain | Knowledge, AI Policy | Yol haritası kararı üretim çağrısı tetiklemeyen karar modelinde kalır | `goalId`, `owner`, `priority`, `risk` | Plan sapması ve hedef izlenebilirliği ölçülür |
| Repos | Core Domain | Operations & Security, Knowledge | Publish/readiness yalnızca contract ile başlar | `repoId`, `readiness`, `visibility`, `deploymentTarget` | Topluluk ve dağıtım uygunluk metrikleri |
| Docs | Knowledge | Experience, Operations & Security | Davranıştan önce karar kaydı zorunlu | `decisionId`, `scope`, `effectiveFrom`, `author` | ADR/karar eşleşme oranı ölçülür |
| Agents | AI Policy & Orchestration | Core Domain, Operations & Security | AI çıktısı policy motorundan geçmeden çalışmaz | `intent`, `policyVersion`, `risk`, `rollback` | Policy uyum oranı ve denetim izi |

Bu tablo, uzun vadede `docs/architecture/seis-5-layer-operating-map.md` ile birebir tutulur.

## 4) 30 Günlük Uygulama Sprintleri (Tekrarlanabilir)

### Sprint 1 (Gün 1–7)
- Manifesto + ADR-0002/0003 eşlemesi tamamlanır.
- 5-katman map’i onaylanır.
- PR şablonu ve enterprise 4 kapı formu zorunlu hale gelir.

### Sprint 2 (Gün 8–14)
- `check:seis-enterprise-gates:quality` ve `check:seis-enterprise-gates:security` PR + main koşulu doğrulanır.
- Dashboard ve Goals için en az bir contract-first örnek kanıtı eklenir.
- Rollback dry-run planı bu iki modül için hazır olur.

### Sprint 3 (Gün 15–21)
- `docs/ai/policy.md` zenginleştirilir (`intent`, `risk score`, `audit`, `rollback`).
- Repos ve Docs modülleri için kapı formu + karar kaydı zorunlu hale getirilir.
- Gate geçişi için ölçüm kanıtı örneği alınır.

### Sprint 4 (Gün 22–30)
- Agents modülü için AI policy ve rollback senaryoları eklenir.
- 30 gün kapanış denetimi: 4 kapı + D1/D2/D3 davranış kurallarıyla açılım durumu değerlendirilir.
- 90 gün başlangıç planı aktif edilir.

## 5) 90 Günlük Blueprint (3 Ana Kolon)

### 5.1 Çekirdek Alan (Core Platform)
- Ana odak: 5-katman boundary standardı ve modül karşılaştırılabilirliğini sabitlemek.
- Ölçüm: `docs/governance/enterprise-change-gates.md` bağlı rollback hazır bulunu­rluğu ve karar izi tamlığı.
- Çıktı: her modül için en az bir kabul raporu (Dashboard/Goals/Repos/Docs/Agents).

### 5.2 Güvenlik Kontrol Noktaları
- Ana odak: security gate’i genişletip yalnızca `security` odaklı iyileştirmeyi değil, tüm PR’ları kapsamak.
- Ölçüm: `check:seis-enterprise-gates:security` koşabilir, CodeQL + `security-guardian` kapanış izleri güncel.
- Çıktı: 90. gün için “risk, kapalı açık, kurtarma planı” seti.

### 5.3 AI Policy Çerçevesi
- Ana odak: policy-enzimli karar akışı; yüksek riskte insan onayı, düşük riskte güvenli otomasyon.
- Ölçüm: `check:seis-enterprise-gates:ai` ve `check:llm-orchestration-policy` kanıtı.
- Çıktı: AI etkili eylemler için en az 1 policy deneme senaryosu + müdahale kaydı.

## 6) Kalite + Security + AI Kapıları (3 Kapı) ve CI Bağlantısı

1. **Kalite Kapısı**
   - Koşul: `npm run check:seis-enterprise-gates:quality`
   - İspat: `check:workspace`, `seis:check`, ilgili modül testleri
2. **Güvenlik Kapısı**
   - Koşul: `npm run check:seis-enterprise-gates:security`
   - İspat: security workflow + CodeQL + güvenlik karar izi
3. **AI Kapısı**
   - Koşul: `npm run check:seis-enterprise-gates:ai`
   - İspat: AI politika alanları (`intent`, `risk`, `rollback`) + policy ihlal senaryoları

CI akışı: `.github/workflows/seis-system-gates.yml`

- `npm run check:seis-enterprise-gates:quality`
- `npm run check:seis-enterprise-gates:security`
- `npm run check:seis-enterprise-gates:ai`

## 7) 4 Kapı / Kurumsal Durdurma Kuralı (Dayanağı)

- **1. Kapı – Doğrulama Metrikleri:** kanıt yoksa merge yok.
- **2. Kapı – Güvenlik:** high/critical risk planı yoksa merge yok.
- **3. Kapı – Dokümantasyon:** davranış belgesi yoksa merge yok.
- **4. Kapı – Rollback:** dry-run/geri alma planı yoksa merge yok.

Uzun dönem eşikler için: `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md` içindeki D1/D2/D3 (`GCR`, `DTC`, `RRT`, `PVR`) tetiklemeleri uygulanır.

## 8) ADR Şablonu (SEIS) ve Örnek Workflow

### ADR Kısa Şablonu

Yeni karar/architectural değişiklik veya birden fazla modülü etkileyen güncellemede en az şu alanlar zorunlu:

- `Status` (`Proposed | Accepted | Rejected | Superseded`)
- `Context` (seçim nedeni, risk ve etkilenen modüller)
- `Decision` (seçilmiş çözüm + limitler)
- `Options` (en az 3 seçenek, nedenleriyle)
- `Consequences` (pozitif/negatif/operasyonel maliyet)
- `Validation` (hangi check'lerin çalışacağı)

**Zorunlu referanslar:**
- `docs/architecture/seis-5-layer-operating-map.md`
- `docs/governance/quality-gates.md`
- `docs/governance/enterprise-change-gates.md`
- `roadmap/seis-18-60-month-long-horizon-ops-blueprint.md`

Örnek dosya: `docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md`

### Örnek Workflow (özet)

1. Değişiklik kararı alındıktan sonra ADR açılır.
2. Etkilenen modül/katmanlar `docs/architecture/seis-5-layer-operating-map.md` ile eşlenir.
3. Değişiklik için minimum kanıtlar hazırlanır:
   - Doğrulama: `npm run check:seis-enterprise-gates:quality`
   - Güvenlik: `npm run check:seis-enterprise-gates:security`
   - AI: `npm run check:seis-enterprise-gates:ai`
4. Rollback senaryosu yazılır (`RTO/RPO`, geri alma adımları).
5. PR açılır; `.github/PULL_REQUEST_TEMPLATE.md` içindeki 4 kapı işaretlenir.
6. `main` entegrasyonu için kapı seti geçtiğinde publish edilir.

```yaml
name: Example SEIS module change flow

on:
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    steps:
      - run: npm run check:seis-enterprise-gates:quality
      - run: npm run check:seis-enterprise-gates:security
      - run: npm run check:seis-enterprise-gates:ai
```

Bu workflow, `main` dışında yalnızca doğrulama ve rollback izi tutulduktan sonra PR ilerletilebileceğini varsayar.
