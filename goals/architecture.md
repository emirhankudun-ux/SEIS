# SEIS Tek Sayfalık Mimarî Manifestosu ve Operasyon Planı
# SEIS Master Operating Architecture

Bu belge, SEIS’in bir sonraki adımında uygulanacak çekirdek kuralları, 5 katman modeli ve kapı yönetimini tek referans halinde toplar.

## 1) Tek Sayfalık Mimarî Manifestosu (Neden + Sınır + Kabul)

### Neden

- SEIS’in büyümesini kısa dönemli özellik üretimi değil; sürdürülebilir, ölçülebilir ekosistem inşası belirlemeli.
- Her modül değişikliği ürün değerini artırırken güvenlik, kalite ve geri dönüş yeteneğini korumalı.
- Dokümantasyon, denetim ve karar izi sistemin ayrılmaz parçası olmalı; gizlice “hız”la geçiş yapılmamalı.

### Sınırlar

- Kalıcı davranış değişikliği sadece `main` üzerine merge edilen PR’larla geçerlidir.
- Yeni bağımlılık/çerçeve değişimi, **geri dönüş planı + sürdürülebilirlik gerekçesi** olmadan kabul edilmez.
- AI ve otomasyon akışları; `intent`, `risk`, `policyVersion`, `audit`, `rollback` alanları olmadan üretime geçmez.
- Kapılar kapalıysa modül/PR `Tamam` (Complete) kabul edilmez; sonuçta kısmi veya blocked kalır.

### Kabul Kriteri (Definition of Complete)

Bir değişiklik/PR aşağıdaki toplam kontrol zincirini karşılamalıdır:

- `quality`, `security`, `AI` teknik kapıları geçsin.
- `doğrulama metrikleri`, `güvenlik`, `dokümantasyon`, `rollback` kurumsal kapıları geçsin.
- 5-katman eşleme, ilgili ADR veya governance kararı ile desteklensin.
- Rollback kanıtı: en azından `rollback-plan` ve hedeflenen `RTO/RPO` özetlenmiş olsun.
- Commit + push + CI zinciri tamamlanmadan yayınlanmış/bitmiş kabul edilmez.

## 2) 5 Katmana Modül Eşleme

| Modül | Primary Layer | Secondary Layer | Zorunlu Sözleşme | Kapı/Kanıt |
| --- | --- | --- | --- | --- |
| Dashboard | Product & Experience | Governance & Quality | `status`, `risk`, `impact` | UI davranış + gözlenebilir ölçüm |
| Goals | Application & Platform | Governance & Quality | `goalId`, `owner`, `priority`, `risk` | Yol sapma/kanıt kaydı |
| Repos | Application & Platform | Cloud & Security | `repoId`, `readiness`, `visibility`, `deploymentTarget` | Readiness + güvenlik denetimi |
| Docs | Governance & Quality | Product & Experience | `decisionId`, `scope`, `effectiveFrom`, `author` | ADR + docs güncellemesi |
| Agents | AI, Data & Automation | Governance & Quality | `intent`, `policyVersion`, `risk`, `rollback`, `owner` | AI policy + denetim izi |

Detay haritası: [`docs/architecture/seis-5-layer-operating-map.md`](../docs/architecture/seis-5-layer-operating-map.md)

## 3) Üç Kapı + CI Bağlantısı (Quality / Security / AI)

### Kapı 1 — Quality

- Komut: `npm run check:seis-enterprise-gates:quality`
- Destekleyici: `npm run check:workspace`, `npm run seis:check`, `npm run check:seis-enterprise-gates`
- Amaç: kalite metrikleri, build/test ve modül davranış tutarlılığı.

### Kapı 2 — Security

- Komut: `npm run check:seis-enterprise-gates:security`
- Destekleyici: security-guardian, CodeQL ve erişim etkileri değerlendirmesi.
- Amaç: gizlilik, token/anahtar yüzeyi ve deployment risklerinin kontrolü.

### Kapı 3 — AI

- Komutlar:
  - `npm run check:seis-enterprise-gates:ai`
  - `npm run check:llm-orchestration-policy`
- Amaç: AI davranışının `ai/policy.md` ile uyumu ve denetim izi zorunluluğu.

### CI Bağlantısı

- Workflow: [`.github/workflows/seis-system-gates.yml`](../.github/workflows/seis-system-gates.yml)
- Job: `enterprise-gates`
- Adım sırası: Quality → Security → AI → LLM policy
- Herhangi biri fail olduğunda PR tamamlanmış sayılmaz.

## 4) Kurum Seviyeli 4 Kapı (Her Değişiklik İçin)

| Kapı | Zorunlu Kanıt | Asgari alan |
| --- | --- | --- |
| Doğrulama Metrikleri | kalite ve runtime kanıtları | `validation` (çalıştırılan komut + çıktı özeti) |
| Güvenlik | güvenlik gözden geçirme | `security-review`, `security-guardian`, `CodeQL`/erişim etkisi |
| Dokümantasyon | değişiklik davranışı kaydı | `docs-update`, ADR veya karar id’i |
| Rollback | geri dönüş planı | `rollback-plan`, `rollback-dry-run`, `RTO/RPO`, `owner` |

