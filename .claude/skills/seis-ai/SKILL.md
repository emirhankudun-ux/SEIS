# SEIS AI — Skill Guide

> Package: `packages/seis-ai/` · Entry points: `bin/seis-agent.mjs`, `bin/seis-mcp.mjs`, `bin/seis-check.mjs`

## What this package does

`@seis/ai` is the AI-operations layer for the SEIS monorepo. It ships three runnable programs:

| Binary | Purpose |
|--------|---------|
| `seis-check` | Zero-dependency static audit of `apps/web/` — i18n parity, SEO tags, HTML↔JS selector contract, drawing file integrity |
| `seis-agent` | Claude-powered agentic CLI that can read/grep the whole repo and optionally write files |
| `seis-mcp` | MCP server exposing the same audit capabilities as tools + resources to any MCP client (Claude Code, Claude Desktop, etc.) |

---

## MCP server tools

The MCP server (`seis-mcp`) exposes these tools — use them when answering questions about the portfolio site:

| Tool | Description |
|------|-------------|
| `i18n_status` | Full i18n parity report: missing keys, referenced-but-absent, empty-everywhere |
| `i18n_get` | Fetch all locale values for one key |
| `i18n_search` | Search translations by key fragment or value substring |
| `i18n_add_key` | Add a new translation key to all 5 locales atomically |
| `i18n_rename_key` | Rename a key in all locales + rewrite HTML/JS references |
| `seo_audit` | 15-point SEO/PWA checklist against `index.html` |
| `web_contract_check` | Verify that every `q("…")` / `qa("…")` literal in `script.js` has a matching element in `index.html` |
| `drawings_catalog` | Cross-check `<img src="public/media/drawings/…">` references vs files on disk |
| `style_audit` | CSS audit: fails on `var(--x)` with no definition; reports dead classes (info) |
| `web_perf_audit` | Performance budget: file sizes (HTML ≤ 100 KB, CSS ≤ 100 KB, JS ≤ 150 KB, total ≤ 300 KB), render-blocking scripts; advisory: images without `loading="lazy"` or `width`/`height` |
| `a11y_check` | Accessibility audit: fails on `<img>` missing `alt=`, unlabeled form controls, and buttons with no accessible name; advisory: positive tabindex |
| `security_audit` | Security audit: fails on `target="_blank"` without `rel="noopener noreferrer"`, `javascript:` hrefs, `http://` mixed content; advisory: missing CSP, external resources without `integrity=` |
| `site_config_get` | Read `site-config.json` (name, email, social links, etc.) |
| `i18n_unreferenced` | Translation keys never referenced from HTML/JS |
| `workspace_status` | Monorepo package inventory |
| `run_all_checks` | Run all checks at once and return a combined pass/fail report (8 sections: i18n, seo, contract, drawings, style, perf, a11y, security) |

MCP prompts (pre-built workflows — `prompts/get`):
- `audit_and_fix` — run the audit, fix every failure, re-verify
- `add_i18n_key(key, meaning)` — draft on-brand copy for all 5 locales and add it
- `review_locale(locale)` — tone/grammar/consistency review of one locale

MCP resources:
- `seis://web/translations.json` — raw translation file content
- `seis://web/site-config.json` — raw site config

---

## Agent CLI usage

```bash
# Audit and explain failures
node packages/seis-ai/bin/seis-agent.mjs "Run all checks and explain any failures"

# Review a locale
node packages/seis-ai/bin/seis-agent.mjs --model sonnet "Review the French translations for tone"

# Add a new i18n key (write mode required)
node packages/seis-ai/bin/seis-agent.mjs --write "Add the key services.title to all 5 locales"

# Cap turns for quick tasks
node packages/seis-ai/bin/seis-agent.mjs --max-turns 8 --quiet "What SEO tags are present?"

# Multi-turn session — conversation persists in .seis/sessions/<name>.json
node packages/seis-ai/bin/seis-agent.mjs --session review "List i18n issues"
node packages/seis-ai/bin/seis-agent.mjs --session review --write "Fix issue #2"
```

