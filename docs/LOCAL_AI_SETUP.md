# SEIS Local AI / Ollama Setup

## Purpose

Provide a local, optional path for markdown drafting and context workflows.

## When to use

- Local repository summarization before long PR descriptions.
- Context pack drafting for agent handoffs.
- Safe recovery drafts for architecture notes or feature writeups.

## What local AI is used for

- Markdown summarization
- context pack drafting
- documentation recovery
- local prototype experiments
- Obsidian note pre-drafting before human review.

## What local AI is not used for by default

- No production routing.
- No claim of trained-model capability for SEIS core.

## Minimal setup

1. Install Ollama locally
2. Start the local endpoint service (where your environment supports it)
3. Keep usage in optional helper workflows
4. Mark outcomes as `draft` until human review

## Safety

- Keep prompts free of secrets.
- Treat local outputs as draft until reviewed.
- Do not store private prompt payloads in repo artifacts.
- Do not store or request real SSH credentials, API keys, hostnames, or token values.

## Safe command examples (optional)

```bash
# Install Ollama (macOS/Linux examples; exact method is local-environment dependent)
# brew install ollama
# or official package installer for your platform

# Verify CLI
ollama --version

# Optional local model pull (user-provided model name)
# ollama pull <model-name>

# Verify local endpoint (if running)
# ollama serve
```

Use only public/open models and avoid any private repository payloads in prompt text.

## Local demo boundary

- Core SEIS demo remains runnable without any local model installed.
- If local AI is unavailable, skip these steps and continue with Local Demo workflow.
- No local model output is considered authoritative until reviewed.

## Continuation protocol for long outputs

If a long output cuts mid-flow, end at a clean boundary and write:

```text
CONTINUE_FROM: <section>
```

and continue only after:

```text
DEVAM
```

Then continue from that last boundary. Keep continuation notes in draft state until review.
