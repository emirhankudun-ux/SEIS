# SEIS 30/90 Gün Uygulanabilir Blueprint

SEIS hedefi bu 90 günlük planda çekirdek stabilizasyon + güvenlik + AI policy seviyelerini birlikte büyütmektir.

## 1) Çekirdek Alan

- 5-katman haritası tüm modül eşlemeleriyle tutarlılıkta olur.
- `goals/architecture.md` ile ADR ve CAP dokümanları düzenli güncellenir.
- Dashboard/Goals/Repos/Docs/Agents için en az birer kapı örneği (contract + proof + rollback) üretilir.

### 30-60-90 Çekirdek Çıktıları

| Dönem | Çıktı | Kabul |
| --- | --- | --- |
| 0-30 gün | Manifesto, 5-layer map, PR kapıları, CI bağları | Enterprise gate check geçer |
| 31-60 gün | Her modül için proof-of-run + rollback örneği | Module checker çıktısı var |
| 61-90 gün | Completion audit kapanışı + CI/handoff kanıtı | Run-state `complete` için kanıt hazır |

## 2) Güvenlik Kontrol Noktaları

- `check:seis-enterprise-gates:security` ve güvenlik akışları düzenli koşar.
- Security Guardian + CodeQL + SSH/izin denetimleri yeni değişikliklerin ön koşulu olur.
- Yüksek riskte D1/D2/D3 throttle ile genişleme durdurma ve kurtarma kuralları devrededir.

### Güvenlik Checkpointleri

| Checkpoint | Frekans | Kanıt |
| --- | --- | --- |
| Secrets ve credential yüzeyi | Her PR | Security gate + PR formu |
| CodeQL kapsamı | İlgili kod değişiminde | CodeQL workflow sonucu |
| Deployment/readiness riski | Release adayında | Release readiness manifest |
| Rollback hazırlığı | Her anlamlı değişiklikte | Enterprise rollback kapısı |

## 3) AI Policy Çerçevesi

- `ai/policy.md` alanları (`intent`, `risk`, `audit`, `rollback`, `policyVersion`) zorunlu hale gelir.
- AI davranışında insana dair onay akışları (`requiresHumanApproval`) açıkça işaretlenir.
- Policy ihlal simülasyonu en az bir kez koşarak kapanış raporuna dahil edilir.

### AI Policy Checkpointleri

| Checkpoint | Zorunlu alan | Kapı |
| --- | --- | --- |
| Agent intent | `intent`, `scope`, `owner` | AI gate |
| Risk ve insan onayı | `risk`, `requiresHumanApproval` | AI gate |
| Audit ve rollback | `audit`, `rollback`, `policyVersion` | LLM policy gate |
| Policy ihlali | ihlal nedeni + kapanış planı | Enterprise docs/rollback kapısı |

## Kabul Kuralları (90. Gün Sonu)

- 4 kapıdan biri eksikse modül `In Progress` kalır.
- 3 teknik kapının tamamı kapanmadan module `Complete` vermez.
- Rollback kanıtı olmayan bir akış yayın adayı olmaz.
