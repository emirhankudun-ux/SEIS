# SEIS Installed AI Tools Registry

## Purpose

Track what AI tooling is conceptually available to SEIS contributors, including local tools,
coding agents, cloud providers, and knowledge tools.

This is a planning registry, not a live capability claim.

## Tool categories

- local model runners
- coding agents
- cloud providers
- design/research assistants
- knowledge assistants

## Local AI tools

- Ollama: local, optional, docs-first workflows

## Coding agents

- Codex: coding and review assistance
- Cursor: local editing assistance
- Claude Code: long-horizon architecture coding support

## Cloud AI providers

- OpenAI/ChatGPT
- Gemini
- OpenRouter
- Future local-or-cloud model routers

## Design / search assistants

- Design copilots and research assistants are model-category tools with optional
  provider dependencies.

## Obsidian / knowledge tools

- Obsidian: note graph and markdown navigation
- Local markdown tooling for context generation

## Safety notes

- No tool status is treated as live proof unless evidence exists.
- Never include secrets, keys, or credentials in tool entries.
- Draft outputs are not authoritative.

## Tool registry table

| Tool | Type | Local / Cloud | Best For | Requires Key | SEIS Usage | Safety Notes | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ollama | local model runner | local | local docs, summaries, context packs | no | optional local AI drafts | local-only, quality varies, no proof of production behavior | planned |
| Codex | coding agent | cloud/local via tool | PR-safe implementation, refactor, review | key by platform | code/workflow support | no repo secrets in prompts, review generated changes | demo |
| Cursor | coding agent | local | IDE-style assisted edits | optional | repository editing workflows | local-first preferred, keep large tasks scoped | mock |
| Claude Code | coding/architecture agent | cloud | architecture and long-form planning | key by platform | architecture notes and review logic | no credentials in docs, bounded scope | mock |
| Gemini | cloud provider | cloud | analysis, summaries, Q&A | key may be required | optional provider-aware path | backend-only in production designs | planned |
| OpenAI | cloud provider | cloud | production-grade generation when enabled | key required | optional provider path | never expose keys in frontend | planned |
| GitHub Copilot | coding assistant | cloud | completion support | key required | optional local coding support | must follow repo AGENTS governance | planned |
| OpenRouter | model multiplexer | cloud | provider abstraction experiments | key required | router concept experiments | no live routing without backend gate | planned |
| LM Studio | local model runner | local | offline experimentation | no | optional local experiments | optional dependency, no claim of performance | planned |
| Obsidian | knowledge tool | local | second-brain navigation | no | vault and note workflows | no private content in committed paths | reviewed |
| Future MCP tools | plugin tools | local/cloud | extension experiments | varies | plugin ecosystem research | treat as planned until verified | planned |

## Which tool for which SEIS task

- Code recovery: Codex, Cursor
- Documentation reconstruction: Ollama, local prompts, Codex
- Architecture reasoning: Claude Code, Gemini, Codex
- Safety checklists and governance: local prompt + human review
- Obsidian organization: Obsidian + SEIS Brain maintenance routines

## Future integration notes

- keep tool statuses as `mock`, `planned`, `demo`, or `disabled`
- treat provider claims as conditional on backend evidence
- never claim live inference without validation artifacts
