---
type: policy
module: seis-security
status: draft
visibility: public
updated: 2026-06-29
---

# Private Data Policy

## What must stay local-only
- Gerçek SSH host bilgileri ve anahtarlar
- API token/private key
- Kişisel veri, e-posta listeleri, erişim kimlikleri
- Özel altyapı topolojisi

## Commit and PR rule
- Public repo only contains public-safe abstractions and placeholders.
- private-only artifacts are kept in local untracked paths.
