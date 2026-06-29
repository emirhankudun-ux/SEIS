# SEIS Second Brain

## Purpose
SEIS Second Brain is a markdown-first memory layer that helps the team and AI agents remember context across releases.

## Why SEIS needs a second brain
- Keep product and architecture decisions discoverable.
- Preserve lessons from failed attempts and risky experiments.
- Reduce repeated onboarding and context loss.
- Provide safe, public-safe memory for GitHub contributors.

## What the second brain stores
- Product vision, architecture, design, and roadmap decisions.
- AI Core and provider/router/agent governance.
- Module status, mock-planned-real markers, and release blockers.
- CI/doc/deployment learnings and notable fixes.
- Public-safe onboarding and usage guidance.

## What it must never store
- Private keys, tokens, real passwords, private hostnames.
- `.env` values, service account files, personal data, unpublished secrets.
- Any private SSH credentials or proprietary code dumps.

## Obsidian vault structure
The vault is `seis-brain/vault` and is Obsidian-compatible with plain Markdown and optional backlinks.

## Public/private boundary
Only public-safe memory is committed. Private memory remains outside this repository.

## AI agent context packs
Context packs live in `seis-brain/vault/12_Context_Packs` and describe handoff-safe operating rules.

## Decision ledger
Decision records are stored in `seis-brain/vault/09_Decisions`.

## Failure ledger
Failure and learning notes are stored under `seis-brain/vault/10_Logs`.

## Roadmap memory
Roadmap snapshots are stored in `seis-brain/vault/11_Roadmap` and linked from core index notes.

## SEIS Search integration
Search metadata should be driven from public-safe notes and context packs. Private notes are excluded.

## Future app integration
Later, a `SeisBrain` panel can read these notes for overview and copy-friendly context packs.

## Verification checklist
- [ ] `seis-brain/README.md` exists.
- [ ] Core index notes exist.
- [ ] At least one architecture and one AI note exists.
- [ ] ADR and context pack files exist.
- [ ] Public/private boundary is documented.

## Next steps
- Add context-packer templates.
- Add docs-to-vault QA checklist and run book.
- Add agent registry and install matrix in vault notes.
