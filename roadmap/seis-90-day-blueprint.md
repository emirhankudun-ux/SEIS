# SEIS 30/90 Gün Uygulanabilir Blueprint

Bu belge, 90 günlük dönemi üç operasyonel sütun üzerinden ilerletir:

- **Çekirdek alan kurulumları (Core Platform)**
- **Güvenlik kontrol noktaları (Security Gate Mesh)**
- **AI policy çerçevesi (Policy & Audit)**

## Sprint Planı (30 Günlük Bloğa Ayrılmış)

### Sprint 1 (1–2)

- `docs/governance/seis-architecture-manifesto.md` onayı ve sınırların stabilizasyonu.
- `docs/architecture/seis-5-layer-operating-map.md` ile Dashboard/Goals/Repos/Docs/Agents boundary eşlemesi.
- PR kapı formu ve 4 kapı akışının uygulanabilirlik testi.

### Sprint 2 (3–4)

- `docs/governance/quality-gates.md` ve `docs/governance/enterprise-change-gates.md` tek formatta eşlenir.
- `npm run check:seis-enterprise-gates:quality` ve `npm run check:seis-enterprise-gates:security` CI’ye bağlanır.
- İlk 2 pilot modül için (Dashboard, Goals) rollback dry-run kanıtı toplanır.

### Sprint 3 (5–6)

- `docs/ai/policy.md` genişletilir: policy field seti (`intent`, `risk`, `rollback` vb.) netleştirilir.
- `npm run check:llm-orchestration-policy` ve AI policy senaryoları stabilize edilir.
- `security-guardian` + CodeQL kapsamları kontrol edilir.

### Sprint 4 (7–8)

- Repos ve Agents modülleri için contract-first geçiş planı.
- Kurum kapı formunun PR şablonuna bağlandığı kanıtlı akış.
- 2 yüksek risk senaryosu için “deploy öncesi kontrol + rollback” prova kaydı.

### Sprint 5 (9–10)

- Kalan modüller için kapı kapsamlı raporları: Docs + Repos + Agents.
- KPI ölçüm şemasının ilk versiyonu (`roadmap/seis-long-horizon-kpi-framework.md`) ile bağ.
- 60 gün checkpoint: kapılardan biri kapanıyorsa genişleme durur.

### Sprint 6 (11–12 / 90. Gün)

- 30/60/90 kapanış audit’i: 4 kapı, 3 teknik gate, 5 katman haritası birlikte doğrulanır.
- 90 günlük çıktı paketi:
  - her modül için örnek karar kaydı,
  - en az 1 ölçüm kanıtı,
  - en az 1 rollback dry-run kanıtı.

## Kabul Kriterleri (90. Gün Sonu)

- Her PR en az 1 kez kalite, güvenlik ve AI kapılarından geçtiğinde publish edilir.
- Modüllerin her biri için 5-katman sınırının birinci kabul kontrolü yapılır.
- 4 kapının kanıt eksikliği olan modül, sonraki sprintlere bekletilir.

## 30 Günlük Operasyon Modeli

Süreç her güncel değişiklikte:
1. Doğrulama → 2. Güvenlik → 3. AI policy → 4. Rollback değerlendirmesi.
2. Hedeflenen her eylemde bir PR notu ve karara bağlantı.
3. Geriye dönüş adımı olmadan yayın olmaması.
