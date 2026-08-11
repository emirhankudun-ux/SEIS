# SEIS — Claude Code Guide

**Workspace:** `seis`
**Owner:** Emirhan Kudun · emirhankudun@gmail.com
**Stack:** Node 22 ESM monorepo plus Apple-first, web, AI/data, Android,
Windows, and infrastructure lanes. No root build step.
**Constitution:** `docs/governance/seis-supreme-v12-constitution.md` — SEIS Supreme
V12 Ultra Enterprise. Operate as the unified AI-native OS it defines: architecture
before shortcuts, quality gates on every change, tool discipline (never claim
unused tools), and the 8-part output format for substantive work.

---

## Repository layout

```
apps/
  web/              Portfolio site (static HTML/CSS/vanilla JS)
packages/
  seis-ai/          AI tooling: MCP server, Claude agent CLI, audit suite
  core/             Shared utilities
  ui/               UI component library
  design-tokens/    Design token definitions
  data/             Data schemas and fixtures
  asset-registry/   Asset catalogue
.mcp.json           Registers seis-mcp for Claude Code auto-discovery
.claude/
  skills/seis-ai/   Claude Code skill: SEIS AI tool reference
```

---

## MCP server (auto-loaded)

`.mcp.json` registers `packages/seis-ai/bin/seis-mcp.mjs` as the `seis` MCP server.
In any Claude Code session it exposes **36 tools**, **3 prompts**, and **31 resources**
— the exact list is pinned by `packages/seis-ai/test/mcp-smoke.test.mjs`, which is
the authority if this table drifts. The web-audit subset:

| Tool | What it checks |
|------|---------------|
| `run_all_checks` | Full audit in one call (9 sections) |
| `i18n_status` | 5-locale key parity in `translations.json` |
| `copy_dictionary_status` | Key parity for the `COPY`/`PROOF` dictionaries the page renders from |
| `i18n_get` | All locale values for a key |
| `i18n_search` | Substring search across keys + values |
| `i18n_add_key` | Atomically add a key to all 5 locales |
| `i18n_rename_key` | Rename a key everywhere — locales + HTML/JS references |
| `i18n_unreferenced` | Keys in translations.json not used in HTML/JS |
| `seo_audit` | 15-point SEO/PWA checklist |
| `web_contract_check` | HTML↔JS selector contract |
| `drawings_catalog` | Drawing file cross-check |
| `style_audit` | CSS: undefined `var(--x)` fails; dead classes reported |
| `web_perf_audit` | File size budgets + render-blocking scripts (6th quality gate) |
| `a11y_check` | Accessibility: `alt` on images, labeled inputs, accessible buttons (7th quality gate) |
| `security_audit` | `target="_blank"` safety, `javascript:` hrefs, mixed content (8th quality gate) |
| `site_config_get` | site-config.json reader |
| `workspace_status` | Monorepo package inventory |

Prompts: `audit_and_fix`, `add_i18n_key(key, meaning)`, `review_locale(locale)`
Resources: `seis://web/translations.json`, `seis://web/site-config.json`

---

## CLI tools

```bash
# Audit the portfolio site
npm run seis:check          # or: node packages/seis-ai/bin/seis-check.mjs

# Watch mode — re-runs on every save
npm run seis:watch          # or: node packages/seis-ai/bin/seis-check.mjs --watch

# Launch the Claude agent
npm run seis:agent -- "task description"
# or with options:
node packages/seis-ai/bin/seis-agent.mjs --model sonnet --write "add i18n key foo"

# MCP server (stdio)
npm run seis:mcp

# Unit tests
npm run seis:test
```

**`ANTHROPIC_API_KEY`** is required for `seis:agent`.

---

## Portfolio site (`apps/web/`)

### Strict HTML↔JS contract
`script.js` queries the DOM by **literal** `#id` and `.class` selectors. Any element
renamed in `index.html` without updating `script.js` (or vice versa) silently breaks
the site. **Always run `seis:check` after editing either file.**

### i18n — two layers, and only one of them is live

There are two independent translation systems in this repo. Know which one you
are editing before you touch either.

**Layer A — `translations.json` (5 locales, 217 dotted keys).**
`tr` (default), `en`, `fr`, `it`, `de`; flat object per locale. Bound via
`data-i18n="key"` / `data-i18n-placeholder` / `data-i18n-aria-label` in HTML and
`getT("key", lang)` in JS. Audited by `i18n_status`, `i18n_unreferenced`, the Lua
`data-i18n` attribute audit, the jq parity audit, and the Ruby/R stats tools.