Kurumsal kapı formu: [governance/enterprise-change-gates.md](../governance/enterprise-change-gates.md)
CI ile doğrudan eşleşmez; yalnızca teknik kapılara ek olarak doldurulması zorunludur.

## 5) 30 Günlük Sprint Planı (İşlem Bazlı)

### Sprint 1 — Gün 1–7: Manifesto + sözleşme kilidi

- Tek sayfalık manifesto ve 5-katman eşlemesi onaylanır.
- PR şablonunda 4 kapı alanı kapalıysa geçiş engeli netleştirilir.
- Kabul: `goals/architecture.md` ve `governance/enterprise-change-gates.md` tutarlı.

### Sprint 2 — Gün 8–14: Teknik kapı operasyonu

- CI’de quality/security/AI/LLM policy kapıları stabil çalışır.
- Dashboard + Goals için ilk proof-of-run örnekleri eklenir.
- Kabul: en az bir kapı fail ise PR durdurulur.

### Sprint 3 — Gün 15–21: Kurumsal kapılar ve doküman bağlama

- Repos için readiness + güvenlik kontratı tamamlanır.
- Docs/ADR eşleşmesi ve governance indeksini güncelleme yapılır.
- Her modül için rollback dry-run taslağı yazılır.
- Kabul: 4 kurumsal kapı alanı dolu şekilde kanıtlanır.

### Sprint 4 — Gün 22–30: Kapanış + operasyon geçişi

- Agents için AI policy zorunlulukları (gerekliyse insan-onay bayrağı) tamamlanır.
- 5 modül için kapı durumu + run-state + completion-audit güncellenir.
- Kabul: 30 günlük kapanış raporu (evidence + kapı durumu) çıkarılır.

## 6) 90 Günlük Blueprint

### Çekirdek Alan

- 5-katman sözleşmesi tüm modüllere uygulanır.
- Her modül için örnek ADR, proof-of-run ve rollback kanıtı bulunur.

### Güvenlik Kontrol Noktaları

- Security Guardian ve CodeQL standardı CI’de sürekli korunur.
- SSH/erişim yüzeyi ve yüksek-riskli dependency etkileri için throttle kuralı (D1/D2/D3) devrede kalır.

### AI Policy Çerçevesi

- `intent`, `risk`, `audit`, `rollback`, `policyVersion`, `owner`, `requiresHumanApproval` alanları zorunlu hale gelir.
- Kural dışına çıkan akışlarda explicit ihlal kapanış planı bulunur.

## 7) Uygulanabilir Teknik Taslak

### Dosya Yapısı (hedef durumda)

- `goals/architecture.md` (bu belge)
- `governance/quality-gates.md` (3 teknik + CI eşleme)
- `governance/enterprise-change-gates.md` (kurumsal 4 kapı)
- `ai/policy.md` (AI zorunlu alanları)
- `docs/architecture/seis-5-layer-operating-map.md` (katman/mapping)
- `docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md` (durumsal karar)
- `roadmap/seis-next-steps-implementation-pack.md` (uygulanabilir paket)
- `.github/workflows/seis-system-gates.yml` (CI)
- `.github/PULL_REQUEST_TEMPLATE.md` (4 kapı kapanış formu)

### ADR Formatı (zorunlu şablon)

- `Title`
- `Status` (`Proposed` / `Accepted` / `Rejected` / `Superseded`)
- `Context`
- `Decision`
- `Consequences`
- `Security`
- `AI Policy`
- `Validation`
- `Rollback`
- `References`

Bu çalışma için karar izi: [`docs/decisions/adr-0004-seis-next-steps-implementation-pack.md`](../docs/decisions/adr-0004-seis-next-steps-implementation-pack.md)

### God Mode Kanıt Standardı

Bir modül “gelişti” sayılmak için yalnızca dosya eklemiş olamaz. Aşağıdaki üçlü kanıt bulunmalıdır:

- Feature artifact: kaynak dosya, contract veya UI yüzeyi.
- Governance artifact: ADR, roadmap veya enterprise gate formu.
- Validation artifact: checker çıktısı veya completion-audit referansı.

### Örnek Workflow (tek PR)

```yaml
name: SEIS module change
on:
  pull_request:
    branches: [main]
jobs:
  module-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run check:seis-enterprise-gates:quality
      - run: npm run check:seis-enterprise-gates:security
      - run: npm run check:seis-enterprise-gates:ai
      - run: npm run check:llm-orchestration-policy
```

## 8) Çapraz Bağlantılar

- Modül ve kapı durumunu takip et: [docs/governance/seis-god-mode-module-coverage.md](../docs/governance/seis-god-mode-module-coverage.md)
- PR kapanış standardı: [governance/enterprise-change-gates.md](../governance/enterprise-change-gates.md)
