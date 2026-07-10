# SEIS Local AI / Ollama Operational Policy

## Purpose

SEIS local AI work is a **draft-first** support lane for markdown recovery, local summarization, and context reconstruction. It does not replace provider or backend intelligence and must never be used as a verified production runtime.

## What local AI is for

- Documentation drafts and cleanup
- Context pack generation (draft mode)
- Repo note summarization
- Obsidian structure verification by local tools
- Local model experimentation for reproducibility

## What local AI is not

- Core proof of model training
- Certified live service provider for SEIS
- Secret-processing system
- Deployment or SSH execution system

## Safe operation model

- Status is metadata-first: `available` / `installed` / `unsupported` / `unknown`.
- SEIS core demo remains usable without local models.
- No provider keys are required for default demo operations.
- Treat every local output as draft unless explicitly reviewed.
- Never commit private prompt data or local private paths.

## Quick setup

1. Install Ollama (optional).
2. Run local service in your local machine.
3. Confirm local tooling works for non-authoritative tasks only.
4. Keep credentials and secrets out of prompts and prompts logs.

## Continuation protocol

For long outputs, stop at a clean boundary and mark:

```text
CONTINUE_FROM: <section>
```

Resume only after explicit `DEVAM` request.

## Security and governance

- `SEIS_LOCAL_AI_OLLAMA.md` is public-safe documentation only.
- No secrets or private credentials in local prompts.
- Local-first experimentation must never write to production artifacts directly.
- Any claim of verified local routing requires explicit evidence and script output.

## Demo status labels

- `demo`: safe local helper workflows
- `draft`: generated notes, summaries, prompts
- `planned`: future local orchestration integration
- `mock`: placeholder provider behavior
- `disabled`: not currently wired

