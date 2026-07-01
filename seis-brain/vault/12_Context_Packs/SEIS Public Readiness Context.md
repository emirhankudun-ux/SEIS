---
type: context-pack
module: public-readiness
status: active-public-safe
priority: critical
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Public GitHub
forbidden_destinations:
  - GitHub mutation without approval
  - release publication without approval
  - credential-bearing prompt
---

# SEIS Public Readiness Context

## Purpose

Public readiness means SEIS can be reviewed safely on GitHub by other people
without exposing credentials, private notes, SSH material, fake live AI claims,
or broken demo expectations.

## Current Rule

SEIS is not public/release ready merely because docs or local checks exist.
Public readiness requires current evidence for docs, no-key demo behavior,
secret hygiene, validation commands, accessibility, repository governance, and
explicit approval before GitHub mutation or publication.

## Source Records

- `README.md`
- `SECURITY.md`
- `docs/STATUS.md`
- `docs/INDEX.md`
- `docs/product/seis-second-brain.md`
- `content/development/seis-public-demo-release-checklist-pr54.json`

## Required Review Areas

- README and setup clarity.
- Demo works without provider keys.
- No secrets or private vault content.
- Apple-first direction is documented.
- SEIS Brain context is public-safe.
- SEIS-SSH remains credential-free until approved live checks.
- Validators and reported command results match current state.

## Forbidden Claims

- Do not claim release readiness without release gates.
- Do not claim deployment without a deployment dry-run or live deployment
  evidence.
- Do not claim live provider access from metadata.
- Do not claim live SSH access from docs.
- Do not publish private vault imports.

## Verification Commands

```bash
npm run check:seis-brain-context-packs
npm run check:seis-second-brain-readiness-contracts
git diff --check
```

## Handoff Output

Every public-readiness handoff should include changed files, checks run,
checks not run, security notes, blockers, rollback notes, and a suggested PR title/body.
