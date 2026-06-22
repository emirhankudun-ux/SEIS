# SEIS 5-Layer Operating Map

## Layer Tanımları

1. **Product and experience**: doğrudan kullanıcıya bakan ekranlar, izleme ve deneyim akışı.
2. **Application and platform**: uygulama çekirdeği, deployment readiness, temel operasyon.
3. **AI, data, and automation**: AI ajanları, policy motoru, otomasyon ve model kanıtları.
4. **Cloud and security**: dağıtım altyapısı, erişim, hardening ve güvenlik kontrol yüzeyleri.
5. **Governance and quality**: karar kayıtları, kalite kapıları, ADR ve audit dokümantasyonu.

## Repository Surface Eşleme

| Layer | Repository surface | Ana Sınır |
| --- | --- | --- |
| Product and experience | `apps/seis-demo-web`, `apps/seis-core`, `docs/design` | Davranış doğrudan üretim eylemine çevrilmeden önce governance pass gerekir |
| Application and platform | `apps`, `packages`, `server` | Deployment readiness ve modül kapsamı garanti edilir |
| AI, data, and automation | `plugins`, `data`, `scripts` | AI policy ve rollback metadata zorunludur |
| Cloud and security | `docs/deployment`, `scripts`, `.github/workflows` | Access control ve güvenlik taramaları aktif olur |
| Governance and quality | `docs/governance`, `governance`, `docs/decisions`, `roadmap` | 4 kapı formu + ADR zinciri tamamlanır |

## Dashboard / Goals / Repos / Docs / Agents Map

| Modül | Primary Layer | Required Contract | Kanıt |
| --- | --- | --- | --- |
| Dashboard | Product and experience | `status`, `risk`, `impact` | UI davranış testi + ölçüm izi |
| Goals | Application and platform | `goalId`, `owner`, `priority`, `risk` | Hedef-eşleme + plan sapma kaydı |
| Repos | Application and platform | `repoId`, `readiness`, `visibility`, `deploymentTarget` | Readiness kanıtı + erişim kontrolu |
| Docs | Governance and quality | `decisionId`, `scope`, `effectiveFrom`, `author` | ADR + dokümantasyon kapanışı |
| Agents | AI, data, and automation | `intent`, `policyVersion`, `risk`, `rollback` | Policy + AI audit + rollback testi |

## Modül Bağlılıkları ve Geçiş İlkesi

- Üst katman değişikliği, alttaki kapıların geri bildirimini beklemelidir.
- Her modül bir sonraki katmanla sadece `contract` ile konuşur, doğrudan bypass yoktur.
- 5-katman eşlemeleri `goals/architecture.md` ve ADR zinciriyle eşlenir.
