# SEIS God Mode v2 — Temiz Oda Mimari Brifingi (Phase 2)

## 1) Genel Mimari Karar

Bu fazda amacımız, SEIS’in kendi AI sistemini “hangi motoru kopyaladığına bakmadan”, tamamen
kaynak- nötr bir çekirdek kontrol yüzeyiyle kurmaktır:

- önce **yerel proje anlama**,
- sonra **yetki tabanlı karar çekirdeği**,
- sonra **denetlenebilir, onaylı eylem**.

Mimari, `clean-room` kısıtını korur ve bir sonraki aşama için `SEIS Universe` model laboratuvarını
kapatmaz; yalnızca güvenli bir temel üretir.

## 2) Kapsam ve Amaç

### Phase 2 Zaruri Kapsam

- `REFERENCE_REQUIREMENTS.md` ve `SEIS_PHASE_2_CLEAN_ROOM_ARCHITECTURE.md` doğrultusunda
  read-first proje anlama.
- `seis-project-intake` → `seis-action-decision` → `seis-action-execution` lane zincirinin
  deterministik çalıştırılması.
- Ortak güvenlik katmanı (secret redaksiyon + gizli kalıp taraması + redaksiyonlu rapor).
- Evidence-ledger formatının JSON + Markdown ile kilitlenmesi.
- Görev seti ve yetki matrisinin açık audit logu.
- İlk model çalışması olarak yalnızca **policy seed denemeleri**; üretim eğitimi değil.

### Phase 2 Dışında (Şu Anda)

- Tam model eğitimi ve global yayın akışı.
- Arka plan daemon/otomatik self-healing.
- Kapsamdan bağımsız çok-platform sürekli indeksleme.
- Servis seviyesinde yüksek riskli otomasyonlar (deploy/production write) onaysız.

## 3) Hedef Platform ve Çalışma Yüzeyi

- **Hedef platform (ilk safha):** `CLI-first + macOS-aware`
- **Neden:** en düşük risk, en iyi kontrol ve hızlı rollback.
- **Genişleme şartı:** macOS görünürlüğü (UI/telemetri) yalnızca bu üçlü lane stabilleştikten sonra.
- **Dil/ekosistem tercihi:** TypeScript tabanlı check + script katmanı, Swift tarafı için yalnızca
  sözleşme eşlemesi.

## 4) Phase 2 Mimari Kısa Modeli

1. **Intake Lane**
   - AGENTS, sözleşmeler, repo durumu (`git status`, branch, remotes), teknoloji sinyalleri, güvenlik alanı.
   - Çıktı: `reports/seis-project-intake/latest.*`
2. **Permission Kernel**
   - Capability kuralları: `read`, `status`, `search`, `summarize`, `write`, `shell`, `git`, `network`, `model`, `data`, `deploy`, `secret`.
   - Deterministik sınıflandırma + opsiyonel öğrenilmiş model düzeltmesi (güvenlik zeminini aşamaz).
3. **Decision + Execution Bridge**
   - Tüm eylemler önce karar raporunda görünür.
   - `dry-run` varsayılan, gerçek çalıştırma yalnızca açık onay ve ready-to-execute ile.
4. **Evidence Ledger**
   - Tek tip rapor kimliği, zaman damgası, karar gerekçesi, risk düzeyi, onay durumu.
   - Her rapor mutlaka redakte edilmiş metin üretir.
5. **Universe Pre-Model Layer**
   - `dataset/model card` + `eval plan` + `permission-policy` seed çalışma zemini hazırlar.
   - Model davranışı, birikim olarak takip edilir; canlı üretim çıkışı yok.

## 5) İzin ve Güvenlik Modeli (V1)

### Varsayılan Kurallar

- `read`, `status`, `search`, `summarize`: `allow` (approval gerekmez).
- `write`, `shell`, `git`: `gate` (kapsam + gerekçe + onay).
- `network`, `model`, `data`, `deploy`: `approval_required` (risk, kapsam, amaç, rollback gerektirir).
- `secret`: `deny` (asla serbest üretim/çıkış/aktarım yok).

### Güvenlik Dayanakları

- `containsSecretMaterial` + `redactSecretText` zorunlu.
- Secret benzeri diziler ve anahtar kelime desenleri redakte edilmeden hiçbir rapora yazılmaz.
- Onaysız `write/shell/git/network/model/data/deploy` eylemi “executed” state’e geçemez.
- Tüm yüksek riskli eylemler için:
  - action id
  - gerekçe
  - onay veren kimlik
  - rollback planı
  - nedenin tekrar doğrulanabilir kaynağı kayıt altına alınır.

## 6) Doğrulama Planı (Phase 2)

- `npm run check:seis-project-intake`
- `npm run check:seis-action-decision`
- `npm run check:seis-action-execution`
- `npm run check:seis-god-mode-developer`
- `npm run check:seis-god-mode-validation-plan`
- `npm run check:seis-governance-index`
- `npm run quality:governance`

Kabul ölçütleri:

- `read-only` default korunmuş olmalı.
- İki lane (decision + execution) ve intake raporu geçerli formatta üretilmeli.
- Secret redaksiyonu tüm raporlarda aktif olmalı.
- Uygulama birimlerine ait kapsam dışı dosya değişiklikleri olmamalı.

## 7) İlk Uygulama Slice’ı (Kod Üretiminden Önce)

1. `SEIS_PHASE_2_CLEAN_ROOM_ARCHITECTURE.md`, `SEIS_UNIVERSE_CLEAN_BUILD.md`,
   `SEIS_UNIVERSE_MODEL_FAMILY.md`, `REFERENCE_REQUIREMENTS.md` dokümantasyon eksensini kilitle.
2. `content/development/seis-project-intake-contract.json`,
   `seis-action-decision-contract.json`, `seis-action-execution-contract.json`
   üçlüsünde evidence + requiredArtifacts alanlarını eşitle.
3. `packages/seis-ai/src/lib/redaction.mjs` tabanlı redaksiyon ve test setini genişlet
   (özellikle false-positive kontrolü ile).
4. `scripts/inspect-*` ve `scripts/check-*` akışını “run-state + dry-run-first + onaylı execute” modeline bağla.
5. Model laboratuvarı açılırken yalnızca `permission-policy` seed + memory-ranker deneylerini “artifact-level”
   evidence olarak ekle, üretim modeli iddiası yok.

## 8) İlk Durdurma Noktaları (Go/No-go)

- Clean-room sınırı ihlalinde derhal dur:
  - referans kaynak kod kalıntısı
  - gizli veri/anahtar izi
  - modelin kararını açıklayamadığı durumlar
- Kırmızı sinyal:
  - onaysız yüksek risk eylemi execute’a geçiyorsa
  - evidence raporu format dışıysa
  - rollback kanıtı yoksa

## 9) Kodlama Başlangıç Eşiği

Bu briftten sonra ve yukarıdaki kontroller stabil kaldığı sürece bir sonraki adımda,
yalnızca aşağıdaki üretim dilimlerine geçilir:

- `seis-project-intake` rapor standardı
- `decision` ve `execution` kontratlarını kapalı çevrimde sertleştirme
- `governance index` + `run-state` doğrulaması ile çapraz katman izlenebilirlik
