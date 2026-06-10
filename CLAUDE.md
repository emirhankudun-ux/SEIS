# SEIS — Claude Code Guide

**Workspace:** `ui-ux-digital-lab-workspace`  
**Owner:** Emirhan Kudun · emirhankudun@gmail.com  
**Stack:** Node 22 ESM monorepo — `"type":"module"` everywhere. No build step.  
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
In any Claude Code session it exposes **14 tools**, **3 prompts**, and **2 resources**:

| Tool | What it checks |
|------|---------------|
| `run_all_checks` | Full audit in one call (6 sections) |
| `i18n_status` | 5-locale key parity |
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

### i18n system
- 5 locales: `tr` (default), `en`, `fr`, `it`, `de`
- All keys in `apps/web/translations.json` — flat object per locale
- HTML: `data-i18n="key"`, `data-i18n-placeholder="key"`, `data-i18n-aria-label="key"`
- JS: `getT("key", lang)`
- **Never add a key to only one locale.** Use `i18n_add_key` MCP tool or `i18nAddKey()`.

### After any edit to `index.html`, `script.js`, `style.css`, or `translations.json`
```bash
npm run seis:check   # must pass all 5 checks before committing
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

## Development conventions

- All source is ESM (`.mjs`). No transpilation.
- No frameworks on the portfolio site — vanilla JS only, no bundler.
- Keep edits minimal and consistent with existing code style.
- Commits on branch `claude/laughing-ride-4dnijl`, PR #17 targets `main`.
