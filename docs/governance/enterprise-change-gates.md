# Kurumsal Değişiklik Kapıları

SEIS enterprise changes must pass four mandatory gates before they are treated as complete.

## Kapı 1 — Doğrulama Metrikleri Kapısı

Record the validation commands, results, known gaps, and whether a maintainer explicitly waived any gate.

## Kapı 2 — Güvenlik Kapısı

Check secrets, SSH access, least privilege, dependency risk, and cloud/security impact.

## Kapı 3 — Dokümantasyon Kapısı

Update canonical documentation, generated reports, and governance data when behavior or operating rules change.

## Kapı 4 — Rollback Kapısı

Every change must be small enough to review and reversible enough to recover safely.

## Değişiklik Değerlendirme Formu

- Scope:
- Risk:
- Validation:
- Rollback:
- Owner:

## Uzun Vade Dönüşüm Kuralı

Long-horizon changes follow roadmap/seis-18-60-month-long-horizon-ops-blueprint.md.

- Uyarı Tetiklemesi: D1 opens when evidence starts drifting.
- Tekrarlı Uyarı Tetiklemesi: D2 freezes expansion when drift repeats.
- Çözüm Tetiklemesi: D3 reopens only after evidence and quality recover.
