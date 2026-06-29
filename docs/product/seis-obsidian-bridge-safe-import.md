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

## Dry-Run Manifest Contract

Any future bridge must create a dry-run manifest before import. The manifest
must include a redacted or hashed source path fingerprint, `selectedByUser`,
candidate note count, blocked file count, blocked path matches, secret-scan
summary, provenance labels, publishability labels, redaction summary, attachment
review summary, body import policy, and human approval state.

The default body policy is `metadata-only-by-default`. Private note body text is
not copied into repo-owned fixtures unless a separate review approves a public
fixture. Supported decision labels include `public-safe-metadata-only`,
`needs-redaction`, `needs-provenance-review`, `blocked-private`,
`blocked-secret-risk`, and `blocked-attachment-risk`.

## Repo-Owned Dry-Run Artifact

Current public-demo review can generate a repo-owned dry-run artifact without
reading a real private vault:

```bash
npm run report:seis-obsidian-safe-import-dry-run
npm run check:seis-obsidian-safe-import-dry-run
```

This writes `reports/seis-public-demo/obsidian-safe-import-dry-run-latest.json`
and `reports/seis-public-demo/obsidian-safe-import-dry-run-latest.md`. The
artifact is intentionally limited to repo-owned seed note metadata from
`content/development/seis-second-brain-system.json`; it records
`selectedByUser: false`, `humanApprovalState: not-requested`, and
`bodyImportPolicy: metadata-only-by-default`.

It is not a private Obsidian import. It does not scan a host vault, store an
absolute private path, copy private note bodies, copy attachments, install a
plugin, call providers, execute SSH, mutate GitHub, deploy, or approve release.

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
npm run report:seis-obsidian-safe-import-dry-run
npm run check:seis-obsidian-safe-import-dry-run
npm run check:seis-second-brain-readiness-contracts
```

This is a contract check only. It does not scan a real vault, install a plugin,
call providers, execute SSH, deploy, push, merge, or publish.
