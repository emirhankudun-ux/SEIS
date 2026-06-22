# SEIS 30/90 Uygulanabilir Blueprint

## 30 Günlük Uygulanabilir Sprint Planı

### Sprint 1 (Gün 1–7) — Manifesto + Sözleşme

- [ ] Tek sayfalık manifesto dosyası kilitlenir (`goals/architecture.md:1`).
- [ ] 5-katman haritası ve modül eşlemesi doğrulanır (`docs/architecture/seis-5-layer-operating-map.md`).
- [ ] `governance/enterprise-change-gates.md` alanları doldurulur.
- [ ] PR şablonunda (God Mode) kapı durumları zorunlu yapılır.
- **Kabul**: manifestodan çıkan kurallar PR template ve gates formlarında görünür.

### Sprint 2 (Gün 8–14) — Üç Kapı + CI

- [ ] `.github/workflows/seis-system-gates.yml` içinde quality/security/AI gate adımları doğrulanır.
- [ ] `npm ci` + gate sırası stabil hale getirilir.
- [ ] Dashboard + Goals için en az birer örnek kanıt kaydı (evidence link + özet) eklenir.
- **Kabul**: gate hatası alan bir değişiklik PR’da “blocked” olarak işaretlenmeden geçmez.

### Sprint 3 (Gün 15–21) — Kurumsal 4 Kapı ve Dokümantasyon

- [ ] Repos modülü için readiness + publish güvenlik kontratı tamamlanır.
- [ ] Docs modülü için ADR eşleme ve governance index kayıtları güncellenir.
- [ ] Rollback dry-run planı tüm modüllere en az bir örnek olarak eklenir.
- [ ] 90 günlük blueprint’in ilk kontrol noktası açılır.
- **Kabul**: 4 kapıda `validation/security/docs/rollback` alanları dolu.

### Sprint 4 (Gün 22–30) — Kapanış ve Geçiş

- [ ] Agents için AI policy zorunlulukları aktif edilir (`ai/policy.md`).
- [ ] Tüm modüller için `roadmap`, `docs`, `rollback`, `quality` kanıt listesi kapatılır.
- [ ] `content/development/seis-god-mode-completion-audit.json` kapatma kontrolü yapılır.
- [ ] 30 Gün Sonu: 30-gün kapanış audit’i ile checkpoint oluşturulur.
- **Kabul**: kapı durumları en az `passed` veya onaylı `waived`; aksi takdirde sistem kısıtlı kalır.

## 90 Günlük Blueprint

### 1) Çekirdek Alan

- Tüm modüller (Dashboard/Goals/Repos/Docs/Agents) için 5-katman sözleşmeleri dosyaya bağlanır.
- Her modülde örnek ADR, hedef-gate-evidence eşlemesi ve rollback kanıtı olur.
- `goals/architecture.md`, `docs/governance/quality-gates.md`, `docs/governance/enterprise-change-gates.md` ile sürümsel uyum korunur.

### 2) Güvenlik Kontrol Noktaları

- Security Guardian, CodeQL, SSH ve erişim denetimleri düzenli otomasyonla koşar.
- D1/D2/D3 throttle regülatörü (kalite ve güvenlik sapma davranışı) uygulanır.
- `check:seis-enterprise-gates:security` her `main` merge adayında zorunlu tutulur.

### 3) AI Policy Çerçevesi

- `intent`, `risk`, `rollback`, `policyVersion`, `audit`, `owner`, `requiresHumanApproval`
  alanları AI etkin akışlarda zorunlu tutulur.
- İnsan onayı gerektiren akışlarda explicit işaretleme ve izlenebilir karar zinciri gerekir.
- `check:llm-orchestration-policy` + `check:seis-enterprise-gates:ai` sonuçları düzenli rapora eklenir.

## 90 Gün Kabul Kriterleri

- 3 teknik kapı (quality/security/AI) ve kurumsal 4 kapı kapanmadan modül `complete` sayılmaz.
- 90. günde her modülde en az bir gerçek proof of run + PR kapısı + rollback planı hazır olmalı.
- Run-state ve completion-audit dosyalarında `pending` durum kalmaması beklenir.
