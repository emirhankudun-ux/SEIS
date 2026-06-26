# SEIS Obsidian Bridge Safe Import

## Purpose

This document defines the safe import plan for a future Obsidian bridge into
SEIS Second Brain.

Current status: planned-gated. SEIS does not import a private Obsidian
vault today, does not install an Obsidian plugin, and does not read host
filesystem notes from the browser demo.

Source contract:
`content/development/seis-obsidian-bridge-safe-import-contract.json`

## Current Boundary

- Current Second Brain notes are repo-owned Local Demo records.
- Browser-local VFS exports under `/home/seis/SecondBrain` are demo artifacts.
- No private note body is copied into repo-owned fixtures by default.
- Private vault paths, note bodies, attachments, `.obsidian` settings, and
  private plugin state are not committed by default.
- GitHub publication from an imported vault requires separate human approval.

## Safe Import Phases

| Phase | Status | Required gate |
| --- | --- | --- |
| Select vault | Planned | Explicit user-selected local vault path. No automatic home-directory scan. |
| Preflight scan | Planned | Human approval before scanning selected Markdown files. |
| Provenance review | Planned | Source category, license/provenance status, and publishability label. |
| Sanitized import preview | Planned | Redacted local preview; no private note body by default. |
| Public sync | Blocked | Separate GitHub publication approval. |

## Forbidden By Default

- Automatic Obsidian plugin install.
- Automatic private vault discovery.
- Committing private note body text.
- Committing `.obsidian` workspace/plugin settings.
- Copying attachments without provenance review.
- Storing absolute private vault paths in repo records.
- Sending private vault content to AI providers.
- GitHub push, merge, release, or Pages publication from the bridge.

## Allowed Today

- Document safe import requirements.
- Render repo-owned browser-local seed notes.
- Export browser-local Markdown snapshots under `/home/seis/SecondBrain`.
- Validate no-secret and no-private-vault boundaries.

## Validation

```bash
npm run check:seis-second-brain-readiness-contracts
```

This is a contract check only. It does not scan a real vault, install a plugin,
call providers, execute SSH, deploy, push, merge, or publish.
