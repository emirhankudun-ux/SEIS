# SEIS Obsidian Second Brain Setup

This guide explains the public-safe Obsidian-compatible path for SEIS Second
Brain. It is a setup and review entry point, not a private vault import feature.

## Current Status

SEIS currently ships a repo-owned, browser-local Second Brain foundation:

- public-safe Markdown context packs in `seis-brain/vault/12_Context_Packs/`
- a public/private boundary note in
  `seis-brain/vault/13_Public_Private_Boundaries/`
- Local Demo browser records for vault notes, graph links, review gates, and
  GitHub readiness exports
- a planned-gated Obsidian bridge safe import contract

SEIS does not import a private Obsidian vault today. It does not install an
Obsidian plugin, scan home directories, read host filesystem notes from the web
demo, send private note bodies to AI providers, or publish imported notes to
GitHub.

## Public-Safe Setup

Use the repo-owned vault first:

```bash
open seis-brain
```

Then inspect:

- [`seis-brain/README.md`](../seis-brain/README.md)
- [`docs/product/seis-second-brain.md`](./product/seis-second-brain.md)
- [`docs/product/seis-obsidian-bridge-safe-import.md`](./product/seis-obsidian-bridge-safe-import.md)
- [`seis-brain/vault/00_Index/SEIS Brain Index.md`](../seis-brain/vault/00_Index/SEIS%20Brain%20Index.md)
- [`seis-brain/vault/13_Public_Private_Boundaries/Public Safe Boundary.md`](../seis-brain/vault/13_Public_Private_Boundaries/Public%20Safe%20Boundary.md)

These files can be opened in Obsidian as plain Markdown. No required Obsidian
plugin is part of the public setup. No required Obsidian plugin should be added
without a separate reviewed integration plan.

## Allowed Today

- Edit public-safe architecture, context-pack, roadmap, and handoff notes.
- Add links between repo-owned SEIS Brain notes.
- Use frontmatter for status, module, priority, and visibility.
- Keep context packs concise enough for AI assistants to use safely.
- Run validators before a PR.

## Forbidden Today

- Do not commit private note bodies.
- Do not commit `.obsidian` workspace state or plugin settings.
- Do not store absolute private vault paths.
- Do not copy private attachments without provenance review.
- Do not send private vault content to cloud AI providers.
- Do not publish imported private material to GitHub without explicit approval.

## Future Import Gate

A real Obsidian bridge must stay explicit-user-selected and review-gated:

1. User selects a local vault path.
2. SEIS creates a dry-run manifest.
3. Human review labels provenance and publishability.
4. Sanitized preview is reviewed before any repo write.
5. GitHub publication requires separate approval.

## Validation

```bash
npm run check:seis-brain-context-packs
npm run check:seis-second-brain
npm run check:seis-second-brain-readiness-contracts
npm run check:seis-public-readiness-docs
```

If `npm` is unavailable, run the corresponding `node scripts/...` checks
directly when they are single-file Node validators.
