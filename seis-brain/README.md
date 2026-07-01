---
type: readme
module: seis-brain
status: active-public-safe
priority: high
visibility: public
owner: SEIS
---

# SEIS Brain

SEIS Brain is the public-safe, Obsidian-compatible knowledge layer for SEIS.
It contains repo-owned Markdown notes and context packs for agents, Apple-native
work, AI workforce handoffs, SEIS-SSH planning, and public GitHub readiness.

This folder is not a private Obsidian vault import. It does not contain private
notes, provider credentials, SSH material, real host details, tokens, or live
provider evidence.

## Current Scope

- Public-safe vault index.
- Public/private boundary note.
- Context packs for Codex, Apple/Xcode work, SEIS-SSH, Obsidian compatibility,
  demo mode, and public readiness.
- Links back to validator-backed repo records.

## Validation

```bash
npm run check:seis-brain-context-packs
```

## Safety

- Keep `seis-brain/private/` and `seis-brain/local-only/` out of public commits.
- Do not copy private Obsidian note bodies into this vault.
- Do not add real provider keys, SSH keys, tokens, host credentials, or `.env`
  values.
- Treat secondary assistant outputs as candidate notes until Codex verifies
  them against repository evidence.
