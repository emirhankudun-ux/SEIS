# ADR-0005: Model Yayın Onayında Ed25519 ve RFC 7638 Kimliği

## Status

Accepted for foundation; trust-root remains unconfigured.

## Context

AI-2 eğitim kanıt zinciri, release `allow` kararını harici attestation callback'i
ile sınırlandırıyordu. Callback'in `true` dönmesi kriptografik kanıt değildi ve
uygulama repo içinde gerçek bir verifier sunmuyordu. Ayrıca çoklu algoritma
alanı algorithm-confusion riskini gereksiz yere büyütüyordu.

SEIS'in public repo, Node >=18, sıfır ek bağımlılık, private-key-free runtime ve
insan kontrollü release kurallarıyla uyumlu dar bir profile ihtiyacı vardır.

## Decision

- Yalnız Ed25519 kullanılacak.
- Public key yalnız RFC 8037 `OKP` / `Ed25519` JWK olarak kabul edilecek.
- Key id RFC 7638 SHA-256 JWK thumbprint'ten türetilecek; yazılmış id'ye
  güvenilmeyecek.
- İmza domain-separated canonical release payload ve ayrı approval metadata
  envelope üzerinde doğrulanacak.
- `recordHash`, `payloadDigest` ve `signature` circular bağımlılığı önlemek için
  imza girdisi dışında kalacak; diğer attestation metadata alanları imzalanacak
  ve release hash zinciri son kaydı ayrıca bağlayacak.
- Callback ile doğrulama kaldırılacak; yerleşik Node `crypto.verify(null, ...)`
  sonucu zorunlu olacak.
- Key status, scope ve validity window zorunlu olacak.
- Repo varsayılan trust-root'u anahtarsız ve `not-configured` kalacak.
- Repo loader, repo dosyasındaki configured trust-root'u reddedecek; gerçek
  public root yalnız ayrı yönetilen external startup boundary'den gelebilecek.
- Trust-root config hiçbir zaman runtime, deployment, route veya GitHub yetkisi
  vermeyecek.
- Gelecekteki release executor, attestation id ve release version için atomik
  replay ledger olmadan uygulanmayacak.

## Consequences

Olumlu:

- self-asserted `verified` alanları release açamaz,
- algorithm confusion yüzeyi daralır,
- key kimliği public key'den deterministik türetilir,
- payload değişikliği ve release-id replay imzayı bozar,
- trust domain, audience, policy, approval zamanı ve verifier metadata'sı imzaya
  bağlıdır,
- ek kripto bağımlılığı eklenmez,
- private key runtime ve repo dışında kalır.

Sınırlamalar:

- İlk gerçek authority/public key henüz yapılandırılmamıştır,
- external startup trust-root yükleme sınırı ve release executor henüz yoktur,
- stateless verifier aynı geçerli paketin tekrarını tek başına tespit edemez;
  executor ledger zorunludur,
- key saklama, çoklu maintainer quorum ve hardware-backed signing ayrı tasarım
  gerektirir,
- bu doğrulayıcı training, checkpoint, benchmark veya AGI kanıtı üretmez,
- Ed25519 post-quantum imza değildir; gelecekte yeni profil eklemek ayrı ADR ve
  migration gerektirir.

## Alternatives Considered

- **Callback'i korumak:** Kriptografik güven vermediği için reddedildi.
- **RSA/ECDSA çoklu algoritma:** Gereksiz karmaşıklık ve algorithm-confusion
  riski nedeniyle reddedildi.
- **Yeni signing dependency:** Node yerleşik Ed25519 yeterli olduğu için
  reddedildi.
- **Repo içinde test key'i yapılandırmak:** Fixture key'in gerçek authority gibi
  algılanma riski nedeniyle reddedildi.
- **İmzayı `recordHash` üzerinde yapmak:** Attestation imzası record hash'in
  parçası olduğundan circular dependency oluşturduğu için reddedildi.

## Follow-up

1. Authority sahipliği ve quorum modeli tanımlanmalı.
2. Hardware-backed veya offline private-key saklama prosedürü seçilmeli.
3. Key rotation/revocation olay runbook'u eklenmeli.
4. İlk public key ayrı, insan onaylı ve güvenlik incelemeli PR olmalı.
5. External startup trust-root loader ve atomik replay ledger ayrı güvenlik
   incelemeleriyle uygulanmalı.
6. Gerçek evidence zinciri oluşmadan release yine `deny` kalmalı.
