---
type: governance
module: seis-github
status: draft
visibility: public
updated: 2026-06-29
---

# Branch Strategy

## Purpose
GitHub kaynaklı geliştirme akışını tutarlı ve güvenli tutmak.

## Branch model
- `main`: sadece korunan, doğrulanmış ve reviewed değişiklikler.
- `feat/*`, `fix/*`, `chore/*`, `docs/*`: scope-based review branches.
- `hotfix/*`: acil ve küçük riskli düzeltmeler.
- `release/*`: hazırlanmış ve doğrulanmış paketleme adımları için.

## Rules
- Direkt `main` push yasak.
- Büyük refactor için kısa, odaklı PR parçaları.
- Branch adı içinde görev bağlamı ve tarih/sürüm izi.
- Force-push yalnızca yerel geçici branch düzeltmelerinde ve açık onay ile.

## Merge safety
- İnsan-onaylı PR olmadan branch kapanmaz.
- Dokümantasyon, scripts ve güvenlik koşulları eş zamanlı geçerlilikte güncellenir.
- Her adımda `git status --short` ve değişiklik özeti bırakılır.
