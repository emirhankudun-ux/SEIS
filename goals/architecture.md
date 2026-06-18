# SEIS Master Operating Architecture (Uzun Vade Odak)

## 1) Tek Sayfalık Manifesto (Kurallar + Sınırlar + Kabul)

### Amaç
SEIS'in kısa vadeli görev odaklı teslimatı, uzun vadeli karar kalitesi, güvenlik ve geri alma kapasitesi olmadan büyümesin.

### Kurallar

- **main-only ve geri alınabilirlik:** `main` hattı dışında kalıcı teslimat yapılmaz; her kritik davranış değişikliği rollback planı olmadan yayınlanmaz.
- **Önce doğrulama, sonra davranış:** herhangi bir yüzey değişikliği (UI, policy, plugin, cloud, docs, repo politikası) önce ilgili gate’lerden geçmeden aktif edilmez.
- **5-katman mecburiyeti:** `Dashboard / Goals / Repos / Docs / Agents` modülleri yalnızca sınırlarını aşmayacak şekilde `experience`, `core`, `knowledge`, `ai-policy`, `operations-security` katman etkileşimiyle çalışır.
- **AI policy enforced:** AI çıktısı insan onayı veya policy rotasyonu olmadan üretime geçemez.
- **Karar izi olmadan davranış yok:** `docs/decisions` ve `docs/architecture` bağlamı olmadan kalıcı davranış değişikliği yapılmaz.

### Kabul Ölçütleri

- `docs/governance/enterprise-change-gates.md` içindeki 4 kapıdan biri eksikse publish yok.
- `npm run quality:governance` ve ilgili 3 gate (`quality/security/ai`) CI’de koşar.
- Her modülde en az bir karar kaydı, boundary kanıtı ve rollback prova izi bulunur.

## 2) Dashboard / Goals / Repos / Docs / Agents → 5 Katman Eşleme

| Modül | Birincil Katman | Destek Katmanları | Boundary | Zorunlu Sözleşme |
| --- | --- | --- | --- | --- |
| Dashboard | Experience | Core, Operations & Security | Olayları doğrudan eyleme dönüştürmez; event-first işlenir | `status`, `risk`, `impact` |
| Goals | Core | Knowledge, AI Policy | Yol haritası eylem çağrılarına doğrudan map edilmez | `goalId`, `owner`, `priority`, `risk` |
| Repos | Core | Operations, Knowledge | Publish/readiness yalnızca contract tetiklemesiyle başlar | `repoId`, `readiness`, `visibility`, `deploymentTarget` |
| Docs | Knowledge | Experience, Operations | Davranış değişikliği önce karar kaydıyla eşlenir | `decisionId`, `scope`, `effectiveFrom`, `author` |
| Agents | AI Policy & Orchestration | Core, Operations & Security | AI çıktısı policy motorundan geçmeden işlem yapmaz | `intent`, `policyVersion`, `risk`, `rollback` |

Aynı harita için detay: [docs/architecture/seis-5-layer-operating-map.md](../docs/architecture/seis-5-layer-operating-map.md)

## 3) 30 Günlük Uygulama Sprinti

1. **Sprint 1:** Manifesto + ADR + 5-katman haritası eşleştirme tamamlanır.
2. **Sprint 2:** `quality` ve `security` gate çalışır hale gelir; Dashboard/Goals için örnek contract-first kanıtları eklenir.
3. **Sprint 3:** AI policy alanları (`intent`, `policy`, `risk`, `rollback`) uygulanır; Repos/Docs için kapı formu zorunlu olur.
4. **Sprint 4:** Agents için policy ve rollback senaryoları eklenir; D1/D2/D3 kontrol mantığıyla 30 günlük kapanış denetimi yapılır.

## 4) 90 Günlük Blueprint (90’a kadar uzatılmış)

- **Çekirdek:** 5-katman boundary standardını stabil hale getirmek ve tüm modüllerde karar kanıtı tutmak.
- **Güvenlik:** `security-guardian` ve CodeQL kapsamını düzenli doğrulamak, yüksek-riskte manuel onay/rollback zorunluluğu.
- **AI Policy:** `check:seis-enterprise-gates:ai` ve policy ihlal senaryoları ile audit zinciri oluşturmak.
- **Durdurma mantığı:** `D1` (kısa düşüş), `D2` (tekrar eden düşüş), `D3` (kritik kapanma) tetiklemeleriyle genişleme durdurulur.

Referans yol haritası: [roadmap/seis-18-60-month-long-horizon-ops-blueprint.md](../roadmap/seis-18-60-month-long-horizon-ops-blueprint.md)

## 5) Onay Akışı (Pratik)

- Değişiklik → ADR → 5-katman eşleme güncellemesi → `npm run check:seis-enterprise-gates:quality` → `npm run check:seis-enterprise-gates:security` → `npm run check:seis-enterprise-gates:ai` → PR kapı formu doldurulup `main`.

- Kurumsal 4 kapı detayı için: [governance/enterprise-change-gates.md](governance/enterprise-change-gates.md)
