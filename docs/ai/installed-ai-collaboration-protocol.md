# Installed AI Collaboration Protocol

## Purpose

SEIS can benefit from multiple installed AI tools, but only if their roles are
bounded, evidence-led, and honest. This protocol defines how Codex, ChatGPT,
Claude Code, Cursor, Gemini, Qwen-style reviewers, Ollama/local models, and
other installed AI surfaces should collaborate without creating unsafe writes,
secret exposure, fake live-provider claims, or uncontrolled rewrites.

This document is an operating contract. It does not call providers, train
models, authenticate connectors, enable background agents, or grant runtime
authority.

## Collaboration Modes

| Mode | Meaning | Allowed output | Forbidden output |
| --- | --- | --- | --- |
| `writer` | One assistant owns the current repo edit. | Small commits, scoped PRs, validation reports. | Parallel edits by another AI, direct main commits, force push. |
| `reviewer` | Assistant reviews a diff, plan, or evidence packet. | Findings, risks, missing tests, counterarguments. | Unapproved file edits, merge approval, deployment approval. |
| `draft` | Assistant proposes text, plans, prompts, or UI ideas. | Candidate snippets clearly marked unreviewed. | Claims that the draft is implemented or validated. |
| `metadata-only` | Tool is represented by status records only. | Provider/tool state, requirements, blockers. | Live availability, authentication, or performance claims. |
| `local-demo` | Browser-local or repo-local behavior with no external calls. | Mock-safe UI, deterministic local artifacts, docs. | Live provider, SSH, deployment, or cloud-sync claims. |
| `approval-gated` | Action needs user authorization first. | Queue entry, risk note, exact approval need. | Silent execution, fake completion, workaround execution. |
| `disabled` | Intentionally unavailable for safety or scope. | Boundary statement and next safe action. | Attempts to bypass the disabled state. |

Exactly one assistant is `writer` at a time. Every other AI remains reviewer,
draft, metadata-only, local-demo, approval-gated, or disabled until an explicit
handoff changes the role.

## Current Default Roles

| AI/tool surface | Default SEIS role | Use for | Boundary |
| --- | --- | --- | --- |
| Codex / ChatGPT | `writer` for repo work | Branches, commits, validation, PR summaries, GitHub connector workflow | Must preserve user work, avoid secrets, and use PR flow. |
| Claude Code | `reviewer` | Architecture critique, risk review, long-context reasoning | No direct deploy, merge, push, or credential handling. |
| Cursor | `draft` or IDE-local reviewer | Scoped refactors, editor-local suggestions | One-writer rule applies; avoid broad context rewrites. |
| Gemini | `reviewer` or research checker | Docs/research cross-checks, Google ecosystem review | No credential or private data copying into repo docs. |
| Qwen-style assistants | `reviewer` | Alternative reasoning, contradiction, implementation critique | Output is untrusted until checked against repo evidence. |
| Ollama/local models | `local-demo` or `draft` | Offline summaries, prompt drafts, local reconstruction | Local-only; no private corpus leakage or training claim. |
| GitHub Copilot | IDE-local assist | Completion and small code suggestions | User IDE-scoped; not a repo authority. |
| OpenRouter/OpenAI/Anthropic providers | `metadata-only` unless backend verified | Provider registry and future router planning | Backend-only keys; missing key is not error. |

If a tool is not callable in the active session, keep it metadata-only or
planned even if it is installed locally.

## Handoff Requirements

Before changing the writer role, record:

1. Current branch and worktree status.
2. Exact files in scope.
3. Excluded files or user changes that must not be touched.
4. Validation already run.
5. Validation still required.
6. Known blockers and approval gates.
7. Rollback route.

The receiving AI must not edit until the handoff is understood and the current
state is checked.

## Safe Multi-AI Loop

1. Codex inspects the repo and selects the smallest reviewable slice.
2. Codex creates or uses a feature branch.
3. Reviewer AIs may draft risks, alternatives, or critique from sanitized
   context only.
4. Codex implements the accepted slice.
5. Codex validates with the smallest relevant checks first.
6. Codex opens a PR and records mock/local/real/planned states.
7. Auto-merge may be enabled only through branch protection and CI.

No AI may approve its own destructive action, expand its own permissions, hide
failed checks, or convert candidate output into source of truth without review.

## Prompt And Context Safety

- Do not include `.env` values, API keys, tokens, cookies, private SSH keys,
  service accounts, private notes, private user data, or unredacted credentials
  in prompts or handoff packets.
- Do not send private Obsidian vault bodies, local screenshots with secrets, or
  credential-bearing logs to cloud AIs.
- Use summaries, file paths, sanitized excerpts, and public-safe fixtures.
- Treat AI-generated output as untrusted until repository evidence supports it.

## Evidence Labels

Use these labels when reporting installed-AI work:

- `verified-current`: checked in the active turn.
- `memory-derived`: recalled from prior notes and may be stale.
- `repo-recorded`: documented in a repository file.
- `generated-local`: produced by a local script without external calls.
- `historical`: valid only for the prior run date.
- `blocked`: cannot proceed without user approval or external-state change.

Do not use `connected`, `live`, `ready`, or `trained` unless the evidence proves
that exact state in the current context.

## Approval Gates

Human approval is required before:

- live provider calls,
- API-key setup,
- connector authentication,
- model downloads,
- dataset downloads,
- training or fine-tuning,
- paid benchmarks,
- SSH execution,
- deployment,
- release/tag publication,
- GitHub branch protection changes,
- destructive file operations,
- history rewrite,
- public launch claims.

When approval is missing, record the next action as approval-gated in the PR
queue instead of simulating success.

## Validation

For installed-AI collaboration changes, use the relevant subset:

```bash
npm run check:seis-ai-workforce-training
npm run check:seis-agent-plugin-integration
npm run audit:ai-providers
git diff --check
```

Use browser smoke, provider audit, or MCP smoke only when the touched files and
runtime permissions justify the extra scope.

## Current Boundary

This protocol makes collaboration safer and more explicit. It does not prove
that Claude, Gemini, Qwen, Ollama, OpenRouter, OpenAI, Anthropic, or any other
provider was called in the current PR. It also does not make SEIS autonomous,
trained, deployed, public-ready, or production-ready.