**`index.html` currently contains zero `data-i18n` attributes and zero `getT()`
calls.** Nothing loads `translations.json` — the only reference to it anywhere is
the service worker PRECACHE list. `i18n_status` therefore reports
`0 referenced` and prints a `WARN`: its parity and empty-value halves still do
real work on the file, but its referenced-key half cannot fail and proves
nothing. Do not read a green `i18n` line as "the site's translations are fine".

**Layer B — the `COPY` and `PROOF` dictionaries inside `script.js` (2 locales).**
`en` and `tr` only. Bound via `data-copy-key="key"` in HTML (138 bindings) and
`COPY[lang].key` in JS. **This is what the page actually renders.** Its keyspace
is camelCase and has zero overlap with `translations.json`. Audited by
`copy_dictionary_status`, which fails on locale disagreement, on a value empty in
any locale, and on a `data-copy-key` with no dictionary entry.

Rules:
- **Never add a key to only one locale**, in either layer. For layer A use the
  `i18n_add_key` MCP tool or `i18nAddKey()`; for layer B add to `en` and `tr`
  together and run `seis:check`.
- Adding a `data-copy-key` to the HTML without a matching `COPY` entry now fails
  the audit rather than silently rendering untranslated fallback text.
- Reconciling the two layers (migrating layer B onto `translations.json`, or
  retiring the unused file and its three-locale surplus) is an open
  architectural decision, not a cleanup — it is deliberately not done here.

### After any edit to `index.html`, `script.js`, `style.css`, or `translations.json`
```bash
npm run seis:check   # must pass all 9 checks before committing
```

---

## Agent usage

```bash
# Review and explain audit failures
node packages/seis-ai/bin/seis-agent.mjs "Run all checks and explain any failures"

# Review translations
node packages/seis-ai/bin/seis-agent.mjs --model sonnet "Review French translations for tone"

# Add an i18n key (needs --write)
node packages/seis-ai/bin/seis-agent.mjs --write "Add services.consulting.title to all 5 locales"

# Multi-turn session (history kept in .seis/sessions/<name>.json, gitignored)
node packages/seis-ai/bin/seis-agent.mjs --session audit "Run all checks"
node packages/seis-ai/bin/seis-agent.mjs --session audit --write "Fix what you found"

# Model aliases: fable | opus (default) | sonnet | haiku
```

## Claude Code slash commands

- `/seis-audit` — run the full audit via MCP and fix failures
- `/seis-i18n <task>` — add/rename/review translation keys (all 5 locales)

---

## Polyglot toolchain (`polyglot/` + `scripts/polyglot-check.sh`)

Thirty-three non-JS languages each contribute a real, tested tool that audits what
the JS suite cannot. One command runs them all:

```bash
./scripts/polyglot-check.sh      # PASS/FAIL/SKIP per language lane
```

