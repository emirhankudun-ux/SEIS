---
type: adr
module: seis-ssh
status: draft
visibility: public
updated: 2026-06-29
---

# ADR-0009 SSH Public-Safe by Default

## Decision
SEIS-SSH belgeleri, örnek profiller ve doğrulama akışları yalnızca public-safe metadata ile tutulacaktır.

## Context
Şeffaf ve güvenli GitHub-ready çalışma için gerçek host, kullanıcı adı ve anahtar bilgilerinin repoya taşınması engellenmelidir.

## Decision drivers
- Güvenlik ve geri alabilirlik gereksinimi.
- Canlı erişim ile demo-belgesi ayrımı.
- Yanlış güvenlik iddialarından kaçınma.

## Consequences
- `SEIS_SSH.md` sadece örnek, plan ve kontrol listesi içerebilir.
- Gerçek bağlantı adımları sadece lokal ortamda tutulur ve doğrulanarak yürütülür.
