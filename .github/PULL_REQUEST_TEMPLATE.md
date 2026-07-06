## Summary

What does this PR change, and why does it matter for SEIS?

## Scope

- [ ] AI / agents / MCP / skills / plugins / LLM workflows
- [ ] Engineering / platform / full stack / mobile / desktop
- [ ] Data / ML / governance / observability
- [ ] Design systems / UX / accessibility / calm technology
- [ ] Documentation / open source governance
- [ ] Security / dependency / infrastructure

## Architecture Fit

Explain how this change fits the SEIS platform model. For new features,
describe why the long-term maintenance cost is justified.

## Master Prompt Alignment

- [ ] Protects existing user work and avoids destructive actions without explicit maintainer approval.
- [ ] Prioritizes security, privacy, architecture, documentation, and validation before feature scope.
- [ ] Uses the SEIS Master Prompt change checklist when the change affects architecture, security, AI/agent workflows, cloud/automation, product/design, documentation, or quality gates.

Reference:

- [`docs/governance/seis-master-prompt.md`](docs/governance/seis-master-prompt.md)
- [`docs/governance/seis-master-prompt-change-checklist.md`](docs/governance/seis-master-prompt-change-checklist.md)

## Public Readiness

- [ ] I ran or intentionally scoped the equivalent of `npm run check:seis-public-readiness`.
- [ ] Public docs command references stay wired through `npm run check:public-doc-command-wiring` when public onboarding/readiness docs change.
- [ ] Demo mode remains no-key and does not require provider keys, real SSH credentials, database setup, or auth.
- [ ] This PR does not add secrets, private vault material, real host credentials, or browser-visible provider keys.
- [ ] Any AI, SSH, deployment, GitHub, Pages, or release claim is labeled demo/planned/blocked/auth-gated unless current evidence proves it.

## Validation

List the checks you ran:

```bash
npm run check:seis-enterprise-gates:quality
npm run check:seis-enterprise-gates:security
npm run check:seis-enterprise-gates:ai
npm run check:llm-orchestration-policy
npm run check:seis-master-prompt-report
npm run check:seis-master-prompt
npm run check:open-source-governance
npm run check:seis-public-readiness
npm run check:public-doc-command-wiring
npm run seis:check
```

Quality/Safety evidence (choose one per row):

- Enterprise gate set: [ ] quality [ ] security [ ] ai [ ] ai-policy
- 4-kapı formu: `docs/governance/enterprise-change-gates.md`’de kapı kapanışları işaretlendi.
- Rollback plan: ilgili ticket / ADR / runbook linki:

## Seçtiğiniz Kapılar (Zorunlu 4 Kapı)

Değişikliğiniz bu 4 kapıdan geçtiyse işaretleyin (kapanışta tüm kutular dolu olmalı):

- [ ] Doğrulama Metrikleri Kapısı
  - `npm run check:workspace` ve değişim ölçeğine göre uygun ek kalite/metrik check
- [ ] Güvenlik Kapısı
  - `security-guardian` ve ilgili CodeQL akışını etkilediyseniz kanıt notu eklediniz
- [ ] Docs Kapısı
  - Davranış etkisi varsa güncel dokümantasyon/decisions kaydı eklediniz
- [ ] Rollback Kapısı
  - Geri alma planı, etki alanı, rollback adımı ve RTO/RPO varsayımı tanımlandı

## God Mode Kapı Durumları

Kapanış satırında her satırı doldurun:

- Doğrulama Metrikleri Kapısı: passed / waived / blocked
- Güvenlik Kapısı: passed / waived / blocked
- Docs Kapısı: passed / waived / blocked
- Rollback Kapısı: passed / waived / blocked
- AI Kapısı: passed / waived / blocked
- CI Kapısı (quality/security/AI): passed / blocked

En az bir kapı `blocked` ise PR tamamlanmış kabul edilmez.

Örnek:
- PR tipi: Özellik / Refactor / Dokümantasyon / Security / AI
- Modül etkisi: Dashboard / Goals / Repos / Docs / Agents / Other
- Risk seviyesi: P0 / P1 / P2
- AI etkisi: Yok / Policy onayı / İnsan onayı
- Rollback senaryosu: `<kısa plan + planlanan geri dönüş zamanı>`

## Risk

- Security or privacy impact:
- Dependency or runtime impact:
- Rollback plan:

## Checklist

- [ ] Targets `main` through a short-lived branch or fork PR.
- [ ] Keeps the change small, reversible, and reviewable.
- [ ] Updates docs when behavior, policy, or user workflow changes.
- [ ] Does not commit secrets, private data, `.env` files, or credentials.
- [ ] Does not install unused SDKs, runtimes, or dependencies.
- [ ] Does not claim validation that was not actually run.
- [ ] Discloses material AI assistance when relevant.