| Language | Tool | Unique value |
|----------|------|--------------|
| Python | `seis_image_audit.py` | JPEG/PNG/WebP dimensions from binary headers; asset budget |
| Python | `seis_icon_gen.py` | Deterministic PWA icon PNGs from manifest colors (zero deps) |
| Python | `seis_color_contrast.py` | WCAG 2.1 contrast ratios for all fg/bg color-token pairs (AA/AAA) |
| Python | `seis_sw_cache_audit.py` | Service worker PRECACHE integrity — all listed files verified on disk |
| Rust | `seis-link-audit/` | Every local href/src/url() + manifest icon resolves on disk |
| Go | `cmd/seis-serve/` | Local preview server with production CSP/security headers |
| Go | `cmd/seis-jsonld/` | JSON-LD schema.org Person + WebSite block validation |
| C | `seis_utf8_check.c` | Strict UTF-8 (rejects overlongs, surrogates, truncation) |
| C++ | `seis_translations_lint.cpp` | Duplicate JSON keys that `JSON.parse` silently swallows |
| Ruby | `i18n_stats.rb` | Per-locale volume stats + untranslated-value suspects |
| Ruby | `html_heading_audit.rb` | Heading hierarchy (1 h1, no skips) + landmark presence audit |
| Ruby | `favicon_audit.rb` | Icon `<link>` href files verified on disk (favicon.svg, apple-touch-icon, etc.) |
| PHP | `contact-endpoint.php` | Reference form endpoint (honeypot, anti-injection) |
| Java | `DrawingsChecksum.java` | SHA-256 ledger of the 20 drawings (`drawings.sha256`) |
| Java | `CssMediaQueryAudit.java` | CSS responsive breakpoints + prefers-reduced-motion + print query presence |
| Perl | `hygiene_lint.pl` | BOM / CRLF / trailing-whitespace / final-newline lint |
| Perl | `robots_txt_audit.pl` | robots.txt syntax: User-agent, Disallow paths, Sitemap https, no HTML content |
| AWK | `css_var_histogram.awk` | CSS `var(--x)` token frequency; top-used + single-use suspects |
| TypeScript | `seis_config_validator.ts` | Strict type-checked validation of manifest + site-config + translations |
| SQL | `audit_ledger.sqlite.sql` | SQLite audit-ledger schema (tables, CHECK constraints, trigger, views) — SKIP if no sqlite3 |
| jq | `seis_translations_audit.jq` | JSON set-theory audit of locale key parity; advisory empty-value report |
| XML | `seis_sitemap_check.sh` | xmllint-based sitemap.xml well-formedness, namespace, hreflang, https checks |
| sed | `seis_css_vars_defined.sh` | Defined-vs-used CSS custom property cross-check (GNU sed sentinel) |
| YAML | `seis_workflow_lint.sh` | yq-based CI governance lint — trigger, timeout, and job-name enforcement |
| Bash | `seis_shell_audit.sh` | bash -n syntax check + shebang + `set -u` guard on all repo shell scripts |
| bc | `seis_budget_check.bc` + `.sh` | Arbitrary-precision asset budget math (HTML/CSS/JS/media KB vs. thresholds) |
| Bun | `seis_js_quality_audit.ts` | JS production quality: no eval, document.write, unsafe innerHTML, console.log, TODO |
| Lua | `seis_i18n_attr_audit.lua` | All `data-i18n*` HTML attribute keys verified against tr locale (Lua 5.4, zero deps) — **inert on `index.html`, which has no `data-i18n` attributes; see the i18n section above** |
| Tcl | `seis_meta_tags_check.tcl` | 12-point SEO/social meta-tag completeness: title, description, OG, Twitter Card |
| R | `seis_translation_stats.R` | Statistical analysis of string length ratios across 5 locales (flags ≥3× overflow risk) |
| Haskell | `seis_css_unit_audit.hs` | CSS dimension unit histogram + font-size px check (only root/body/html px accepted) |
| OCaml | `seis_css_selector_stats.ml` | CSS selector type distribution; fails if ID-selector ratio exceeds 25 % |
| Nim | `seis_html_img_audit.nim` | All `<img>` tags must have alt attribute; loading attribute advisory |
| Elixir | `seis_html_anchor_audit.exs` | `target="_blank"` anchors must have `rel="noopener"` or `rel="noreferrer"` (tab-napping) |
| Groovy | `seis_json_files_check.groovy` | All `.json` files parse + manifest/site-config/translations key presence |
| Kotlin | `seis_css_font_audit.kts` | Every `--font-*` CSS custom property must have a generic-family fallback |
| Guile | `seis_hreflang_audit.scm` | All 5 locale + x-default hreflang links present, no duplicates, all HTTPS |
| Racket | `seis_pwa_manifest_audit.rkt` | PWA manifest: display mode, hex colors, icon sizes (192×192 + 512×512) |
| Common Lisp | `seis_html_id_uniqueness.lisp` | All `id=` attribute values are unique (no duplicate IDs) |
| SWI-Prolog | `seis_html_tabindex_audit.pl` | Detects positive `tabindex` values — accessibility anti-pattern (WCAG 2.4.3) |
| Chicken Scheme | `seis_html_button_types.scm` | `<button>` tags inside `<form>` must have explicit `type=` to prevent accidental submit |

Each tool ships its own tests (`test_*.py`, `cargo test`, `go test`,
`--self-test` modes). CI: `.github/workflows/polyglot.yml`.
TypeScript typings for the audit reports: `packages/seis-ai/types/seis-ai.d.ts`.

---

## Development conventions

- All source is ESM (`.mjs`). No transpilation.
- No frameworks on the portfolio site — vanilla JS only, no bundler.
- Keep edits minimal and consistent with existing code style.
- Commits on branch `claude/laughing-ride-4dnijl`, PR #17 targets `main`.
