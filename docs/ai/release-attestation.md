# SEIS Model Yayın Onay İmzası

## Durum

- Doğrulayıcı: `implemented`
- Profil: `seis-ed25519-release-v1`
- Algoritma: `Ed25519`
- Trust-root: `not-configured`
- Güvenilen public key: `0`
- Varsayılan yayın kararı: `deny`
- Runtime yetkisi: `false`

Bu durum gerçek bir yayın onayı değildir. Doğrulayıcının bulunması, bir modelin
eğitildiğini, değerlendirildiğini, yayınlandığını veya AGI olduğunu kanıtlamaz.

## Kaynaklar

- Trust-root sözleşmesi:
  `content/development/seis-model-release-trust-root.json`
- Trust-root şeması:
  `packages/shared-types/schemas/model-release-trust-root.schema.json`
- Doğrulayıcı:
  `packages/seis-ai/src/model/release-attestation.mjs`
- Release kaydı şeması:
  `packages/evals/schemas/model-release-decision.schema.json`

## Kriptografik Profil

SEIS yalnız public `OKP` / `Ed25519` JWK kabul eder. Private JWK alanı `d`, PEM
private key veya signing işlemi runtime doğrulayıcıda yasaktır.

Public key kimliği RFC 7638 JWK thumbprint yöntemine göre hesaplanır:

1. Yalnız `crv`, `kty` ve `x` alanları alınır.
2. Alanlar canonical sıraya konur.
3. UTF-8 JSON üzerinde SHA-256 hesaplanır.
4. Sonuç unpadded base64url ile `jkt-sha256:` kimliğine çevrilir.

JWK biçimi RFC 8037, imza algoritması RFC 8032 ile uyumludur. Node runtime
`crypto.verify(null, ...)` kullanır; Ed25519 için ayrı digest algoritması
seçimine izin verilmez.

Resmi referanslar:

- <https://www.rfc-editor.org/rfc/rfc7638>
- <https://www.rfc-editor.org/rfc/rfc8037>
- <https://www.rfc-editor.org/rfc/rfc8032>
- <https://nodejs.org/api/crypto.html#cryptoverifyalgorithm-data-key-signature-callback>

## İmzalanan İçerik

İmza, `recordHash` ve tam `approvalAttestation` nesnesi çıkarılmış release
kaydını, ayrı ve açık bir approval envelope ile şu domain altında bağlar:

`https://seis.dev/attestations/model-release/v1`

Canonical payload; release id, subject, karar, evidence referansları,
model/dataset card hashleri, insan onay id'si, önceki kayıt hash'i, zaman,
route/publication durumu ve truth boundary alanlarını kapsar. Bu nedenle imza
başka release id'sine, başka checkpoint'e veya değiştirilmiş gerekçeye taşınamaz.

Approval envelope içinde `verificationStatus`, `attestationId`, profil,
`trustDomain`, `audience`, `policyVersion`, `approvedAt`, `keyId`, algoritma,
`verifiedAt` ve `verifierId` de imzalanır. Yalnız circular bağımlılık oluşturan
`payloadDigest` ile `signature` imza girdisinin dışındadır. Böylece verification
metadata'sı sonradan sessizce değiştirilemez.

`payloadDigest` gözlemlenebilir SHA-256 özeti sağlar; Ed25519 imzası canonical
payload baytlarının tamamı üzerinde doğrulanır.

## Fail-Closed Kuralları

Şunlardan biri varsa doğrulama reddedilir:

- trust-root yapılandırılmamış veya disabled,
- key bulunamıyor, revoked, disabled ya da süresi dışında,
- key kimliği RFC 7638 thumbprint ile eşleşmiyor,
- public JWK dışında alan bulunuyor,
- key scope `model-release` içermiyor,
- profil, algoritma veya verifier id eşleşmiyor,
- payload digest değişmiş,
- imza canonical base64url değil veya 64 byte değil,
- Ed25519 imzası geçersiz,
- verification zamanı release zamanından önce veya gelecekte,
- approval izin verilen yaş sınırını aşmış,
- release fixture, denied ya da accepted değil.

Release kaydındaki `verificationStatus: verified` değeri kendi başına güvenilir
değildir. Yerleşik doğrulayıcı gerçek imzayı doğrulamadıkça `allow` geçemez.

## Key Yaşam Döngüsü

Public approval key eklemek, devre dışı bırakmak, revoke etmek veya döndürmek
insan onayı gerektirir. Private key:

- repoya yazılmaz,
- fixture'a eklenmez,
- MCP üzerinden okunmaz,
- provider prompt'una gönderilmez,
- browser/localStorage içinde tutulmaz.

Bugünkü repo trust-root'u bilerek boştur. Repo dosyasında `configured` durum veya
public key bulunması loader tarafından reddedilir. İlk gerçek public key ancak
authority sahibi, saklama sistemi, rotasyon/revocation prosedürü ve olay
müdahale planı incelendikten sonra, repodan ayrı ve yönetilen bir startup trust
boundary üzerinden verilebilir. Bu external boundary henüz uygulanmış bir
deployment özelliği değildir.

## Replay ve Yayın Executor Sınırı

İmza; attestation id, trust domain, audience ve policy version alanlarını bağlar.
Bu, başka hedefe veya eski policy'ye taşımayı engeller; fakat stateless signature
verification aynı onay paketinin ikinci kez sunulduğunu tek başına bilemez.

SEIS'te bugün release executor yoktur. Gelecekte side effect üreten bir executor
eklenmeden önce attestation id'lerini ve son release sürümünü atomik olarak
tüketen kalıcı bir replay ledger zorunludur. Ledger yokken yayın kararı `deny`
kalır.

## Doğrulama

```bash
npm run check:seis-model-release-attestation
node --test packages/seis-ai/test/release-attestation.test.mjs
npm run check:seis-model-training-evidence-chain
```

Test private key'leri yalnız test süreci belleğinde üretilir ve diske yazılmaz.

## MCP Sınırı

Yeni write-capable MCP aracı eklenmez. Mevcut
`seis_ai_core_training_evidence_status` aracı yalnız verifier/trust-root özetini
okur. İmza üretmez, key yapılandırmaz ve yayın kararı uygulamaz.
