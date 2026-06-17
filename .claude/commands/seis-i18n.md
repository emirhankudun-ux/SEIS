---
name: seis-i18n
description: Add, rename, or review translation keys across the 5 locales (tr/en/fr/it/de).
allowed_tools: ["mcp__seis__i18n_status", "mcp__seis__i18n_get", "mcp__seis__i18n_search", "mcp__seis__i18n_add_key", "mcp__seis__i18n_rename_key", "mcp__seis__i18n_unreferenced", "mcp__seis__web_contract_check", "Read", "Edit"]
---

# /seis-i18n

Translation operations for the portfolio site. The argument describes the task,
e.g. `/seis-i18n add a key for the new pricing section heading` or
`/seis-i18n rename fm.phone to fm.telephone`.

## Rules

- **All five locales, always**: tr (source language), en, fr, it, de.
  A key existing in only some locales is a defect — `i18n_status` will fail.
- Before adding: `i18n_search` for similar keys to match naming conventions
  (`nav.*`, `hero.*`, `fm.*` for the contact form, `wk.*` for work section).
- Adding: draft copy in all 5 languages matching the tone of neighbouring keys
  (professional portfolio voice), then one `i18n_add_key` call.
- Renaming: use `i18n_rename_key` — it rewrites `data-i18n*` attributes in
  index.html and `getT()` calls in script.js automatically. Verify with
  `web_contract_check` + `i18n_status` afterwards.
- Reviewing: read the values via `i18n_get`/`i18n_search` and compare against
  the Turkish source for register, grammar, and terminology consistency.
- Finish with `i18n_status` and report parity.
