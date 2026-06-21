# SEIS Phase 2 Architecture Brief — Clean-Room (God Mode)

## 0) Amaç
SEIS’in temellerini, temiz oda kurallarıyla ve resmi kaynak odaklı bir doğrulama hattı üzerinden
kurmak: önce güvenli proje anlama ve karar çekirdeği, sonra kontrollü eylem katmanı.

## 1) Kapsam Önerisi
### 1.1 Zorunlu (Phase 2)
- **Yerel repo anlayışı:** AGENTS, sözleşmeler, çalışma durumu, teknoloji haritası ve güvenlik sınırlarının okunması.
- **İzin tabanlı çekirdek:** read/write/shell/network/secret/repo/model/data/deploy yetkilerinin tek bir policy katmanında birleştirilmesi.
- **Patch-temelli değişim:** yalnızca talep edilen ve doğrulanmış yüzeyde değişiklik.
- **Kanıt odaklı raporlama:** intake, karar, risk, test ve eylem özetlerinin tek bir ledger içinde tutulması.
- **Deterministik denetim:** check/inspect döngülerinin tekrarlanabilir olması.
- **MVP AI-okuma katmanı:** model çalıştırmadan sadece model-politika sınıflandırma mantığının deneysel denemesi.

### 1.2 Phase 2 Dışında (sonraki fazlar)
- Model eğitimi ve dağıtım.
- Geniş kapsamlı otomatik indeksleme.
- Sürekli arka plan servisleri ve otomatik self-healing ajanlar.
- Kapsam dışı platform yüzeylerinde full release.

## 2) Hedef Platform Kararı
- **Birincil hedef:** `CLI-first + macOS-native-aware` denetim yüzeyi.
- **Neden:** yüksek güvenlik kontrolü, hızlı geri dönüş, düşük bağımlılık, deterministik komut ve rapor üretimi.
- **Mekanik kural:** ilk çıktılar markdown + JSON rapor; GUI ancak CLI ve denetim zinciri kararlı olduktan sonra eklenir.

## 3) Mimari Çekirdek
1. **Intake Lane**
   - `AGENTS.md`, contract dosyaları, branch/remote durumu, repo bütünlüğü okunur.
   - Çıktı: `reports/seis-project-intake/latest.json` ve `latest.md`.
2. **Authority Kernel**
   - `content/development/seis-action-execution-contract.json`, `seis-action-decision-contract.json` ve policy karar kuralları tek kaynaktır.
   - Her eylemde **karar**, **risk**, **gereken onay** ve **gerekçe** kaydedilir.
3. **Decision Lane**
   - Eylem modeli deterministik olarak çıkarılır; gerekirse eğitimli model kararı yalnızca advisory/sınırlı bir katman olarak uygulanır.
   - Yüksek riskli eylemler otomatik `gate`/`approval_required` durumuna düşürülür.
4. **Execution Lane**
   - `--dry-run` varsayılanıyla plan doğrulaması yapılır.
   - Gerçek yürütme yalnızca açık onay + risk kontrolü sonrası.
5. **Evidence Ledger**
   - Tek ve sabit formatta doğrulama yüzeyi: karar kayıtları, redaksiyonlu çıkışlar, risk listeleri, rollback kanıtı.
6. **Model Universe Prep Boundary**
   - Phase 3 model ve veri çalışmaları için gerekli manifest, değerlendirme ve kartlar kurulur.
   - Phase 2’de model çağrısı/dış servis bağımlılığı zorunlu değil; sadece policy laboratuvarı çalışır.

## 4) Kapsam ve Önerilen Plan (God Mode)
- **Hafta 1:** intake + policy + denetim (okuma odaklı), var olan check/inspect scriptleri stabilize edilir.
- **Hafta 2:** güvenlik ve secret redaksiyonu sertleştirme, evidence bütünlüğü.
- **Hafta 3:** execution planı ile dry-run→onaylı execute geçişi ve kapalı devre doğrulama.
- **Hafta 4:** macOS/native yüzeye API kontratını hazırlayıp, ikinci katmanda pilot UI davranışı tanımlanır.

## 5) İzin ve Güvenlik Modeli
### Varsayılan Davranış
- Varsayılan: **read-only + deterministic gözlem**.
- `write`, `shell`, `git`, `deploy`, `model`, `data` eylemleri **gerekli yetki + açık kapsam + risk onayı** olmadan çalışmaz.
- `secret`: doğrudan reddedilir; raporlarda redaksiyon zorunludur.

### Erişim Sınıfları
- **Read/Search/Status:** low risk, allow.
- **Write/Shell/Git:** medium risk, gate.
- **Network/Deploy/Model/Data:** high risk, approval_required.
- **Secret:** deny.

### Güvenlik Zorunlulukları
- Tüm çıktıda secret pattern taraması ve redaksiyon.
- Kullanıcı verisi, proje dışı dışa aktarımı ve key/cert geçişi explicit izin olmadan yasak.
- Her aksiyon için rollback kanıtı ve durdurulabilirlik şartı.
- Onay gerektiren eylemler için net gerekçelendirme ve eylem ID bazlı izlenebilirlik.

## 6) Validation Plan (Phase 2)
### Teknik Eşikler
- `npm run check:seis-project-intake` geçmeli.
- `npm run check:seis-action-execution` ve `npm run check:seis-action-decision` geçmeli.
- `npm run check:seis-god-mode-developer` ve `npm run check:seis-enterprise-gates` ile güvenlik/kalite kesişimi doğrulanmalı.
- `requiredEvidence` ve `requiredArtifacts` kontrolü her ilgili check tarafından zorunlu tutulmalı.

### Başarı Ölçütleri
- Tüm high-risk eylemler için onay noktasının net olması.
- Secret-like içerik loglara dahil olmamalı.
- Onaysız eylem yürütmesi olmamalı.
- Raporlar `json` ve `md` olarak tekrar üretilebilir ve tekrar edildiğinde aynı karar formunu vermeli.

## 7) İlk Uygulama Slice’ı (Koddan Önceki İmalat Kararı)
1. `REFERENCE_REQUIREMENTS.md` ve bu belgeyi tek yetkili kaynak olarak sabitle.
2. `seis-project-intake` + `seis-action-decision` + `seis-action-execution` contract zincirini doğrulama açısından birleştir.
3. `requiredEvidence` setini stabilize et:
   - `REFERENCE_REQUIREMENTS.md`
   - `SEIS_PHASE_2_CLEAN_ROOM_ARCHITECTURE.md`
   - `SEIS_UNIVERSE_CLEAN_BUILD.md`
   - `SEIS_UNIVERSE_MODEL_FAMILY.md`
4. `secret` redaksiyon ve forbidden token pattern testlerini genişlet.
5. Deterministik run ile dry-run, ardından explicit onaylı execute için kontrol listesi yaz.
6. Model-özgür AI çekirdeği için `seis` model aile manifesti + veri/eval kartları için boş alanlar aç.

## 8) SEIS Eylem İlkeleri (Kodlama Durağı)
- Kod, yalnızca bu mimari kararını destekler; kapalı kapı referans kopyası taşımaz.
- Her değişiklikte küçük diff, geri alınabilir adım ve tekrar üretilebilir kanıt gerekir.
- Önemli bir ilerleme yalnızca doğrulama hedefini geçtiğinde bir sonraki slice’a geçilerek yapılır.
