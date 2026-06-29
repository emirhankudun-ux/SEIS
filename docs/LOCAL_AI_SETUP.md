# SEIS Local AI / Ollama Setup

## Purpose

Provide a local, optional path for markdown drafting and context workflows.
Authoritative contract and policy details are in
[`SEIS_LOCAL_AI_OLLAMA.md`](../SEIS_LOCAL_AI_OLLAMA.md).

## What local AI is used for

- Markdown summarization
- context pack drafting
- documentation recovery
- local prototype experiments

## What local AI is not used for by default

- No production routing.
- No claim of trained-model capability for SEIS core.

## Minimal setup

1. Install Ollama locally
2. Run local endpoint service
3. Keep usage to optional helper workflows

## Safety

- Keep prompts free of secrets.
- Treat local outputs as draft until reviewed.
- Do not store private prompt payloads in repo artifacts.

## Continuation protocol for long outputs

If a long output cuts mid-flow, end at a clean boundary and write:

```text
CONTINUE_FROM: <section>
```

and continue only after `DEVAM`.

## No-key guarantee

The core SEIS demo does not require local AI to start.