Environment variable required: `ANTHROPIC_API_KEY`

Model aliases: `fable` → `claude-fable-5`, `opus` → `claude-opus-4-8` (default), `sonnet` → `claude-sonnet-4-6`, `haiku` → `claude-haiku-4-5`

---

## Agent tools (available inside the loop)

| Tool | Read/Write | Description |
|------|-----------|-------------|
| `list_files` | R | Directory listing relative to repo root |
| `read_file` | R | Read any file inside the repo root (64 KB pages) |
| `grep_repo` | R | Regex search across files |
| `git_diff` | R | Show uncommitted changes (`git diff HEAD`); `staged: true` for staged-only |
| `git_log` | R | Recent commit history (`git log --oneline`); `count` param (default 10) |
| `run_checks` | R | Audit scopes: `i18n`, `seo`, `contract`, `drawings`, `style`, `perf`, `a11y`, `security`, `all` |
| `edit_file` | **W** | Exact-string replacement; old_string must be unique (needs `--write`) |
| `write_file` | **W** | Full file write for new files/rewrites (needs `--write`) |

Path traversal is blocked: all file operations are constrained to the repo root.

---

## Internals

```
packages/seis-ai/
  src/
    lib/
      repo.mjs          # resolveRepoRoot(), resolveWebRoot(), resolveInside()
      checks.mjs        # i18nStatus, seoAudit, contractCheck, drawingsCatalog, runAllChecks
      i18n-write.mjs    # i18nAddKey() — atomically adds a key to all 5 locales
    mcp/
      server.mjs        # McpServer + StdioServerTransport wiring, tool+resource definitions
    agent/
      tools.mjs         # toolDefinitions() + executeTool() for the Messages API loop
      loop.mjs          # runAgent() — streaming agentic loop with pause_turn / tool_use handling
  bin/
    seis-check.mjs      # CLI runner for runAllChecks()
    seis-agent.mjs      # CLI runner for runAgent()
    seis-mcp.mjs        # Launches MCP server
  test/
    checks.test.mjs     # audit functions (i18n/seo/contract/drawings)
    i18n-write.test.mjs # i18nAddKey validation + write behaviour
    repo.test.mjs       # path traversal guard + root resolution
    agent.test.mjs      # tool executor + agentic loop (mock client)
    mcp-smoke.test.mjs  # spawns the real MCP server over stdio (JSON-RPC)
```

CI: `.github/workflows/seis-ai.yml` runs the audit + full test suite on every PR
touching `packages/seis-ai/**` or `apps/web/**`.

---

## When editing the portfolio site

After any change to `index.html`, `script.js`, or `translations.json`, run:

```bash
node packages/seis-ai/bin/seis-check.mjs
```

All four checks must pass before committing. The most common failures:
- **i18n**: a key added to one locale only — always add to all 5
- **contract**: a `q("#id")` call where the `id` was renamed or removed in HTML
- **seo**: missing meta tag or robots.txt/sitemap.xml

---

## Integration & training ledger

All four SEIS AI surfaces (MCP tools + bin CLIs, polyglot lanes, audit entry points,
and the composed agent lanes/skills) are unified into one self-verifying capability
map. Regenerate or verify it with:

```bash
npm run seis:integrate                       # write data/seis-ai-integration-training.json
npm run check:seis-ai-integration-training   # fail on drift or a stale ledger
```

---

## i18n system quick reference

- 5 locales: `tr` (default), `en`, `fr`, `it`, `de`
- Keys live in `apps/web/translations.json` — flat object per locale
- HTML uses `data-i18n="key"`, `data-i18n-placeholder="key"`, `data-i18n-aria-label="key"`
- JS uses `getT("key", lang)` for runtime lookups
- The current locale is stored in `localStorage["lang"]` and applied via `data-lang` on `<html>`
