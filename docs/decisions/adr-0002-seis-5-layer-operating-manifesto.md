# ADR 0002: SEIS 5-Layer Operating Manifesto

Status: Accepted

## Context

SEIS, modüler olarak büyüyen bir ekosistem olduğu için yalnızca teknik başarıya değil, sürdürülebilir yönetişim, güvenlik ve geri dönüş yönetimine dayanmalıdır. Bu nedenle manifestonun tek bir belgeye değil, aynı anda uygulanabilir dosya yapısına bağlanması gerekir.

Bu karar, 5-layer operating model prensibini kurumsal kapı ve kalite akışıyla birlikte uygular.

## Decision

SEIS architecture will be governed through a 5-layer operating map and the following rule: her değişiklik için bir modül haritası, üç teknik kapı (quality/security/AI) ve kurumsal 4 kapı tamamlanmadan kabul edilmez.

## Consequences

- Modül-katman eşleme tek noktada tutulur ve güncel tutulur.
- Roadmap, policy ve gate dokümanları aynı kabul zincirine bağlanır.
- Gereksiz kapsamlı değişiklik yerine küçük, geri dönüştürülebilir adımlar öne alınır.

## Security

- Security review, deployment öncesi ve AI yüksek riskli akışlarında mutlaka kapatılır.
- Rollback hedefleri (`RTO/RPO`) ADR kararında belirtilir.

## AI Policy

- `intent`, `risk`, `policyVersion`, `rollback`, `audit`, `owner` alanları zorunlu hale gelir.
- İnsan onayı gerektiren AI akışları açıkça işaretlenir.

## Validation

- `docs/architecture/seis-5-layer-operating-map.md`
- `goals/architecture.md`
- `docs/governance/quality-gates.md`
- `docs/governance/enterprise-change-gates.md`
- `governance/quality-gates.md`
- `governance/enterprise-change-gates.md`
- `.github/workflows/seis-system-gates.yml`
- `npm run check:seis-enterprise-gates:quality`
- `npm run check:seis-enterprise-gates:security`
- `npm run check:seis-enterprise-gates:ai`

## Rollback

- Her kapatma aksiyonunda geri dönüş adımı tanımlanır.
- `rollback-plan`, `rollback-dry-run`, `owner` alanları governance formunda doldurulur.

## References

- [governance/enterprise-change-gates.md](../governance/enterprise-change-gates.md)
- [docs/ai/policy.md](../../docs/ai/policy.md)
