# SEIS Phase 2 Clean-Room Architecture

Amaç: `REFERENCE_REQUIREMENTS.md` ve aktif SEIS yönetim katmanına dayanarak,
`god mode` kapsamında üçüncü taraf veya referans kaynaklara bağımlı olmadan,
deterministik ve güvenli bir şekilde ilk kurumsal AI geliştirme çekirdeğini kurmak.

## 1) Mimarî Özet (SEIS Üst-Yapısı)

Phase 2 ilk hedefi, model eğitimi veya dağıtımı değildir. Hedef, güvenli bir
proje-okuma ve karar katmanı kurmaktır.

- `project-intake` katmanı: repo durumu, dosya yapısı, komut-pipeline,
  teknik risk alanları ve uygulanabilirlik sınırlarını okur.
- `permission kernel` katmanı: okuma/yazma/shell/ağ/sihirli-model eylemleri için
  açık yetki sınıfları tanımlar.
- `execution lane` katmanı: her eylemin niyet, kapsam, delil ve rollback
  tanımı ile uygulanmasını sağlar.
- `governance lane` katmanı: kontrol listesi, geri alma planı, güvenlik ve
  kalite delilleriyle bütünleşir.
- `model-gateway` (gelecek dilimler): permission-first bir arayüzden
  başlatılır; Phase 2’de sadece yerel kontrol ve rapor üretimi.

## 2) Kapsam ve Platform Seçimi

Platform tercihi: **Önce CLI odaklı, sonra macOS desktop uyumlu çekirdek**.

- Apple-first doğası korunur (gelecekte `seis_platform_swift` entegrasyonu için hazır
  veri sözleşmesi kurulmalı).
- CLI, Phase 2’de deterministik doğrulama için ana çalışma yüzeyi olur.
- Desktop web panelleri, yalnızca projeden çıkan güvenli özetleri gösterir; kontrol
  katmanı yerine davranış gösterir.

Phase 2 non-goalları:

- Model eğitimi, model ağırlığı üretimi veya üretim dağıtımı.
- Gizli/özel dosyaların otomatik indirilmesi veya dışa aktarması.
- Ağ erişimiyle yüksek riskli otomasyon (kullanıcı onayı olmadan).

## 3) Permission ve Güvenlik Modeli (İlk Dil)

| Yetki          | Varsayılan | Eylem Önkoşulları | Red/Onay Kuralı | Delil |
| -------------- | ---------- | ------------------ | --------------- | ------|
| Read           | Varsayılan açık (proje kökü) | Dosya kapsamı | Sadece kapsam dışı gizli dizin ve yollar filtrelenir | `intake` raporu |
| Write          | Kapalı | Amaç + kapsam + kullanıcı onayı | Kullanıcı onayı olmadan uygulanmaz | Patch özeti + diff kontrolü |
| Shell          | Kapalı | Amaç + risk sınıfı | İzinli komut listesi + timeout + çıkış kodu kontrolü | Komut logu (redact edilmiş) |
| Network        | Kapalı | Resmi açık kaynak/API gereksinimi | API policy eşleşmesi + en az ayrıcalıklı erişim | Kaynak ve endpoint listesi |
| Secret erişimi  | Kapalı | Kullanıcı onayı + redaksiyon planı | `secrets` içeriği asla çıktı/veri olarak yazılmaz | Redaksiyon logu |
| Git commit     | Kapalı | `quality` + `diff` geçerli | Kullanıcı hedefi olmadan tetiklenmez | Validation çıktısı + değişiklik listesi |
| Git push       | Kapalı | Branch, uzak, güvenlik ve yayın gate’i | Açıkça talep edilmediğinde çalıştırılmaz | Push readiness raporu |
| Model çağrısı   | Kapalı | Sadece Phase 3 kapısı sonrası | Phase 2’de kullanılmamalı | Model davranış kaydı |

Bu katman, veri izolasyonu, path güvenliği ve hata limitleriyle birlikte çalışır.

## 4) Validation Planı (Phase 2)

1) **Deterministik kontroller**

- `REFERENCE_REQUIREMENTS.md` ve `SEIS_UNIVERSE_CLEAN_BUILD.md` doğrulaması.
- Proje-inspection girişiminde:
  - AGENTS, root dosyaları, branch/remote durumu ve güvenlik kritik dosyalar.
  - Dosya kapsamı: `node_modules`, gizli depo klasörleri ve yapı konfigürasyon
    dışındaki okunabilir kök.

2) **Güvenlik ve gizlilik**

- Secret tarama (açık kalıp kontrolü, örn. `.env`, token patternleri).
- Gizli yol ve dosya filtreleri (ör. `Library`, `.codex`, credentials klasörleri).
- Komut çıktısının redaksiyonu.

3) **Yürütme güvenirliği**

- Her eylem için `intent/scope/capability/risk` kaydı.
- `exit code`, standart çıktı, standart hata, timeout ve rollback bilgisi.

4) **Dokümantasyon ve izlenebilirlik**

- Her phase-2 alt slice için:
  - hangi dosyalar okundu,
  - hangi kararlar alındı,
  - hangi kanıta dayandı,
  - hangi kapıların beklediği
  kayıt altına alınır.

## 5) İlk Uygulama Slice’i (Kod Üretmeden)

### Slice-0: Phase 2 Uyum Raporu

- `content/development/seis-project-intake-contract.json` dosyasını referans alıp
  "proje-inspection" kapsamını belgeleyen çalışma dokümanını finalize etmek.
- `content/development/seis-project-intake` alanını genişletip:
  - teknik kapsam,
  - eylem yetkileri,
  - risk sınıfları,
  - proof path
  içeren minimal şemayı tutmak.

### Slice-1: Deterministik Gözlem Döngüsü

- Sadece okuma modunda bir introspeksiyon döngüsü tasarlamak:
  - çalışan klasör,
  - git bilgisi (branch/remote),
  - AGENTS okuması,
  - kritik dosya var/yok durumu,
  - güvenlik riskleri,
  - önerilen next-step eylemleri.
- Çıktı: imzalanmış JSON + markdown rapor.

### Slice-2: Güvenli Kapı ve Onay Sözleşmesi

- İzinli yazma ve shell eylemlerini bir `permission-policy` sözleşmesiyle
  zorunlu hale getirmek (amaç/kapsam/timeout/rollback).
- İzin gerektiren eylem olmadan model kaynağına geçiş kapalı.

Bu yaklaşım, clean-room sınırını korur ve Phase 3 model araştırmasına sağlam
temel sağlar.
