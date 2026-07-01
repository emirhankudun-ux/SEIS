---
type: context-pack
module: codex
status: active-public-safe
priority: high
visibility: public
owner: SEIS
allowed_destinations:
  - Codex
  - Public GitHub
forbidden_destinations:
  - private vault import
  - live provider prompt with secrets
---

# SEIS Codex Context

## Identity

SEIS is an Apple-first, AI-native creative engineering operating system and
public GitHub showcase. The ecosystem itself is the product.

## Current Writer Rule

Codex remains the default repository writer and validator. Secondary assistants
may review sanitized context, but they do not write, push, merge, deploy,
execute SSH, or handle credentials unless a human explicitly approves a bounded
handoff.

## Current Evidence

- `AGENTS.md`
- `docs/ai/seis-ai-core.md`
- `packages/seis_platform_swift/README.md`

## Allowed Actions

- Inspect repo files.
- Apply focused patches.
- Add public-safe docs, contracts, validators, and Swift metadata.
- Run local validation commands.
- Prepare PR-ready summaries.

## Forbidden Actions

- Push directly to `main`.
- Force push.
- Commit secrets or private vault content.
- Claim live AI, live SSH, deployment, or provider access without evidence.
- Rewrite the web demo or large architecture without explicit approval.

## Verification Commands

```bash
npm run check:seis-brain-context-packs
swift test --package-path packages/seis_platform_swift
git diff --check
```

## Output Format

Report files changed, why they changed, commands run, results, security notes,
remaining risks, and a suggested PR title/body.
