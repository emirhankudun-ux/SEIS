# SEIS Obsidian Safe Import Dry-Run

Generated: 2026-06-30T21:17:59.090Z
Status: repo-owned-seed-notes-only
Mode: dry-run-no-private-vault-read
Decision: NO-GO-private-vault-import-not-approved

## Scope

This artifact is repo-owned seed notes only. No private Obsidian vault was read,
no host filesystem vault was scanned, no Obsidian plugin was installed, no note
body was imported, no provider was called, no SSH was executed, and no GitHub
mutation was performed.

## Dry-Run Manifest

- sourcePathFingerprint: sha256:599309a96507e78f5b85a7ae7c2eea9e975559a93057ebaeeff75f07426c0f7e
- selectedByUser: false
- candidateNoteCount: 6
- blockedFileCount: 0
- blockedPathMatches: 0
- secretScanSummary: passed, findings 0
- bodyImportPolicy: metadata-only-by-default
- humanApprovalState: not-requested

## Candidate Seed Notes

| Note | Status | Provenance | Publishability |
| --- | --- | --- | --- |
| seis-os-map | real-local-demo | repo-owned-seed | public-safe-metadata-only |
| ai-core-router | local-demo | repo-owned-seed | public-safe-metadata-only |
| sub-agent-council | status-plan-only | repo-owned-seed | public-safe-metadata-only |
| obsidian-bridge | planned | repo-owned-seed | public-safe-metadata-only |
| github-readiness | human-review-required | repo-owned-seed | public-safe-metadata-only |
| security-review | active-guardrail | repo-owned-seed | public-safe-metadata-only |

## Approval Boundary

Private Obsidian import stays blocked until a user explicitly selects a local
vault path, approves a dry-run scan, reviews provenance/redaction output, and
separately approves any public GitHub fixture or publication.
