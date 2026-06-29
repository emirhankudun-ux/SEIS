# SEIS Local AI / Ollama Contract

## Purpose

SEIS uses Ollama as a safe, optional, local-AI concept for markdown recovery,
documentation scaffolding, and local context reconstruction. It is **not** required
for the core zero-key demo.

## Why Ollama exists in SEIS

- Keep local/offline experimentation available when a cloud provider is not
  configured.
- Help build and review non-sensitive project summaries, checklists, and seed
  notes.
- Support continuity workflows for long horizon work without external calls.

## Local model and endpoint concept

- Endpoint: local-only service URL (e.g., `http://127.0.0.1:11434`)
- Routing mode: local helper mode only
- Default policy:
  - No secrets in prompts.
  - No private or personal project data unless explicitly approved for local use.
  - Local outputs are draft by default.

## What Ollama is and is not used for

Used for:

- repo-safe markdown drafting
- context pack/notes generation drafts
- local docs summarization
- local architecture summaries

Not used for:

- production routing
- model training ownership claims
- credential handling
- replacing security reviews or approvals

## Local AI use cases in SEIS

- memory reconstruction notes
- Obsidian note structure proposals
- context-pack draft generation
- architecture summaries
- long-context breakdown (with continuation protocol)
- local-only PR-safe documentation pass

## Safety boundary

- No model/provider keys are stored in the browser or repository for Ollama.
- No API routing to external services from this contract path.
- All local outputs are labeled as draft until reviewed.
- Never claim a local model output as authoritative without review.

## Continuation protocol

If a long output reaches a clean break, stop with:

```text
CONTINUE_FROM: <section or file>
```

Then continue on request (for example `DEVAM`).

## Provider status in local-only mode

If Ollama is not running, SEIS continues in Local Demo mode and keeps all other
demo surfaces interactive.
