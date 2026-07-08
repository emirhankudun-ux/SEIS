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
npm run seis:check
```

## SEIS-SSH Public Access Review

Complete this section when the PR changes SSH, cloud access, GitHub
onboarding, public support, Desktop Cloud Center evidence, or SEIS-SSH
documentation.

Core invariant:

```text
Keep the same server and port.
Ayni sunucu ve baglanti noktasi korunur.
```

- [ ] I did not rename `SEIS-SSH`.
- [ ] I did not add a duplicate visible SEIS SSH alias.
- [ ] I did not change `HostName` or `Port` for `SEIS-SSH` without linked maintainer approval.
- [ ] I did not paste private keys, tokens, passwords, cookies, `.env` values, full hostnames, full IPv4/IPv6 addresses, or provider credentials.
- [ ] No live SSH session was attempted for this PR unless explicit maintainer approval is linked.
- [ ] Live-ready, mobile-24x7-ready, and picker-ready claims are supported by strict evidence or left as `blocked` / `approval-gated`.
- [ ] Public artifacts were checked before attaching them to a public issue or PR.
- [ ] GitHub merge readiness is represented honestly when repository rules keep `mergeStateStatus: BLOCKED`.
- [ ] Signed commit setup, last-push approval, code owner review, and review-thread resolution requirements are acknowledged.
- [ ] Verified signed commits are covered by the public signing guide when required signatures are active.
- [ ] Public review bundle was generated or checked before requesting SEIS-SSH review.

Relevant checks:

```bash
npm run check:seis-ssh-public-pr-template
npm run check:seis-ssh-public-access
npm run check:seis-ssh-public-merge-readiness
npm run check:seis-ssh-public-github-policy
npm run check:seis-ssh-public-signing-guide
npm run check:seis-ssh-public-review-bundle
npm run check:seis-ssh-public-ci-workflow
npm run check:seis-ssh-public-readiness-matrix
npm run check:seis-ssh-public-artifact-hygiene
npm run check:seis-ssh-live-readiness-evidence
```

Support path:

- Issue form: `.github/ISSUE_TEMPLATE/seis_ssh_access.yml`
- Runbook: `docs/deployment/seis-ssh-public-github-access.md`

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
