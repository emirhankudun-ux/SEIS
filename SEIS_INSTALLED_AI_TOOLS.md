# SEIS Installed AI Tools Registry

## Purpose

Track installed and usable AI tools with explicit status, safety rules, and
assignment guidance.

Collaboration rules for using all installed AI surfaces without unsafe writes,
fake readiness claims, or secret exposure are maintained in
[`docs/ai/installed-ai-collaboration-protocol.md`](docs/ai/installed-ai-collaboration-protocol.md).

## Tool categories

- Local model runners
- Coding agents
- Cloud providers
- Design/research assistants
- Knowledge/workflow assistants

## Tool registry

| Tool | Type | Local/Cloud | Best For | Requires Key | SEIS Usage | Safety Notes | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ollama | local runner | local | local docs, summaries, drafts | no | Local-first markdown workflows | Local-only; no secret material in prompts | available |
| Codex | coding agent | cloud | repo-safe implementation, repair, PR loop | account | Repo-safe coding and debugging | no secrets in prompts; follow AGENTS | available |
| Cursor | IDE assistant | cloud/local | scoped editing and refactors | account | Local IDE support | avoid broad contexts; preserve scope | available |
| Claude Code | architecture/code reviewer | cloud | architecture review and long reasoning | account | architecture and design review | no direct deploy/push | available |
| Gemini | cloud agent | cloud | docs/research checks | account | documentation and ecosystem research | no credentials in repo/prompts | planned |
| ChatGPT | cloud agent | cloud | planning and explanation | account | prompt drafting and triage support | no key claims without provider setup | available |
| GitHub Copilot | coding assistant | cloud | in-editor completions | account | coding assist | user IDE-scoped configuration only | planned |
| OpenRouter | provider gateway | cloud | provider experimentation | key | provider diversity exploration | no production routing without backend checks | unknown |
| LM Studio | local runner | local | local model testing | no | optional local benchmark/CLI experiments | no outbound secrets | planned |
| Obsidian | knowledge app | local | vault authoring and navigation | no | project knowledge continuity | public-safe notes only | available |
| OpenAI | cloud provider | cloud | generation/reasoning | key | provider-neutral future runtime routing concept | backend-only secrets | planned |
| Anthropic | cloud provider | cloud | long-form reasoning and review | key | alternative model exploration | backend-only secrets | planned |
| local model runners | local | local | context reconstruction | no | offline recovery workflows | no private corpus leakage | planned |

## Which tool to use for which SEIS task

- Stable docs editing: Codex, Claude Code (review), Cursor.
- PR governance and audit: AGENTS + Claude Code + Codex.
- Context pack generation: Ollama or ChatGPT (review mode).
- Note vault onboarding: Obsidian + Codex review.
- Local reconstruction experiments: Ollama.
- Provider comparison only: OpenRouter, OpenAI, Anthropic (reviewed, metadata-only).

## Safety notes

- No live provider credentials in frontend or committed prompt outputs.
- Use `status`/`mode` metadata for every tool-dependent action (demo/planned/mock).
- Any live provider claim must be backed by backend checks, not mock text.
- Exactly one assistant may hold the repo writer role at a time; all other
  installed AI tools stay reviewer, draft, metadata-only, local-demo,
  approval-gated, or disabled until a documented handoff changes that role.
