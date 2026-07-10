# SEIS Search Browser-Local Demo

`apps/web/seis-search.html` is a standalone SEIS Search demo for the public OS runway.

## What works

- Browser-local search index for SEIS modules, docs, code, agents, prompts, providers, GitHub, design, cloud, files, and roadmap items.
- Search filters: `All`, `Modules`, `Docs`, `Code`, `Agents`, `Prompts`, `Providers`, `GitHub`, `Design`, `Cloud`, `Files`, and `Roadmap`.
- Keyboard-first navigation with `Ctrl K`, Arrow Up, Arrow Down, and Enter.
- Quick open cards, command suggestions, result cards, recent searches, and empty state.
- `localStorage` persistence under `seis.search.demo.v1`.

## Honest state model

- `local-demo`: real browser-local UI and local state.
- `mock`: representative product data, not live repository, web, provider, or GitHub search.
- `planned`: future live search, provider search, and route integrations.
- `disabled`: external fetch and web crawling are intentionally inactive.

## Security boundary

The demo does not crawl the web, query GitHub, call providers, fetch remote files, execute shell commands, read credentials, or require API keys. Live search must be backend-isolated, permissioned, rate-limited, and clearly distinguished from Local Demo mode.

## Validation

Run the focused validator:

```bash
node scripts/check-seis-search-demo.mjs
```

The validator checks required UI labels, filters, keyboard hooks, localStorage usage, honest state labels, documentation coverage, and absence of obvious network or remote-execution code paths.
