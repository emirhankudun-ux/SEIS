# Kurumsal Değişiklik Kapıları

SEIS enterprise changes must pass four mandatory gates before they are treated as complete.

Her PR / merge için 4 kapının **tamamı** kapatılmalı; kapıdan biri boş ise değişiklik tamamlanmamış sayılır.

## Kapı 1 — Doğrulama Metrikleri Kapısı

Amaç: teknik değişikliğin ölçülebilir olarak doğrulanması.

Zorunlu alanlar:

- `validation`: çalıştırılan komutlar + sonuç özeti
  - `npm run check:workspace`
  - `npm run seis:check`
  - `npm run check:seis-enterprise-gates:quality`
- `coverage`: modül kapsamı / etki alanı
- `blocker`: açık kalan teknik bloklar (varsa)

## Kapı 2 — Güvenlik Kapısı

Amaç: güvenlik ve gizlilik riskleri kapalı devre değerlendirilmeli.

Zorunlu alanlar:

- `security-review`: secrets, token, SSH, erişim ve dependency etkisi
- `security-guardian`: ilgili çıktı veya referans
- `codeql`: analiz kanıtı (etkileniyorsa)
- `risk`: düşük/orta/yüksek + azaltma adımı

## Kapı 3 — Dokümantasyon Kapısı

Amaç: davranış veya kural değişikliğinde karar izi bırakmadan kalmamak.

Zorunlu alanlar:

- `docs-update`: güncellenen dosyalar
- `adr`: değişiklik karşılığında ADR/karar kaydı
- `governance-data`: governance json/rapor güncellemesi (gerekliyse)
- `policy-alignment`: ilgili AI / kalite / güvenlik policy referansı

## Kapı 4 — Rollback Kapısı

Amaç: geri dönüş süresini güvenli şekilde planlamak.

Zorunlu alanlar:

- `rollback-plan`: geri alma adımları
- `rollback-dry-run`: mümkünse prova kaydı
- `rto-rpo`: hedeflenen geri dönüş hedefi (RTO/RPO)
- `owner`: rollbacku onaylayan sahibi

## Değişiklik Değerlendirme Formu

- PR / Commit:
- Modül (Dashboard / Goals / Repos / Docs / Agents / Other):
- Kapsam:
- Risk seviyesi:
- Validation: komutlar + sonuçlar + kısa özet:
- Security: kanıtlar + açık risk:
- Docs: güncellenen karar ve dokümantasyon:
- Rollback: plan + dry run:
- Approval:

## Kabul Kuralı

- Bu 4 kapının her biri için alanların dolu olması ve kapı durumunun `passed` olması gerekir.
- Bir kapı reddedildiğinde değişiklik `Incomplete` kalır; blocker kapanmadan merge / release yok.
- Acil geçiş gerekiyorsa sadece yönetim onayıyla açık `waiver` eklenir ve aynı PR’da düzeltme planı girilir.

## CI Bağlantı Kuralı

- Bu kurallar `.github/workflows/seis-system-gates.yml` ile senkron kalır.
- CI’de teknik gate’ler (`quality`, `security`, `ai`, `llm-policy`) geçmeden kurumsal kapı formu `final` sayılmaz.
- CI başarısızlığı varsa 4 kapıda en az birisi `blocked` olarak kalmalıdır; local tamamlama ile bypass edilmez.

## Uzun Vade Dönüşüm Kuralı

Long-horizon changes follow [../roadmap/seis-18-60-month-long-horizon-ops-blueprint.md](../roadmap/seis-18-60-month-long-horizon-ops-blueprint.md).

- Uyarı Tetiklemesi: D1 when evidence starts drifting.
- Tekrarlı Uyarı Tetiklemesi: D2 freezes expansion when drift repeats.
- Çözüm Tetiklemesi: D3 reopens only after evidence and quality recover.
- D1: evidence drift başlar; kapı iyileştirme sprinti.
- D2: tekrarlı drift; genişleme durur.
- D3: kritik drift; güvenlik ve rollback iyileştirmesi sonrası yeniden açılır.

## Kapı Tamamlama Kuralı (God Mode)

- Kapı durumu sadece üç değerden biri olabilir: `passed`, `waived`, `blocked`.
- 4 kapının birinde `blocked` varsa proje durumu tamamlanmış değildir.
- `waived` yalnızca acil durumda; aynı PR’da kapanış planı ve izleme göreviyle kabul edilir.
- Hedeflenen final çıktı: `complete` yalnızca her modülün (Dashboard, Goals, Repos, Docs, Agents) bir sonraki sprint’e taşınacak kritik eksik kalem bırakmamasıyla mümkündür.
