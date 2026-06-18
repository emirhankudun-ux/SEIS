# SEIS Quality + Security + AI Gates (Operasyonel Görev Seti)

Bu dosya kalite/safety/AI kontrol listesini tanımlar. Kurumsal 4. kapı için teknik dayanak: [governance/enterprise-change-gates.md](enterprise-change-gates.md)

## Kapı 1 — Kalite (Quality)

Minimumlar:

- `npm run check:workspace`
- `npm run seis:check`
- Değişikliği etkileyen modül/test kapsamına göre ek kalite check’i

Kabul:

- Metrik kanıtı olmadan ilerleme yok.

## Kapı 2 — Güvenlik (Security)

Minimumlar:

- `security-guardian` ve CodeQL akışı ilgili yüzeyde çalışır olmalı.
- `SECURITY.md` ile uyumlu risk ve müdahale planı olmalı.

Kabul:

- High/critical risk için düzeltme veya azaltma planı olmadan merge yok.

## Kapı 3 — AI

Minimumlar:

- `docs/ai/policy.md` ile uyumlu policy alanları (en az: `intent`, `risk`, `audit`, `rollback`).
- `npm run check:llm-orchestration-policy`

Kabul:

- AI etkili davranışta policy bypass denemesi varsa gerekçesi ve blok planı eksiksiz olmalı.

## CI Bağlantısı

- `npm run check:seis-enterprise-gates:quality`
- `npm run check:seis-enterprise-gates:security`
- `npm run check:seis-enterprise-gates:ai`

Kaynak bağları:
- [docs/governance/quality-gates.md](../docs/governance/quality-gates.md)
- [docs/governance/enterprise-change-gates.md](../docs/governance/enterprise-change-gates.md)
- [docs/ai/policy.md](../docs/ai/policy.md)
