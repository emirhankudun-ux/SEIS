---
type: context-pack
module: seis-source-provenance
status: draft
visibility: public
---

# SEIS Source Provenance Intake Context

## Purpose

Use this context pack when reviewing external Kimi Agent Deployment and Stitch archives for SEIS.

## SEIS Identity

SEIS is an Apple-first, Swift-first, AI-native Creative Engineering Operating System. The web layer is a public no-key demo. External generated archives are references, not authority, and never prove live AI capability.

## Relevant Modules

- Source provenance manifest
- SEIS Brain
- AI Core demo/live boundary
- Web demo module catalog
- Future Swift provenance models
- MCP and skills governance

## Allowed Actions

- Read archive listings.
- Record archive names, hashes, sizes, and file counts.
- Build screen taxonomies without importing binaries.
- Propose selected assets for later review.
- Create PR-ready docs, ADRs, and validators.
- Keep Kimi v7 as primary reference and v1-v6 as evolution evidence.

## Forbidden Actions

- Do not commit local absolute paths.
- Do not bulk extract archives into the repo.
- Do not import screenshots, generated bundles, or `code.html` without review.
- Do not claim archives represent live AI.
- Do not add secrets, provider keys, or real SSH metadata.
- Do not rewrite the web demo around imported bundles.

## Public / Private Boundary

Public-safe metadata includes archive names, hashes, sizes, file counts, review status, and blocked-use notes. Private local folder names and user-specific paths stay out of the repository.

## Verification Commands

```bash
node scripts/check-seis-source-provenance-intake.mjs
```

## Output Format

Future source-review work should report:

- Task
- Scope
- Archives reviewed
- Files changed
- Verification
- Security notes
- License and size risks
- Apple-first impact
- AI-native boundary
- Next handoff

## Next Handoff

Create a no-key Stitch screen taxonomy and keep it separate from visual asset import.
