---
type: context-pack
module: hermes-handoff
status: available-local-review-route
priority: medium
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Hermes with sanitized context only
forbidden_destinations:
  - Hermes with secrets
  - private vault import
  - live provider prompt with credentials
---

# SEIS Hermes Handoff Context

## Current State

Hermes is visible as a desktop assistant surface in the SEIS workspace. The
local OpenAI Codex provider route returned a sanitized `HERMES_OK` smoke, while
Nous Portal remains not logged in.

## Handoff Boundary

Hermes is an available local secondary review candidate. It is not product AI
implementation evidence, not broad live provider proof, and not a repository
writer.

## Allowed Use

Hermes may receive a sanitized handoff package containing:

- objective
- affected paths
- included context
- excluded context
- requested output format
- forbidden actions
- validation command
- approval boundary

## Forbidden Inputs

- Provider keys.
- SSH material.
- Private Obsidian notes.
- Real host credentials.
- Personal sensitive data.
- `.env` values.

## Codex Follow-Up

Codex must verify any Hermes output against repository evidence before accepting
it into source-of-truth docs, Swift metadata, validators, PR descriptions, or
future SEIS Brain notes.

## Verification Commands

```bash
npm run check:seis-installed-ai-tools-registry
npm run check:ai-workforce-assignments
npm run check:seis-brain-context-packs
```
