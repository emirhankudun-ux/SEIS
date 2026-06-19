# SEIS Next Steps Uygulanabilir Paketi

Bu paket, bir sonraki adımda yapılacak çalışmayı doğrudan uygulanabilir dosyalar halinde tanımlar.

## 1) Tek Sayfalık Mimarî Manifestosu

Referans: [`goals/architecture.md`](../goals/architecture.md)
İçerik: neden + sınırlar + kabul + 5-katman eşleme + 30/90 gün yol haritası.

## 2) Modül Haritası (Dashboard/Goals/Repos/Docs/Agents)

Referans: [`docs/architecture/seis-5-layer-operating-map.md`](../docs/architecture/seis-5-layer-operating-map.md)
Her modülün 5 katmana bağlı sözleşmesi ve zorunlu alanları bu belgede tek tabloda tutulur.

### Modül Bazlı Uygulama Dilimleri

| Modül | İlk uygulanabilir çıktı | Kabul kanıtı | Rollback notu |
| --- | --- | --- | --- |
| Dashboard | God Mode durum paneli ve kapı özeti | Render/runtime kanıtı + contract eşleşmesi | Panel flag veya önceki dashboard bundle |
| Goals | Hedef ledger + acceptance criteria alanları | `check:seis-goals-evidence-ledger` çıktısı | Ledger kaydını önceki sürüme döndür |
| Repos | Repo health + publish safety görünürlüğü | `check:seis-repo-health-manifest` çıktısı | Publish lane disable + eski manifest |
| Docs | Governance index + ADR zinciri | `check:seis-governance-index` çıktısı | ADR supersede veya doc revert |
| Agents | Agent lane status + safety sınırları | `check:seis-agent-lane-status` çıktısı | Agent lane disable + policy revert |

## 3) Teknik Kapılar + CI

Referans: [`governance/quality-gates.md`](../governance/quality-gates.md)

- Teknik: `quality`, `security`, `AI`, `llm-policy`
- CI: [`.github/workflows/seis-system-gates.yml`](../.github/workflows/seis-system-gates.yml)
- Kapı sırası: quality → security → AI → llm-policy
- Hedef durum: hiçbir teknik kapı blocked değil.

## 4) Kurum Seviyeli 4 Kapı

Referans: [`governance/enterprise-change-gates.md`](../governance/enterprise-change-gates.md)

- Doğrulama metrikleri
- Güvenlik
- Dokümantasyon/ADR
- Rollback

PR kapanışında her biri `passed` veya onaylı `waived` olmalıdır; `blocked` kalırsa modül `Tamam` sayılmaz.

## 5) AI Politikası

Referans: [`ai/policy.md`](../ai/policy.md)

Zorunlu alanlar:

- `intent`, `risk`, `policyVersion`, `audit`, `rollback`, `owner`, `requiresHumanApproval`

`high` risk için insan onayı zorunludur.

## 6) Uygulanabilir Dosya Yapısı

```text
goals/
  architecture.md
governance/
  quality-gates.md
  enterprise-change-gates.md
ai/
  policy.md
docs/
  governance/
    seis-architecture-manifesto.md
    quality-gates.md
    enterprise-change-gates.md
  architecture/
    seis-5-layer-operating-map.md
  decisions/
    adr-0002-seis-5-layer-operating-manifesto.md
roadmap/
  seis-next-steps-implementation-pack.md
  seis-30-90-operating-template.md
.github/
  workflows/seis-system-gates.yml
  PULL_REQUEST_TEMPLATE.md
```

## 7) ADR Formatı (zorunlu şablon)

Her kalıcı kuralsal etki için kullanılır:

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

Örnek: [`docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md`](../docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md)

Bu paketin karar kaydı: [`docs/decisions/adr-0004-seis-next-steps-implementation-pack.md`](../docs/decisions/adr-0004-seis-next-steps-implementation-pack.md)

## 8) Örnek Workflow (tek PR)

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

## 9) 30 Günlük Çalışma Blokları

- Sprint 1 (1–7): manifesto + manifest-kapı ilişkisi kapanışı
- Sprint 2 (8–14): 3 teknik kapının CI’de stabilizasyonu
- Sprint 3 (15–21): 4 kurumsal kapının kanıt kaydı
- Sprint 4 (22–30): 5 modül için proof-of-run + rollback kapanışı

## 10) 90 Gün Kabul Kriteri

- 5 modülde en az birer `proof-of-run` + ADR eşleşmesi + rollback kanıtı
- 3 teknik kapı + 4 kurumsal kapı her sprint sonunda yeniden doğrulanır
- Commit → push → CI zinciri tamamlanmadan `Final` kabulü verilmez

## 11) God Mode Developer Kanıt Matrisi

| Alan | Kaynak kanıt | Checker |
| --- | --- | --- |
| New Features | `apps/seis-demo-web/*`, `content/development/seis-god-mode-work-package.json` | `check:seis-god-mode-work-package` |
| Module Coverage | `content/development/seis-god-mode-module-coverage.json` | `check:seis-god-mode-module-coverage` |
| Goals | `content/development/seis-goals-evidence-ledger.json` | `check:seis-goals-evidence-ledger` |
| Repos | `content/development/seis-repo-health-manifest.json` | `check:seis-repo-health-manifest` |
| Docs | `content/development/seis-governance-index.json` | `check:seis-governance-index` |
| Agents | `content/development/seis-agent-lane-status.json` | `check:seis-agent-lane-status` |
| Release | `content/development/seis-god-mode-release-readiness.json` | `check:seis-god-mode-release-readiness` |
| Completion | `content/development/seis-god-mode-completion-audit.json` | `check:seis-god-mode-completion-audit` |
