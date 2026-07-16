# SEIS Universal Language Selector Demo

Date: 2026-07-08  
Status: local-demo route ready  
Route: `apps/web/universal-language-selector.html`  
Policy: `content/development/seis-universal-language-atlas.json`  
Validator: `scripts/check-seis-universal-language-selector.mjs`

## What this adds

The Universal Language Selector gives SEIS a GitHub-style language catalog without turning every language into an active runtime.

It is designed for the screenshots that show hundreds of language choices: mainstream languages, legacy languages, formal methods, build systems, config formats, creative/audio/graphics formats, cloud infrastructure formats, and esoteric languages.

## Local demo behavior

The page is static and local-first:

- no external scripts
- no remote fetches
- no provider calls
- no compiler or interpreter install
- no SSH
- no deployment
- no database writes

The UI lets a reviewer search and filter languages by activation tier.

## Activation tiers

| Tier | Meaning |
| --- | --- |
| Active Core | Already part of the current SEIS workflow |
| Ready Extension | Can be added through scoped PRs with tests and rollback |
| Contract Only | Architecture, docs, examples, or parser metadata before runtime |
| Reference Only | Search, catalog, education, and import/export only |
| Blocked | Requires explicit approval, sandbox, SDK/toolchain plan, and review |

## Validation

Run:

```bash
node scripts/check-seis-universal-language-selector.mjs
```

Optional upstream atlas generation remains separate:

```bash
node scripts/sync-seis-github-linguist-language-atlas.mjs --sync-linguist --write
```

## Why this matters

SEIS can now say:

1. I can recognize every GitHub-known language.
2. I know what family it belongs to.
3. I know whether it is active, planned, reference-only, contract-only, or blocked.
4. I do not execute it unless the system has an approved runtime and sandbox boundary.

That makes the language system feel powerful without becoming unsafe or messy.

## Next recommended work

The next route integration should add a visible launcher card from the SEIS Language Matrix or Desktop OS into:

```text
apps/web/universal-language-selector.html
```

Recommended PR slice:

```text
feat: connect universal language selector to SEIS Desktop launcher
```
