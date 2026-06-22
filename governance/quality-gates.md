# SEIS Quality + Security + AI Gates Operasyon Rehberi
# SEIS Quality + Security + AI Gates (Operasyonel Görev Seti)

Bu belge, teknik ve kurumsal kapıların nasıl uygulanacağını tek yerde toplar.

## Teknik Kapılar (CI’da Çalışan 3 Kapı)

## Kalite Kapısı

## Kalite Kapısı (Quality)

## Kapı 1 — Kalite

## Güvenlik Kapısı

## Kapı 2 — Güvenlik Kapısı

## AI Kapısı

## Kapı 3 — AI Kapısı

### 1. Quality Kapısı

- Komut: `npm run check:seis-enterprise-gates:quality`
- Destek komutları:
  - `npm run check:workspace`
  - `npm run seis:check`
  - `npm run check:seis-enterprise-gates` (tam set)
- Kabul: kalite ölçümü, lint/test ve doğrulama metrikleri tamamlanmalı.

### 2. Security Kapısı

- Komut: `npm run check:seis-enterprise-gates:security`
- Destek komutları/kanıtlar:
  - security-guardian çıktısı
  - CodeQL sonuçları (etkileniyorsa)
  - `security.md` uyum kontrolü veya ek erişim değerlendirmesi
- Kabul: yüksek riskli kalıntı kalmamalı, yoksa azaltma planı eklenmeli.

### 3. AI Kapısı

- Komut: `npm run check:seis-enterprise-gates:ai`
- Komut: `npm run check:llm-orchestration-policy`
- Kabul: [ai/policy.md](../ai/policy.md) zorunlu alanları doldurulmuş olmalı.

## CI Eşleme (`.github/workflows/seis-system-gates.yml`)

- `Quality gate` → `npm run check:seis-enterprise-gates:quality`
- `Security gate` → `npm run check:seis-enterprise-gates:security`
- `AI gate` → `npm run check:seis-enterprise-gates:ai`
- `LLM policy gate` → `npm run check:llm-orchestration-policy`

Tek bir teknik kapının `failed` olması `passed` kabulünü engeller.

## Kurum Seviyeli 4 Kapı (Her PR için Zorunlu)

## Kurumsal 4 Kapı (Her PR için Zorunlu)

Teknik kapılar geçse bile aşağıdaki 4 kapı PR içinde açıkça işaretlenmelidir:

- Doğrulama Metrikleri
- Güvenlik
- Dokümantasyon/ADR
- Rollback

Her kapı için son durum `passed` / `waived` / `blocked` olarak kaydedilir.

Kurumsal form: [enterprise-change-gates.md](./enterprise-change-gates.md)

## Durum Şeması (God Mode)

| Kapı | Durum | Zorunlu mu? |
| --- | --- | --- |
| Quality | `passed` / `waived` / `blocked` | Evet |
| Security | `passed` / `waived` / `blocked` | Evet |
| AI | `passed` / `waived` / `blocked` | Evet |
| Docs/ADR | `passed` / `waived` / `blocked` | Evet |
| Rollback | `passed` / `waived` / `blocked` | Evet |
| CI | `passed` / `blocked` | Evet |

Tekrarlanan başarısızlık veya drift tespitinde D1/D2/D3 kalite-güvenlik throttle moduna geçilir (detay: [roadmap/seis-18-60-month-long-horizon-ops-blueprint.md](../roadmap/seis-18-60-month-long-horizon-ops-blueprint.md)).

## İlişkili Dosyalar

- [goals/architecture.md](../goals/architecture.md)
- [governance/enterprise-change-gates.md](./enterprise-change-gates.md)
- [docs/architecture/seis-5-layer-operating-map.md](../docs/architecture/seis-5-layer-operating-map.md)
- [docs/governance/seis-architecture-manifesto.md](../docs/governance/seis-architecture-manifesto.md)
- [ai/policy.md](../ai/policy.md)
