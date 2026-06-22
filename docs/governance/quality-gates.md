# Kurumsal Kalite Kapıları (Quality + Security + AI)

SEIS quality gates keep repository changes reviewable, secure, documented, and aligned with the long-term operating contract.

## Kalite Kapısı

Required checks include:

```bash
npm run check:workspace
npm run seis:check
npm run check:seis-enterprise-gates:quality
```

### Doğrulama Metrikleri Kapısı

- Kapı kapanmazsa kalite kanıtı yetersiz kabul edilir.
- Zorunlu alan: sonuç özeti + kalan blocker listesi.

## Kurumsal 4 Kapı (Her Değişiklik)

Every meaningful change must pass validation, security, documentation, and rollback review before it is described as complete.

### Doğrulama Metrikleri Kapısı

Validation evidence must list the command that was run, the result, and any remaining blocker.

## Güvenlik Kapısı

Security review must protect secrets, keys, SSH access, cloud permissions, and least-privilege boundaries.

```bash
npm run check:seis-enterprise-gates:security
```

### Güvenlik Kapısı

Institutional security gate: do not weaken security for convenience and do not claim protection without current evidence.

### Güvenlik Kapısı Kanıtları

- `security-guardian` çalıştırma çıktısı
- CodeQL tarama izi
- `security.md` uyumluluk onayı

## AI Kapısı

AI systems must be observable, policy-bound, and aligned with the SEIS Master Prompt.

```bash
npm run check:seis-enterprise-gates:ai
```

### AI Kapısı

- [docs/ai/policy.md](../../docs/ai/policy.md) alanları (`intent`, `risk`, `audit`, `rollback`, `policyVersion`) doldurulmuş olmalı.
- İhlal senaryosu varsa kapanma ve düzeltme izi eklenmeli.

```bash
npm run check:llm-orchestration-policy
```

## Üç Kapı Uygulama Listesi ve CI Bağlantısı

1. Quality
   - `npm run check:seis-enterprise-gates:quality`
2. Security
   - `npm run check:seis-enterprise-gates:security`
3. AI
   - `npm run check:seis-enterprise-gates:ai`

`check` akışlarının pipeline karşılığı:

- [.github/workflows/seis-system-gates.yml](../../.github/workflows/seis-system-gates.yml)

### CI Step Mapping (Docs Layer)

- Quality → `Quality` adımı
- Security → `Security` adımı
- AI → `AI` adımı
- LLM Policy → `LLM policy` adımı

Bu adımların birinde `failed` varsa, tüm dokümantasyon kapıları da `blocked` kalır; sadece tamamı geçtiğinde PR tamamlanmış sayılabilir.

## Uzun Vadeli Kapı Rejimi

Long-horizon governance uses D1, D2, and D3 throttle levels and is tracked in roadmap/seis-18-60-month-long-horizon-ops-blueprint.md.

- **D1:** kalite sapması → kapı iyileştirme sprinti
- **D2:** ikinci tekrar eden sapma → yeni özellik duraklatılır
- **D3:** kritik sapma → güvenlik ve rollback öncelikli acil kapanış

## Gate Durumlandırma (God Mode)

Değişiklik tamamlanmış sayılırken:

| Kapı | Durum |
| --- | --- |
| Kalite Metrikleri | `passed` / `waived` / `blocked` |
| Güvenlik | `passed` / `waived` / `blocked` |
| AI | `passed` / `waived` / `blocked` |
| Docs/ADR | `passed` / `waived` / `blocked` |
| Rollback | `passed` / `waived` / `blocked` |

- Tüm kapılar en az `passed` veya işbaşılı `waiver` olmadan `complete` çıkışı alınmaz.
- Bir kapıda `blocked` kaldıkça Dashboard/Goals/Repos/Docs/Agents modül durumu “kısmi” kalır.
- `quality:governance` çıktısında tamamlama durumu, bu tabloyla uyumlu olmalıdır.
