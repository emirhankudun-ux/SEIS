---
name: seis-audit
description: Run the full SEIS web audit via the seis MCP server and fix any failures.
allowed_tools: ["mcp__seis__run_all_checks", "mcp__seis__i18n_status", "mcp__seis__web_contract_check", "mcp__seis__seo_audit", "mcp__seis__style_audit", "mcp__seis__drawings_catalog", "Read", "Edit", "Bash"]
---

# /seis-audit

Audit the portfolio site (`apps/web/`) and repair anything broken.

## Sequence

1. Call the `seis` MCP tool `run_all_checks`.
2. If every section is `ok`, report the healthy state in two sentences — done.
3. For each failing section, in this order:
   - **contract** — a selector in `script.js` has no matching element in `index.html`.
     Decide which side is wrong by reading both; restore the contract with the
     smallest edit.
   - **i18n** — keys missing from some locale or referenced-but-undefined.
     Never add a key to fewer than all 5 locales; use `i18n_add_key`.
   - **style** — `var(--x)` used but defined nowhere. Define it or fix the typo.
   - **seo / drawings** — restore the missing tag or file reference.
4. Re-run the matching check tool after each fix; finish with `run_all_checks`
   and `npm run seis:test`.
5. Summarise: files changed, checks status before → after.
