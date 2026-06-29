# SEIS Installed AI Tools Registry

## Purpose
Track installed/usable AI tools with safety-aware capabilities.

## Tool categories
- Local model runners
- Coding agents
- Cloud providers
- Design/research assistants
- Note/knowledge assistants

## Tool registry

| Tool | Type | Local/Cloud | Best For | Requires Key | SEIS Usage | Safety Notes | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ollama | local runner | local | local docs, drafts, summaries | no | Local AI experiments and context generation | Local-only, no secret storage | planned/demo |
| Codex | coding agent | cloud | repo-safe implementation, repair, PR loop | account required | PR-safe repo execution | follow AGENTS and no secrets in prompts | available |
| Cursor | IDE assistant | cloud/local | editing, small safe tasks | account required | local IDE support | avoid huge context dumps | available |
| Claude Code | architecture/code reviewer | cloud | deep review, planning | account required | architectural and refactor review | no direct merge, no secrets | available |
| Gemini | cloud agent | cloud | docs/research, ecosystem checks | account required | research and docs cross-check | secrets only in private tooling | planned |
| ChatGPT | cloud agent | cloud | explanation and planning | account required | human-readable planning assistance | do not expose secrets | available |
| GitHub Copilot | coding assistant | cloud | completion support | account required | in-editor coding support | configured per IDE | planned |
| OpenRouter | provider gateway | cloud | model routing experiments | key required | model selection experiments | do not claim production routing | unknown |
| LM Studio | local runner | local | local model testing | no | optional local fallback | isolated local install | planned |
| Obsidian | knowledge app | local | vault authoring and navigation | no | note and backlink workflow | keep secrets out of vault commits | available |

## Safety notes
- No live provider credentials in frontend code.
- Keep provider status metadata explicit.
